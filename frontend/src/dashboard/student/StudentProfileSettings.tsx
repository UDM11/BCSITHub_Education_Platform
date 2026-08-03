// src/dashboard/student/StudentProfileSettings.tsx
import React, { useState } from "react";
import { Card, CardContent } from "../../components/ui/Card";
import { 
  User, Mail, GraduationCap, Building, Shield, Sparkles, 
  Settings, Save, X, Edit3, Award, CheckCircle2, AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface StudentProfileSettingsProps {
  profile: any;
  isEditing: boolean;
  setIsEditing: (editing: boolean) => void;
  isSubmitting: boolean;
  handleProfileUpdate: (data: any) => Promise<void>;
}

const StudentProfileSettings: React.FC<StudentProfileSettingsProps> = ({
  profile,
  isEditing,
  setIsEditing,
  isSubmitting,
  handleProfileUpdate,
}) => {
  const [formData, setFormData] = useState({
    name: profile?.name || "",
    email: profile?.email || "",
    semester: profile?.semester || "",
    college: profile?.college || "",
  });

  const [validationError, setValidationError] = useState("");

  const semesters = [
    "1st Semester", "2nd Semester", "3rd Semester", "4th Semester",
    "5th Semester", "6th Semester", "7th Semester", "8th Semester"
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError("");

    if (!formData.name.trim()) {
      setValidationError("Full Name is required");
      return;
    }

    try {
      await handleProfileUpdate({
        name: formData.name,
        semester: formData.semester,
        college: formData.college,
      });
      setIsEditing(false);
    } catch (err) {
      console.error(err);
    }
  };

  const getInitials = (nameString?: string) => {
    if (!nameString) return "S";
    const parts = nameString.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
      
      {/* LEFT COLUMN: Visual Profile Overview Card */}
      <div className="lg:col-span-4 space-y-6">
        <Card className="border border-slate-200/60 shadow-premium bg-white rounded-3xl overflow-hidden">
          <div className="h-28 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 relative">
            <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md text-white text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border border-white/20">
              Active Member
            </div>
          </div>
          <CardContent className="p-6 text-center -mt-12 relative z-10 space-y-4">
            <div className="w-20 h-20 mx-auto rounded-full p-1 bg-white shadow-md">
              <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center overflow-hidden border border-slate-100">
                {profile?.avatarUrl ? (
                  <img src={profile.avatarUrl} alt={profile.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl font-black text-white">{getInitials(profile?.name)}</span>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-base font-black text-slate-800">{profile?.name || "Student"}</h3>
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mt-0.5">{profile?.college || "Unassigned College"}</span>
            </div>

            <div className="border-t border-slate-100 pt-4 flex justify-around items-center text-slate-500">
              <div className="text-center">
                <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest">Semester</span>
                <span className="text-xs font-black text-slate-800 mt-1 block">{profile?.semester ? profile.semester.split(" ")[0] : "N/A"}</span>
              </div>
              <div className="w-px h-6 bg-slate-100" />
              <div className="text-center">
                <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest">Auth Level</span>
                <span className="text-xs font-black text-slate-805 mt-1 block flex items-center gap-1">
                  <Shield className="w-3 h-3 text-indigo-500" /> Student
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Banner */}
        <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex gap-3 text-slate-500 text-[10px] font-semibold leading-relaxed">
          <Shield className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5" />
          <div>
            <span className="block font-black text-slate-700 uppercase tracking-wider mb-0.5">Academic Data Locking</span>
            <span>Submissions and portal account data are locked securely. To change your registered email address, please contact support.</span>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Configuration Form */}
      <div className="lg:col-span-8">
        <Card className="border border-slate-200/60 shadow-premium bg-white rounded-3xl p-1 h-full">
          <CardContent className="p-6 sm:p-8 space-y-6">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-50 border border-indigo-100/50 rounded-xl flex items-center justify-center text-indigo-600">
                  <Settings className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-slate-800">Account Preferences</h2>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Modify profile credentials</p>
                </div>
              </div>

              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-1.5 bg-indigo-50 text-indigo-600 border border-indigo-100 hover:bg-indigo-100 text-xs font-extrabold px-4 py-2.5 rounded-xl cursor-pointer transition-all"
                >
                  <Edit3 className="w-4 h-4" />
                  Edit Settings
                </button>
              )}
            </div>

            {validationError && (
              <div className="bg-rose-50 border border-rose-100 rounded-xl p-3.5 flex items-center gap-2.5 text-rose-600 text-xs font-bold">
                <AlertCircle className="w-4.5 h-4.5" />
                {validationError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Full Name */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Full Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      disabled={!isEditing}
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none w-full bg-slate-50/50 disabled:bg-slate-100/50 disabled:text-slate-400 font-bold text-slate-700"
                    />
                  </div>
                </div>

                {/* Email Address */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Email Address (Read-only)</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      disabled
                      value={formData.email}
                      className="pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-xs outline-none w-full bg-slate-100/50 text-slate-400 font-bold"
                    />
                  </div>
                </div>

                {/* Semester */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Current Semester</label>
                  <div className="relative">
                    <GraduationCap className="w-4.5 h-4.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 z-10" />
                    <select
                      disabled={!isEditing}
                      value={formData.semester}
                      onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                      className="pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none w-full bg-slate-50/50 disabled:bg-slate-100/50 disabled:text-slate-400 font-bold text-slate-700 appearance-none"
                    >
                      <option value="">Select Semester</option>
                      {semesters.map((sem) => (
                        <option key={sem} value={sem}>{sem}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* College */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Affiliated College</label>
                  <div className="relative">
                    <Building className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      disabled={!isEditing}
                      value={formData.college}
                      placeholder="e.g. Liberty College"
                      onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                      className="pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none w-full bg-slate-50/50 disabled:bg-slate-100/50 disabled:text-slate-400 font-bold text-slate-700"
                    />
                  </div>
                </div>
              </div>

              <AnimatePresence>
                {isEditing && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="flex items-center gap-3 pt-5 border-t border-slate-100"
                  >
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs px-5 py-3 rounded-xl shadow-md border-0 transition-all cursor-pointer disabled:opacity-50"
                    >
                      <Save className="w-4 h-4" />
                      {isSubmitting ? "Saving..." : "Save Settings"}
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditing(false);
                        setFormData({
                          name: profile?.name || "",
                          email: profile?.email || "",
                          semester: profile?.semester || "",
                          college: profile?.college || "",
                        });
                        setValidationError("");
                      }}
                      className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs px-5 py-3 rounded-xl border-0 transition-all cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
          </CardContent>
        </Card>
      </div>

    </div>
  );
};

export default StudentProfileSettings;
