// src/components/common/EditProfileForm.tsx
import React from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { User, Mail, GraduationCap, Building, Sparkles } from "lucide-react";

interface ProfileData {
  name: string;
  email: string;
  semester: string;
  college: string;
  avatarUrl?: string;
}

interface EditProfileFormProps {
  defaultValues: ProfileData;
  onSubmit: SubmitHandler<ProfileData>;
  isSubmitting: boolean;
}

const semesters = [
  { value: "1", label: "1st Semester" },
  { value: "2", label: "2nd Semester" },
  { value: "3", label: "3rd Semester" },
  { value: "4", label: "4th Semester" },
  { value: "5", label: "5th Semester" },
  { value: "6", label: "6th Semester" },
  { value: "7", label: "7th Semester" },
  { value: "8", label: "8th Semester" },
];

const colleges = [
  { value: "Pokhara University", label: "Pokhara University" },
  { value: "Ace Institute of Management", label: "Ace Institute of Management" },
  { value: "SAIM College", label: "SAIM College" },
  { value: "Apollo International College", label: "Apollo International College" },
  { value: "Quest International College", label: "Quest International College" },
  { value: "Shubhashree College of Management", label: "Shubhashree College of Management" },
  { value: "Liberty College", label: "Liberty College" },
  { value: "Uniglobe College", label: "Uniglobe College" },
  { value: "Medhavi College", label: "Medhavi College" },
  { value: "Crimson College of Technology", label: "Crimson College of Technology" },
  { value: "Rajdhani Model College", label: "Rajdhani Model College" },
  { value: "Excel Business College", label: "Excel Business College" },
  { value: "Malpi International College", label: "Malpi International College" },
  { value: "Nobel College", label: "Nobel College" },
  { value: "Boston International College", label: "Boston International College" },
  { value: "Pokhara College of Management", label: "Pokhara College of Management" },
  { value: "Apex College", label: "Apex College" },
  { value: "Other", label: "Other College" },
];

const EditProfileForm: React.FC<EditProfileFormProps> = ({
  defaultValues,
  onSubmit,
  isSubmitting,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileData>({
    defaultValues,
  });

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="w-full max-w-md space-y-5 bg-white/95 border border-slate-200/60 backdrop-blur-md p-6 sm:p-8 rounded-3xl shadow-premium relative overflow-hidden"
    >
      {/* Decorative Glow */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-200/10 rounded-full blur-2xl pointer-events-none" />

      <h2 className="text-base font-extrabold text-slate-800 flex items-center gap-2 border-b border-slate-50 pb-2">
        <Sparkles className="w-4.5 h-4.5 text-indigo-500" />
        Modify Profile Fields
      </h2>

      {/* Name - Read Only */}
      <div className="space-y-1.5">
        <label htmlFor="name" className="text-xs font-bold text-slate-655 flex items-center gap-1.5">
          <User className="w-3.5 h-3.5 text-slate-400" />
          Full Name
        </label>
        <input
          id="name"
          type="text"
          {...register("name")}
          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-500 cursor-not-allowed focus:outline-none"
          disabled
        />
      </div>

      {/* Email - Read Only */}
      <div className="space-y-1.5">
        <label htmlFor="email" className="text-xs font-bold text-slate-655 flex items-center gap-1.5">
          <Mail className="w-3.5 h-3.5 text-slate-400" />
          Email Address
        </label>
        <input
          id="email"
          type="email"
          {...register("email")}
          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-500 cursor-not-allowed focus:outline-none"
          disabled
        />
      </div>

      {/* Semester - Editable */}
      <div className="space-y-1.5">
        <label htmlFor="semester" className="text-xs font-bold text-slate-655 flex items-center gap-1.5">
          <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
          Semester
        </label>
        <select
          id="semester"
          {...register("semester", { required: "Semester is required" })}
          className={`w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${
            errors.semester ? "border-red-500 ring-2 ring-red-200" : ""
          }`}
          disabled={isSubmitting}
        >
          <option value="">Select Semester</option>
          {semesters.map((sem) => (
            <option key={sem.value} value={sem.value}>
              {sem.label}
            </option>
          ))}
        </select>
        {errors.semester && (
          <p className="text-[10px] font-bold text-red-550 mt-1">{errors.semester.message}</p>
        )}
      </div>

      {/* College - Editable */}
      <div className="space-y-1.5">
        <label htmlFor="college" className="text-xs font-bold text-slate-655 flex items-center gap-1.5">
          <Building className="w-3.5 h-3.5 text-slate-400" />
          Institution College
        </label>
        <select
          id="college"
          {...register("college", { required: "College is required" })}
          className={`w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${
            errors.college ? "border-red-500 ring-2 ring-red-200" : ""
          }`}
          disabled={isSubmitting}
        >
          <option value="">Select College</option>
          {colleges.map((col) => (
            <option key={col.value} value={col.value}>
              {col.label}
            </option>
          ))}
        </select>
        {errors.college && (
          <p className="text-[10px] font-bold text-red-550 mt-1">{errors.college.message}</p>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:brightness-110 text-white font-extrabold text-xs py-3 rounded-xl shadow-md border-0 transition-all cursor-pointer flex items-center justify-center disabled:opacity-50 mt-2"
      >
        {isSubmitting ? "Saving Parameters..." : "Save Changes"}
      </button>
    </form>
  );
};

export default EditProfileForm;
