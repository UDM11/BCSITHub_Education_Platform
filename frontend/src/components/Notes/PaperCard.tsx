// src/components/Notes/PaperCard.tsx
import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Download } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { apiClient } from '../../lib/apiClient';
import { watermarkFile } from '../../lib/watermark';
import LoginRedirectModal from '../common/LoginRedirectModal';
import { toast } from 'sonner';

type Paper = {
  objectId: string;
  title: string;
  fileUrl: string;
  downloads: number;
};

interface Props {
  paper: Paper;
}

export const PaperCard: React.FC<Props> = ({ paper }) => {
  const { isAuthenticated } = useAuth();
  const [showModal, setShowModal] = useState(false);

  const handleDownload = async () => {
    if (!isAuthenticated) {
      setShowModal(true);
      return;
    }

    if (!paper.fileUrl) {
      toast.error("File URL is missing or invalid.");
      return;
    }

    try {
      // Fetch file as blob
      const response = await fetch(paper.fileUrl);
      if (!response.ok) throw new Error("Failed to fetch file directly.");
      const originalBlob = await response.blob();

      // Apply watermark and convert image to PDF if it is an image
      const watermarkedBlob = await watermarkFile(originalBlob, "BCSITHub", true);
      const blobUrl = window.URL.createObjectURL(watermarkedBlob);

      // Create download link
      const link = document.createElement('a');
      link.href = blobUrl;
      
      let ext = 'pdf';
      if (watermarkedBlob.type === "application/pdf") {
        ext = "pdf";
      } else {
        const urlParts = paper.fileUrl.split('?')[0].split('.');
        ext = urlParts.length > 1 ? urlParts[urlParts.length - 1] : 'pdf';
      }
      const safeTitle = paper.title.replace(/[^a-zA-Z0-9\s-_]/g, '').trim();
      link.download = `${safeTitle}.${ext}`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);

      // Update download count
      await apiClient.post(`/papers/${paper.objectId}/download`, {});
    } catch (err) {
      console.error("Watermarked download failed, falling back to redirect:", err);
      window.open(paper.fileUrl, '_blank');
      try {
        await apiClient.post(`/papers/${paper.objectId}/download`, {});
      } catch (postErr) {
        console.error('Failed to update download count:', postErr);
      }
    }
  };

  return (
    <>
      <div className="bg-white shadow-md rounded-lg p-4 dark:bg-zinc-900 flex flex-col justify-between h-full">
        <div>
          <h3 className="font-semibold text-lg mb-2 text-zinc-900 dark:text-zinc-100">
            {paper.title}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Downloads: {paper.downloads}
          </p>
        </div>
        <Button
          icon={Download}
          className="w-full mt-auto"
          onClick={handleDownload}
        >
          {isAuthenticated ? 'Download Paper' : 'Login Required'}
        </Button>
      </div>

      {/* 🔐 Login modal for unauthenticated users */}
      <LoginRedirectModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </>
  );
};
