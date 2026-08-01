// src/components/common/ProfileDetails.tsx
import React from "react";
import { User, Mail, GraduationCap, Building, Shield, Sparkles } from "lucide-react";

interface ProfileData {
  name?: string;
  email?: string;
  semester?: string;
  college?: string;
  avatarUrl?: string;
  role?: string; // Expected values: "student", "teacher", "admin"
}

interface ProfileDetailsProps {
  profile: ProfileData | null;
}

const getRoleDisplay = (role?: string) => {
  switch (role?.toLowerCase()) {
    case "student":
      return "Student (S)";
    case "teacher":
      return "Teacher (T)";
    case "admin":
      return "Admin (A)";
    default:
      return "-";
  }
};

const ProfileDetails: React.FC<ProfileDetailsProps> = ({ profile }) => {
  if (!profile) {
    return (
      <section
        aria-live="polite"
        className="w-full max-w-md bg-white/95 border border-slate-200/60 backdrop-blur-md rounded-3xl p-6 shadow-premium relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-200/10 rounded-full blur-2xl pointer-events-none" />
        <h2 className="text-base font-extrabold text-slate-800 flex items-center gap-2 border-b border-slate-50 pb-2 mb-4">
          <Sparkles className="w-4.5 h-4.5 text-indigo-500" />
          Profile Information
        </h2>
        <p className="text-center text-slate-400 py-8 font-bold text-xs uppercase tracking-wider">No profile data available</p>
      </section>
    );
  }

  return (
    <section
      aria-label="User profile information"
      className="w-full max-w-md bg-white/95 border border-slate-200/60 backdrop-blur-md rounded-3xl p-6 sm:p-8 shadow-premium relative overflow-hidden"
    >
      {/* Decorative Glow */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-200/10 rounded-full blur-2xl pointer-events-none" />

      <h2 className="text-base font-extrabold text-slate-800 flex items-center gap-2 border-b border-slate-50 pb-2 mb-6">
        <Sparkles className="w-4.5 h-4.5 text-indigo-500" />
        Profile Information
      </h2>

      {/* Avatar preview block */}
      {profile.avatarUrl && (
        <div className="flex flex-col items-center mb-6">
          <div className="relative w-24 h-24 flex items-center justify-center rounded-full p-1 bg-gradient-to-tr from-indigo-500 via-indigo-600 to-purple-600 shadow-lg">
            <img
              src={profile.avatarUrl}
              alt={`${profile.name || "User"}'s avatar`}
              className="w-full h-full rounded-full object-cover border-2 border-white shadow-inner"
              loading="lazy"
            />
          </div>
        </div>
      )}

      {/* Metadata list */}
      <div className="space-y-3.5">
        
        {/* Name item */}
        <div className="flex items-center gap-3 p-3 bg-slate-50/70 border border-slate-100 rounded-2xl">
          <User className="w-5 h-5 text-indigo-500 flex-shrink-0" />
          <div className="min-w-0">
            <span className="block text-[8px] font-extrabold text-slate-400 uppercase tracking-widest">Full Name</span>
            <span className="text-xs font-bold text-slate-700 truncate block">{profile.name || "-"}</span>
          </div>
        </div>

        {/* Email item */}
        <div className="flex items-center gap-3 p-3 bg-slate-50/70 border border-slate-100 rounded-2xl">
          <Mail className="w-5 h-5 text-indigo-500 flex-shrink-0" />
          <div className="min-w-0">
            <span className="block text-[8px] font-extrabold text-slate-400 uppercase tracking-widest">Email Address</span>
            <span className="text-xs font-bold text-slate-700 truncate block">{profile.email || "-"}</span>
          </div>
        </div>

        {/* Semester item */}
        <div className="flex items-center gap-3 p-3 bg-slate-50/70 border border-slate-100 rounded-2xl">
          <GraduationCap className="w-5 h-5 text-indigo-500 flex-shrink-0" />
          <div className="min-w-0">
            <span className="block text-[8px] font-extrabold text-slate-400 uppercase tracking-widest">Current Semester</span>
            <span className="text-xs font-bold text-slate-700 truncate block">
              {profile.semester ? `Semester ${profile.semester}` : "-"}
            </span>
          </div>
        </div>

        {/* College item */}
        <div className="flex items-center gap-3 p-3 bg-slate-50/70 border border-slate-100 rounded-2xl">
          <Building className="w-5 h-5 text-indigo-500 flex-shrink-0" />
          <div className="min-w-0">
            <span className="block text-[8px] font-extrabold text-slate-400 uppercase tracking-widest">Institution College</span>
            <span className="text-xs font-bold text-slate-700 truncate block">{profile.college || "-"}</span>
          </div>
        </div>

        {/* Role item */}
        <div className="flex items-center gap-3 p-3 bg-slate-50/70 border border-slate-100 rounded-2xl">
          <Shield className="w-5 h-5 text-indigo-500 flex-shrink-0" />
          <div className="min-w-0">
            <span className="block text-[8px] font-extrabold text-slate-400 uppercase tracking-widest">Access Role</span>
            <span className="text-xs font-bold text-indigo-600 truncate block">{getRoleDisplay(profile.role)}</span>
          </div>
        </div>

      </div>
    </section>
  );
};

export default ProfileDetails;
