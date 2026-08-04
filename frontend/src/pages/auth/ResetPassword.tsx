// src/pages/auth/ResetPassword.tsx
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
  ArrowLeft,
  Sparkles,
  Star,
  Shield,
  Users,
  Award
} from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Card, CardContent } from "../../components/ui/Card";
import { apiClient } from "../../lib/apiClient";
import { toast } from "react-hot-toast";
import { useSEO } from "../../hooks/useSEO";

const schema = yup.object({
  password: yup
    .string()
    .min(8, "Password must be at least 8 characters")
    .required("Password is required"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "Passwords must match")
    .required("Confirm password is required"),
});

interface FormData {
  password: string;
  confirmPassword: string;
}

const testimonials = [
  {
    quote: "BCSITHub has completely transformed how I study. The chapter notes and solved past questions are organized exactly how we need them for PU exams!",
    author: "Neha Bhandari",
    role: "Semester 4 Student",
    stars: 5
  },
  {
    quote: "The academic utilities like the CGPA Calculator and online compilers save me so much time. I use this portal daily for my class revisions.",
    author: "Anjali Shrestha",
    role: "Semester 6 Student",
    stars: 5
  }
];

export function ResetPassword() {
  useSEO({
    title: "Reset Account Password",
    description: "Enter your new password to restore access to your BCSITHub account.",
    keywords: "reset password, recover account"
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token") || "";
  const email = searchParams.get("email") || "";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(schema),
  });

  useEffect(() => {
    if (!token || !email) {
      setError("Invalid or missing password reset parameters in the URL.");
      toast.error("Invalid reset link.");
    }
  }, [token, email]);

  // Auto-slide testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const onSubmit = async (data: FormData) => {
    if (!token || !email) {
      setError("Cannot reset password without valid token and email parameters.");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const response = await apiClient.post("/auth/reset-password", {
        email,
        token,
        new_password: data.password
      });
      setSuccess(true);
      toast.success(response.message || "Password updated successfully!");
    } catch (err: any) {
      setError(err.message || "Failed to reset password. The link may have expired.");
      toast.error(err.message || "Error updating password.");
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 120, damping: 18 },
    },
  };

  return (
    <div className="min-h-screen bg-slate-50/50 relative overflow-hidden flex flex-col justify-center">
      
      {/* Background Orbs */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-10 left-10 w-72 h-72 bg-indigo-400/20 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl" />
      </div>

      <div className="relative min-h-screen flex z-10 w-full">
        
        {/* LEFT PANEL */}
        <motion.div
          className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-900 via-[#1e1b4b] to-slate-950 text-white p-16 flex-col justify-between relative overflow-hidden shadow-2xl"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
          
          <div className="space-y-12 my-auto relative z-10">
            <div>
              <h1 className="text-4xl xl:text-5xl font-black leading-tight">
                Secure Password
                <span className="block bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-500 bg-clip-text text-transparent mt-1">
                  Modification
                </span>
              </h1>
              <p className="text-sm text-indigo-200/70 font-semibold mt-4 max-w-md">
                Configure your new account credentials. Choose a strong combination of symbols, numbers, and case variables.
              </p>
            </div>

            {/* Testimonials */}
            <div className="border-t border-white/5 pt-8 max-w-md">
              <p className="text-sm italic text-indigo-100/80 leading-relaxed font-medium">
                "{testimonials[activeTestimonial].quote}"
              </p>
              <h4 className="text-sm font-bold text-white mt-4">
                - {testimonials[activeTestimonial].author}
              </h4>
            </div>
          </div>
        </motion.div>

        {/* RIGHT PANEL */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative">
          
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="w-full max-w-md space-y-6"
          >
            <motion.div variants={itemVariants}>
              <Link
                to="/signin"
                className="inline-flex items-center gap-2 text-indigo-650 hover:text-indigo-800 font-bold transition-colors text-xs"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to Sign In
              </Link>
            </motion.div>

            <motion.div variants={itemVariants} className="text-center sm:text-left">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 mb-1.5">
                {success ? "Success!" : "Reset Password"}
              </h2>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                {success ? "Your password was successfully updated." : "Enter and confirm your new account password."}
              </p>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="border border-white/20 shadow-premium bg-white/75 backdrop-blur-md rounded-3xl p-1.5 overflow-hidden">
                <CardContent className="p-6 sm:p-8 space-y-6">
                  
                  <AnimatePresence mode="wait">
                    {!success ? (
                      <motion.form
                        key="form"
                        onSubmit={handleSubmit(onSubmit)}
                        className="space-y-5"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                      >
                        {error && (
                          <div className="bg-rose-50 border border-rose-100 text-rose-700 px-4 py-3 rounded-xl text-xs font-semibold">
                            {error}
                          </div>
                        )}

                        {/* Password */}
                        <div className="space-y-1.5">
                          <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                            New Password
                          </label>
                          <div className="relative">
                            <Lock className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                              type={showPassword ? "text" : "password"}
                              placeholder="Min. 8 characters"
                              {...register("password")}
                              className="w-full pl-11 pr-11 py-2.5 border rounded-xl text-sm border-slate-200 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 bg-white"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(v => !v)}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                            >
                              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                          {errors.password && (
                            <p className="text-xs font-bold text-rose-600 pl-1">{errors.password.message}</p>
                          )}
                        </div>

                        {/* Confirm Password */}
                        <div className="space-y-1.5">
                          <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                            Confirm Password
                          </label>
                          <div className="relative">
                            <Lock className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                              type={showConfirmPassword ? "text" : "password"}
                              placeholder="Re-enter password"
                              {...register("confirmPassword")}
                              className="w-full pl-11 pr-11 py-2.5 border rounded-xl text-sm border-slate-200 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 bg-white"
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword(v => !v)}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                            >
                              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                          {errors.confirmPassword && (
                            <p className="text-xs font-bold text-rose-600 pl-1">{errors.confirmPassword.message}</p>
                          )}
                        </div>

                        <Button
                          type="submit"
                          disabled={loading || !!error}
                          className="w-full bg-gradient-to-r from-indigo-600 to-purple-650 text-white font-bold py-3.5 rounded-xl shadow-md"
                        >
                          {loading ? "Resetting Password..." : "Update Password"}
                        </Button>
                      </motion.form>
                    ) : (
                      <motion.div
                        key="success"
                        className="text-center space-y-5"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                      >
                        <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto">
                          <CheckCircle className="w-8 h-8 text-emerald-600" />
                        </div>
                        <p className="text-sm font-semibold text-slate-600">
                          Password updated successfully! You can now log in with your new credentials.
                        </p>
                        <Button
                          onClick={() => navigate("/signin")}
                          className="w-full bg-indigo-650 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl"
                        >
                          Login Now
                        </Button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
