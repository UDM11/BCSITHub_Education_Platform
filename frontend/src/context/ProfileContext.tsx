// src/context/ProfileContext.tsx
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { useAuth } from "./AuthContext";
import { apiClient } from "../lib/apiClient";

export interface ProfileData {
  id?: string;
  name: string;
  email: string;
  semester: string;
  college: string;
  avatarUrl?: string;
  role: "student" | "teacher" | "admin";
}

interface ProfileContextType {
  profile: ProfileData | null;
  loading: boolean;
  error: string | null;
  updateProfile: (data: Partial<ProfileData>) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const ProfileContext = createContext<ProfileContextType>({
  profile: null,
  loading: true,
  error: null,
  updateProfile: async () => {},
  refreshProfile: async () => {},
});

export const useProfile = () => useContext(ProfileContext);

interface ProfileProviderProps {
  children: ReactNode;
}

export const ProfileProvider: React.FC<ProfileProviderProps> = ({ children }) => {
  const { user, reloadUser } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const syncProfileFromUser = useCallback(() => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const mappedProfile: ProfileData = {
        id: user.id,
        name: user.name || "Anonymous",
        email: user.email || "",
        semester: user.semester?.toString() || "1",
        college: user.college || "",
        avatarUrl: user.avatar_url || "",
        role: ["student", "teacher", "admin"].includes(user.role)
          ? (user.role as "student" | "teacher" | "admin")
          : "student",
      };
      setProfile(mappedProfile);
    } catch (err) {
      console.error("❌ Failed to parse profile:", err);
      setError("Failed to parse user profile.");
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const updateProfile = useCallback(
    async (data: Partial<ProfileData>) => {
      if (!user) return;

      try {
        // Map camelCase frontend fields to snake_case backend fields
        const payload: Record<string, any> = {};
        if (data.name !== undefined) payload.name = data.name;
        if (data.semester !== undefined) payload.semester = parseInt(data.semester, 10);
        if (data.college !== undefined) payload.college = data.college;
        if (data.avatarUrl !== undefined) payload.avatar_url = data.avatarUrl;
        if (data.role !== undefined) payload.role = data.role;

        const updatedUser = await apiClient.put("/auth/profile", payload);
        
        // Update user state in AuthContext to synchronize the changes
        await reloadUser();
        
        const mappedProfile: ProfileData = {
          id: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email,
          semester: updatedUser.semester.toString(),
          college: updatedUser.college || "",
          avatarUrl: updatedUser.avatar_url || "",
          role: updatedUser.role,
        };
        setProfile(mappedProfile);
      } catch (err: any) {
        console.error("❌ Error updating profile:", err.message || err);
      }
    },
    [user, reloadUser]
  );

  useEffect(() => {
    syncProfileFromUser();
  }, [syncProfileFromUser]);

  return (
    <ProfileContext.Provider
      value={{
        profile,
        loading,
        error,
        updateProfile,
        refreshProfile: reloadUser,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
};
