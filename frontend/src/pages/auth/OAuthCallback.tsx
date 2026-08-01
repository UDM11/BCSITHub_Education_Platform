import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { setAuthSession } from "../../lib/apiClient";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-hot-toast";

export default function OAuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { reloadUser } = useAuth();

  useEffect(() => {
    const token = searchParams.get("token");
    const userStr = searchParams.get("user");

    if (token && userStr) {
      try {
        const user = JSON.parse(decodeURIComponent(userStr));
        setAuthSession(token, user);
        
        // Reload authentication state and redirect
        reloadUser().then(() => {
          toast.success("Successfully signed in!");
          navigate("/");
        }).catch((err) => {
          console.error("Error reloading user session:", err);
          toast.error("Failed to load user session.");
          navigate("/signin");
        });
      } catch (e) {
        console.error("Error parsing user payload:", e);
        toast.error("Failed to parse user session payload.");
        navigate("/signin");
      }
    } else {
      toast.error("Authentication parameters were missing.");
      navigate("/signin");
    }
  }, [searchParams, navigate, reloadUser]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center space-y-4">
        <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-600 rounded-full animate-spin" />
        <p className="text-slate-600 text-sm font-bold animate-pulse">Completing authentication...</p>
      </div>
    </div>
  );
}
