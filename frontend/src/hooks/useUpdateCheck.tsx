import React, { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { toast } from "react-hot-toast";

export function useUpdateCheck() {
  const location = useLocation();
  const currentVersion = useRef<string | null>(null);
  const isUpdateFound = useRef(false);

  const fetchVersion = async (): Promise<string | null> => {
    try {
      const response = await fetch(`/version.json?t=${Date.now()}`);
      if (!response.ok) return null;
      const data = await response.json();
      return data.version || null;
    } catch (error) {
      console.error("Failed to check for updates:", error);
      return null;
    }
  };

  const showUpdateToast = () => {
    if (isUpdateFound.current) return;
    isUpdateFound.current = true;

    toast(
      (t) => (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <strong style={{ color: "#0f172a", fontSize: "0.95rem" }}>🚀 New Update Available!</strong>
          <span style={{ color: "#475569", fontSize: "0.85rem" }}>
            Notes and components have been updated. Click below to load the latest changes.
          </span>
          <button
            onClick={() => window.location.reload()}
            style={{
              background: "#4f46e5",
              color: "white",
              border: "none",
              padding: "6px 12px",
              borderRadius: "6px",
              fontWeight: 600,
              fontSize: "0.8rem",
              cursor: "pointer",
              alignSelf: "flex-start",
              marginTop: "4px",
            }}
          >
            Update Now
          </button>
        </div>
      ),
      {
        duration: Infinity,
        position: "bottom-right",
        style: {
          padding: "16px",
          borderRadius: "12px",
          background: "#ffffff",
          boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
          border: "1px solid #e2e8f0",
          maxWidth: "350px",
        },
      }
    );
  };

  const checkForUpdates = async () => {
    const serverVersion = await fetchVersion();
    if (!serverVersion) return;

    if (!currentVersion.current) {
      currentVersion.current = serverVersion;
    } else if (currentVersion.current !== serverVersion) {
      showUpdateToast();
    }
  };

  useEffect(() => {
    checkForUpdates();
  }, [location.pathname]);

  useEffect(() => {
    const interval = setInterval(() => {
      checkForUpdates();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);
}
