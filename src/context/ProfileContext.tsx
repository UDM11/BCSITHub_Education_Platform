import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
  useRef,
} from "react";
import Backendless from "backendless";
import { useAuth } from "./AuthContext";

export interface ProfileData {
  objectId?: string;
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
  const { user } = useAuth(); // user is from Backendless
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const fetchProfile = useCallback(async () => {
    if (!user?.objectId && !user?.id) {
      setProfile(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const userId = user.objectId || user.id;

    try {
      const queryBuilder = Backendless.DataQueryBuilder.create();
      queryBuilder.setWhereClause(`objectId = '${userId}'`);
      queryBuilder.setPageSize(1);

      const results = await Backendless.Data.of("Users").find(queryBuilder);

      if (results.length > 0) {
        const fetchedProfile = results[0] as ProfileData;

        // Fallback role safety
        fetchedProfile.role = ["student", "teacher", "admin"].includes(fetchedProfile.role)
          ? fetchedProfile.role
          : "student";

        if (mountedRef.current) setProfile(fetchedProfile);
      } else {
        // Create new profile if not found
        const newProfile: ProfileData = {
          objectId: userId,
          name: user.name || "Anonymous",
          email: user.email || "",
          semester: "",
          college: "",
          avatarUrl: "",
          role: "student",
        };

        const savedProfile = await Backendless.Data.of("Users").save(newProfile);
        if (mountedRef.current) setProfile(savedProfile);
      }
    } catch (err) {
      console.error("❌ Failed to fetch profile:", err);
      if (mountedRef.current) {
        setError("Failed to fetch profile.");
        setProfile(null);
      }
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [user]);

  const updateProfile = useCallback(
    async (data: Partial<ProfileData>) => {
      const userId = user?.objectId || user?.id;
      if (!userId) return;

      try {
        const payload = {
          objectId: userId,
          ...data
        };

        if (payload.role) {
          payload.role = ["student", "teacher", "admin"].includes(payload.role)
            ? payload.role
            : "student";
        }

        const saved = await Backendless.Data.of("Users").save(payload);
        if (mountedRef.current) {
          setProfile(prev => prev ? { ...prev, ...saved } : (saved as ProfileData));
        }
      } catch (err) {
        console.error("❌ Error updating profile:", err);
      }
    },
    [user]
  );

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return (
    <ProfileContext.Provider
      value={{
        profile,
        loading,
        error,
        updateProfile,
        refreshProfile: fetchProfile,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
};
