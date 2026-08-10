import { PDFDocument, rgb, degrees, StandardFonts } from "pdf-lib";

/**
 * Adds a diagonal "BCSITHub" watermark to all pages of a PDF document.
 */
export async function addWatermarkToPdf(pdfBlob: Blob, watermarkText = "BCSITHub"): Promise<Blob> {
  try {
    const arrayBuffer = await pdfBlob.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    const HelveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const pages = pdfDoc.getPages();

    for (const page of pages) {
      const { width, height } = page.getSize();
      
      // Calculate a responsive font size based on page dimensions
      const fontSize = Math.min(width, height) / 6.5;
      
      // Calculate rotation and center position
      const textWidth = HelveticaBold.widthOfTextAtSize(watermarkText, fontSize);
      const textHeight = HelveticaBold.heightAtSize(fontSize);
      
      // Place the watermark text centered diagonally (45 degrees)
      // Since rotation pivots on (x, y), we adjust slightly to keep it centered
      const rad = 45 * Math.PI / 180;
      const x = (width - (textWidth * Math.cos(rad) - textHeight * Math.sin(rad))) / 2 - 30;
      const y = (height - (textWidth * Math.sin(rad) + textHeight * Math.cos(rad))) / 2 + 10;

      page.drawText(watermarkText, {
        x: x,
        y: y,
        size: fontSize,
        font: HelveticaBold,
        color: rgb(0.65, 0.65, 0.65),
        opacity: 0.4, // Darker, bolder transparent watermark
        rotate: degrees(45),
      });
    }

    const watermarkedBytes = await pdfDoc.save();
    return new Blob([watermarkedBytes], { type: "application/pdf" });
  } catch (error) {
    console.error("PDF Watermark failed, returning original file:", error);
    return pdfBlob;
  }
}

/**
 * Adds a diagonal "BCSITHub" watermark to an image blob.
 */
export async function addWatermarkToImage(imageBlob: Blob, watermarkText = "BCSITHub"): Promise<Blob> {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(imageBlob);
    
    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(imageBlob);
        return;
      }
      
      // Draw the original image first
      ctx.drawImage(img, 0, 0);
      
      // Compute font size based on image height/width
      const fontSize = Math.min(canvas.width, canvas.height) / 7.5;
      ctx.font = `bold ${fontSize}px Helvetica, Arial, sans-serif`;
      ctx.fillStyle = "rgba(165, 165, 165, 0.45)"; // Darker opacity grey watermark for image exports
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      
      // Position the context in the center, rotate, and fill text
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate(-45 * Math.PI / 180);
      ctx.fillText(watermarkText, 0, 0);
      
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          resolve(imageBlob);
        }
      }, imageBlob.type || "image/jpeg");
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(imageBlob);
    };
    
    img.src = url;
  });
}

/**
 * Converts a JPEG/PNG image to a PDF page and adds the responsive watermark.
 */
export async function convertImageToPdfWithWatermark(imageBlob: Blob, watermarkText = "BCSITHub"): Promise<Blob> {
  try {
    const arrayBuffer = await imageBlob.arrayBuffer();
    const doc = await PDFDocument.create();
    
    let image;
    if (imageBlob.type === "image/png") {
      image = await doc.embedPng(arrayBuffer);
    } else {
      image = await doc.embedJpg(arrayBuffer);
    }
    
    const { width, height } = image.scale(1.0);
    const page = doc.addPage([width, height]);
    page.drawImage(image, {
      x: 0,
      y: 0,
      width: width,
      height: height,
    });
    
    // Draw responsive watermark
    const HelveticaBold = await doc.embedFont(StandardFonts.HelveticaBold);
    const fontSize = Math.min(width, height) / 6.5;
    const textWidth = HelveticaBold.widthOfTextAtSize(watermarkText, fontSize);
    const textHeight = HelveticaBold.heightAtSize(fontSize);
    const rad = 45 * Math.PI / 180;
    const x = (width - (textWidth * Math.cos(rad) - textHeight * Math.sin(rad))) / 2 - 30;
    const y = (height - (textWidth * Math.sin(rad) + textHeight * Math.cos(rad))) / 2 + 10;
    
    page.drawText(watermarkText, {
      x: x,
      y: y,
      size: fontSize,
      font: HelveticaBold,
      color: rgb(0.65, 0.65, 0.65),
      opacity: 0.4, // Darker, bolder transparent watermark
      rotate: degrees(45),
    });
    
    const pdfBytes = await doc.save();
    return new Blob([pdfBytes], { type: "application/pdf" });
  } catch (error) {
    console.error("Image to PDF conversion failed, running image watermark fallback:", error);
    return addWatermarkToImage(imageBlob, watermarkText);
  }
}

/**
 * Automatically applies a watermark based on file type, with optional image-to-PDF conversion.
 */
export async function watermarkFile(blob: Blob, watermarkText = "BCSITHub", convertToPdf = false): Promise<Blob> {
  if (blob.type === "application/pdf") {
    return addWatermarkToPdf(blob, watermarkText);
  } else if (blob.type.startsWith("image/")) {
    if (convertToPdf) {
      return convertImageToPdfWithWatermark(blob, watermarkText);
    } else {
      return addWatermarkToImage(blob, watermarkText);
    }
  }
  return blob;
}
