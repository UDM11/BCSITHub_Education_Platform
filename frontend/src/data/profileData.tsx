export interface ProfileData {
  name: string;
  email: string;
  semester: string;
  college: string;
  avatarUrl?: string;
  role?: "student" | "teacher" | "admin"; // Optional: for role-based access
  createdAt?: string;         // Optional: if you track account creation time
}
