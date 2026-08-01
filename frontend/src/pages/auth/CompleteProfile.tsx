import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { GraduationCap, Building, Calendar, MapPin, Sparkles } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { apiClient } from "../../lib/apiClient";
import { toast } from "react-hot-toast";
import { Card, CardContent } from "../../components/ui/Card";

const roleOptions = [
  { value: "student", label: "Student" },
  { value: "teacher", label: "Teacher" },
];

const semesterOptions = Array.from({ length: 8 }, (_, i) => ({
  value: i + 1,
  label: `${i + 1}${["st","nd","rd","th","th","th","th","th"][i]} Semester`,
}));

const collegeOptions = [
  { value: "Ace Institute of Management", label: "Ace Institute of Management", address: "Bibhuti Janak Marg, New Baneshwor, Kathmandu" },
  { value: "Gandaki College of Engineering and Science", label: "Gandaki College of Engineering and Science", address: "Pokhara, Kaski" },
  { value: "Nepal College of Information Technology", label: "Nepal College of Information Technology", address: "Balkumari, Lalitpur" },
  { value: "Pokhara University", label: "Pokhara University", address: "Pokhara, Kaski" },
  { value: "Prime College", label: "Prime College", address: "Devkota Sadak, Mid Baneshwor, Kathmandu" },
  { value: "Kathmandu College of Technology", label: "Kathmandu College of Technology", address: "Sinamangal, Kathmandu" },
  { value: "Medhavi College", label: "Medhavi College", address: "Shankhamul, Kathmandu" },
  { value: "Crimson College of Technology", label: "Crimson College of Technology", address: "Devinagar, Butwal, Rupandehi" },
  { value: "SAIM College", label: "SAIM College", address: "Old Baneswor Chowk, Kathmandu" },
  { value: "Apollo International College", label: "Apollo International College", address: "Lakhechaur Marg, Baneshwor, Kathmandu" },
  { value: "Quest International College", label: "Quest International College", address: "Gwarko, Lalitpur" },
  { value: "Shubhashree College of Management", label: "Shubhashree College of Management", address: "New Baneshwor, Kathmandu" },
  { value: "Liberty College", label: "Liberty College", address: "Pragati Marg-2, Anamnagar, Kathmandu" },
  { value: "Uniglobe College", label: "Uniglobe College", address: "New Baneshwor, Kathmandu" },
  { value: "Excel Business College", label: "Excel Business College", address: "Lakhechaur Marg, New Baneshwor, Kathmandu" },
  { value: "Rajdhani Model College", label: "Rajdhani Model College", address: "Old Baneshwor, Kathmandu" },
  { value: "Other", label: "Other College", address: "" },
];

const inputClass = "w-full pl-11 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all duration-300 bg-white/90 text-slate-800 font-semibold cursor-pointer";

export default function CompleteProfile() {
  const { user, reloadUser } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState("student");
  const [semester, setSemester] = useState("");
  const [college, setCollege] = useState("");
  const [loading, setLoading] = useState(false);

  const selectedCollege = collegeOptions.find((c) => c.value === college);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (role === "student" && (!semester || !college)) {
      toast.error("Please fill in all required fields.");
      return;
    }
    try {
      setLoading(true);
      const payload: any = { role };
      if (role === "student") {
        payload.semester = Number(semester);
        payload.college = college;
        payload.college_address = selectedCollege?.address || "";
      }
      await apiClient.put("/auth/profile", payload);
      await reloadUser();
      toast.success("Profile completed! Welcome to BCSITHub 🎉");
      navigate("/");
    } catch (err: any) {
      toast.error(err.message || "Failed to save profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div className="absolute -top-10 left-10 w-72 h-72 bg-indigo-400/20 rounded-full blur-3xl"
          animate={{ x: [0, 60, -30, 0], y: [0, -40, 20, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }} />
        <motion.div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl"
          animate={{ x: [0, -70, 40, 0], y: [0, 50, -30, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg mb-4">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Complete Your Profile</h2>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">
            Welcome, {user?.name?.split(" ")[0]}! Just a few more details.
          </p>
        </div>

        <Card className="border border-white/20 shadow-premium bg-white/75 backdrop-blur-md rounded-3xl p-1.5">
          <CardContent className="p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Role */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">I am a</label>
                <div className="relative">
                  <GraduationCap className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <select value={role} onChange={(e) => setRole(e.target.value)} className={inputClass}>
                    {roleOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
              </div>

              {/* Student-only fields */}
              {role === "student" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="space-y-4"
                >
                  {/* Semester */}
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Current Semester</label>
                    <div className="relative">
                      <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                      <select value={semester} onChange={(e) => setSemester(e.target.value)} className={inputClass}>
                        <option value="">Select your semester</option>
                        {semesterOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                    </div>
                  </div>

                  {/* College */}
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">College</label>
                    <div className="relative">
                      <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                      <select value={college} onChange={(e) => setCollege(e.target.value)} className={inputClass}>
                        <option value="">Select your college</option>
                        {collegeOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                    </div>
                  </div>

                  {/* College address badge */}
                  {college && college !== "Other" && selectedCollege?.address && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-start gap-2 text-[11px] font-semibold text-indigo-700 bg-indigo-50/50 p-3 rounded-xl border border-indigo-100/50"
                    >
                      <MapPin className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-indigo-600" />
                      <span>{selectedCollege.address}</span>
                    </motion.div>
                  )}
                </motion.div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:brightness-110 text-white font-bold py-3.5 rounded-xl shadow-md transition-all duration-200 flex items-center justify-center gap-2 text-sm"
              >
                {loading ? (
                  <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /><span>Saving...</span></>
                ) : (
                  <span>Complete Profile & Continue →</span>
                )}
              </button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
