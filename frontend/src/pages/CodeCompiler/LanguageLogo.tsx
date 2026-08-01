import React from "react";

interface LanguageLogoProps {
  type: string;
  className?: string;
}

export function LanguageLogo({ type, className = "w-6 h-6" }: LanguageLogoProps) {
  const t = type.toLowerCase();

  switch (t) {
    case "html":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
          <path fill="#E34F26" d="M1.5 0h21l-1.9 21.2L12 24l-8.6-2.8L1.5 0z" />
          <path fill="#EF652A" d="M12 2.2v19.6l6.8-2.2 1.6-17.4H12z" />
          <path fill="#EFEFEF" d="M12 9.6H8.3V7h7.4V4.4H5.6v7.8H12V9.6zm0 5.2H9.3l-.2-2.1H6.5l.4 5.2 5.1 1.7v-4.8z" />
          <path fill="#FFFFFF" d="M12 12.2h5.1l-.5 5.2-4.6 1.5v-6.7zm0-5.2h4.7l-.4 2.6H12V7z" />
        </svg>
      );
    case "python":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none">
          <path d="M12 2c-5.5 0-5 2.5-5 2.5v2.2h5v.6H5.2S2 7 2 12.2c0 5.2 2.8 5 2.8 5h1.7v-2.5c0-2.8 2.3-5 5-5h2.5v-2.2S14.5 2 12 2z" fill="#3776AB" />
          <path d="M12 22c5.5 0 5-2.5 5-2.5v-2.2h-5v-.6h6.8s3.2.3 3.2-4.9c0-5.2-2.8-5-2.8-5h-1.7v2.5c0 2.8-2.3 5-5 5h-2.5v2.2s-.5 5.5 2 5.5z" fill="#FFD43B" />
        </svg>
      );
    case "javascript":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
          <rect width="24" height="24" fill="#F7DF1E" rx="3" />
          <path fill="#000000" d="M19.8 18.5c-.8.6-1.7.9-2.6.9-1.8 0-3-1-3-3.1h2.5c0 .9.5 1.3 1.1 1.3.6 0 .9-.3.9-.7V7.6h2.5v9.3c.1.7-.1 1.2-.4 1.6z" />
        </svg>
      );
    case "java":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none">
          <path d="M19.4 12c-1.3-.7-2.7-1.3-4-2 .8-1 1.5-2.2 2-3.5H16c-.4 1-.9 1.8-1.5 2.5-1-.7-2-1.4-3.2-2L12 6c1.2.7 2.3 1.4 3.3 2.2-.7 1-1.5 1.8-2.3 2.6H12c.7-.7 1.4-1.5 2-2.3-.8-.5-1.7-1-2.5-1.5-.7.8-1.5 1.5-2.4 2.2L8 8c1-.8 1.9-1.6 2.7-2.5-.8-.5-1.6-.9-2.5-1.3-.6.6-1.3 1.2-2 1.8L5 5c.8-.7 1.6-1.4 2.4-2L6 2C4.5 3 3.2 4.3 2 5.8l1.3 1.3C4.5 6 5.8 5 7.2 4.2c-.8.7-1.6 1.4-2.3 2.2l1.3 1.3c.7-.7 1.5-1.5 2.2-2.3.8.4 1.7.8 2.5 1.2-.8.8-1.6 1.7-2.5 2.5L9.6 10c.8-.8 1.7-1.7 2.5-2.5.8.5 1.7 1 2.5 1.5-.6.8-1.3 1.6-2 2.3h1.2c.6-.7 1.2-1.5 1.8-2.2 1.2.7 2.5 1.4 3.7 2l.1-.6z" fill="#EA2D42" />
          <path d="M3 17.5c0 2.5 4 4.5 9 4.5s9-2 9-4.5H3z" fill="#007396" />
        </svg>
      );
    case "mysql":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none">
          <path d="M12.11 3.07c-2.3 0-4.47.88-6.13 2.47a9.23 9.23 0 00-2.42 5.09c-.06.4-.04.81.07 1.2.3.99 1.15 1.7 2.18 1.83 1.03.13 2-.39 2.45-1.33l1.83-3.8c.45-.94 1.4-1.53 2.45-1.53 1.05 0 2 .59 2.45 1.53l1.83 3.8c.45.94 1.42 1.46 2.45 1.33 1.03-.13 1.88-.84 2.18-1.83.11-.39.13-.8.07-1.2a9.23 9.23 0 00-2.42-5.09c-1.66-1.59-3.83-2.47-6.13-2.47z" fill="#00758F" />
          <path d="M12.11 13.93c-1.28 0-2.3.8-2.3 1.8s1.02 1.8 2.3 1.8 2.3-.8 2.3-1.8-1.02-1.8-2.3-1.8z" fill="#F29111" />
        </svg>
      );
    case "c":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
          <path fill="#00599C" d="M12 2L2 6.5v11L12 22l10-4.5v-11L12 2z" />
          <path fill="#FFF" d="M12 6.5c-3 0-5.5 2.5-5.5 5.5s2.5 5.5 5.5 5.5c2.2 0 4-1.3 4.8-3.2h-2.2c-.6.8-1.5 1.3-2.6 1.3-1.9 0-3.5-1.6-3.5-3.5s1.6-3.5 3.5-3.5c1.1 0 2 .5 2.6 1.3h2.2c-.8-1.9-2.6-3.2-4.8-3.2z" />
        </svg>
      );
    case "cpp":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
          <path fill="#00599C" d="M12 2L2 6.5v11L12 22l10-4.5v-11L12 2z" />
          <path fill="#FFF" d="M11 6.5c-3 0-5.5 2.5-5.5 5.5s2.5 5.5 5.5 5.5c2.2 0 4-1.3 4.8-3.2h-2.2c-.6.8-1.5 1.3-2.6 1.3-1.9 0-3.5-1.6-3.5-3.5s1.6-3.5 3.5-3.5c1.1 0 2 .5 2.6 1.3h2.2c-.8-1.9-2.6-3.2-4.8-3.2zM16.5 11v-2.5h-1v2.5h-2.5v1h2.5v2.5h1v-2.5h2.5v-1h-2.5z" />
        </svg>
      );
    case "php":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
          <ellipse cx="12" cy="12" rx="12" ry="7.5" fill="#777BB4" />
          <path d="M7 14.5v-5h2.3c1 0 1.5.4 1.5 1.2 0 .8-.5 1.3-1.5 1.3H8.3v2.5H7zm1.3-3.5h1c.4 0 .6-.1.6-.4 0-.3-.2-.4-.6-.4h-1V11zm5.7 3.5v-5h1.2V11h1.5v-1.5H18v5h-1.2v-2h-1.5v2h-1.3zm6.5 0v-5h2.3c1 0 1.5.4 1.5 1.2 0 .8-.5 1.3-1.5 1.3h-1.1v2.5H20.5zm1.2-3.5h1c.4 0 .6-.1.6-.4 0-.3-.2-.4-.6-.4h-1V11z" fill="#FFF" />
        </svg>
      );
    case "csharp":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
          <rect width="24" height="24" fill="#178600" rx="3" />
          <path fill="#FFFFFF" d="M12 5.5c-3.6 0-6.5 2.9-6.5 6.5s2.9 6.5 6.5 6.5c2.2 0 4-1.3 4.8-3.2h-2.2c-.6.8-1.5 1.3-2.6 1.3-1.9 0-3.5-1.6-3.5-3.5S8.5 9 10.4 9c1.1 0 2 .5 2.6 1.3h2.2c-.8-1.9-2.6-3.2-4.8-3.2z" />
        </svg>
      );
    case "assembly":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
          <path fill="#00529B" d="M12 2L2 22h20L12 2zm0 4l6.5 13H5.5L12 6z" />
        </svg>
      );
    case "lua":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
          <circle fill="#000080" cx="12" cy="12" r="11" />
          <circle fill="#FFFFFF" cx="12" cy="12" r="8" />
          <circle fill="#000080" cx="14" cy="10" r="3" />
          <circle fill="#808080" cx="20" cy="6" r="1.5" />
        </svg>
      );
    case "plsql":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
          <path fill="#F80000" d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 16c-3.3 0-6-2.7-6-6s2.7-6 6-6 6 2.7 6 6-2.7 6-6 6z" />
        </svg>
      );
    case "nodejs":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none">
          <path d="M12 2L3 7.2v9.6l9 5.2 9-5.2V7.2L12 2zm6.9 14.2l-6.9 4-6.9-4V8.8l6.9-4 6.9 4v7.4z" fill="#339933" />
          <path d="M12 6.5l-4.5 2.6v5.2l4.5 2.6 4.5-2.6V9.1L12 6.5z" fill="#339933" />
        </svg>
      );
    case "mongodb":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none">
          <path d="M12.3 1c-.1 0-.1.1-.1.2v21.5c0 .1.1.2.1.2 1.3-2.5 3.7-5.5 3.7-9.5s-2.4-9.9-3.7-12.4z" fill="#13AA52" />
          <path d="M11.7 1c.1 0 .1.1.1.2v21.5c0 .1-.1.2-.1.2C10.4 20.4 8 17.4 8 13.4s2.4-9.9 3.7-12.4z" fill="#499D4A" />
        </svg>
      );
    case "groovy":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
          <path fill="#4298B5" d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.6 0 12 0zm-2 16H8V8h2v8zm6 0h-2v-4h2v4z" />
        </svg>
      );
    case "react":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none">
          <ellipse cx="12" cy="12" rx="11" ry="4.2" stroke="#61DAFB" strokeWidth="1.2" transform="rotate(30 12 12)" />
          <ellipse cx="12" cy="12" rx="11" ry="4.2" stroke="#61DAFB" strokeWidth="1.2" transform="rotate(90 12 12)" />
          <ellipse cx="12" cy="12" rx="11" ry="4.2" stroke="#61DAFB" strokeWidth="1.2" transform="rotate(150 12 12)" />
          <circle cx="12" cy="12" r="1.8" fill="#61DAFB" />
        </svg>
      );
    case "postgresql":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none">
          <path d="M19.5 8c-1.5-1.5-3.5-2.5-6-2.5-4 0-7 2.5-7 6.5s2 6.5 6 6.5c3.5 0 5.5-2 6.5-4.5h-3.5c-.7 1-1.7 1.5-3 1.5-2.2 0-3.5-1.3-3.5-3.5S10.3 9 12.5 9c1.5 0 2.5.7 3 1.8h4z" fill="#336791" />
        </svg>
      );
    case "ruby":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none">
          <path d="M6 3h12l5 6.5L12 22 1 9.5 6 3z" fill="#CC342D" />
          <path d="M12 3v19L23 9.5 18 3H12z" fill="#E84F35" />
        </svg>
      );
    default:
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
        </svg>
      );
  }
}
