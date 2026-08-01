// src/components/common/AvatarInitials.tsx
import React from "react";

interface AvatarProps {
  role?: string; // 'student', 'teacher', 'admin' or undefined
  size?: number; // optional, default is 120px
}

const getRoleConfig = (role: string = "") => {
  switch (role.toLowerCase()) {
    case "student":
      return {
        initial: "S",
        gradient: "from-blue-500 via-indigo-500 to-indigo-600",
      };
    case "teacher":
      return {
        initial: "T",
        gradient: "from-emerald-500 via-teal-600 to-indigo-600",
      };
    case "admin":
      return {
        initial: "A",
        gradient: "from-rose-500 via-indigo-600 to-purple-600",
      };
    default:
      return {
        initial: "S",
        gradient: "from-slate-400 to-slate-600",
      };
  }
};

const AvatarInitials: React.FC<AvatarProps> = ({ role, size = 120 }) => {
  const { initial, gradient } = getRoleConfig(role);

  return (
    <div
      role="img"
      aria-label={`${role || "user"} avatar initial`}
      className={`bg-gradient-to-tr ${gradient} rounded-full flex items-center justify-center font-black border-2 border-white shadow-lg select-none`}
      style={{
        width: size,
        height: size,
        fontSize: size / 2.2,
      }}
    >
      <span className="text-white tracking-tight leading-none">
        {initial}
      </span>
    </div>
  );
};

export default AvatarInitials;
