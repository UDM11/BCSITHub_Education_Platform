// src/pages/auth/ForgotPassword.tsx
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  Mail,
  Send,
  Shield,
  Users,
  Award,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Star,
  ArrowLeft,
  RefreshCw,
  Clock,
  Lock
} from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Card, CardContent } from "../../components/ui/Card";
import { apiClient } from "../../lib/apiClient";
import { toast } from "react-hot-toast";
import { useSEO } from "../../hooks/useSEO";

const schema = yup.object({
  email: yup.string().email("Invalid email").required("Email is required"),
});

interface FormData {
  email: string;
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
  },
  {
    quote: "Finally, a dedicated and beautifully designed portal for Pokhara University BCSIT! The study materials are high-quality and very helpful.",
    author: "Rohan Chaudhary",
    role: "Semester 2 Student",
    stars: 5
  }
];

export function ForgotPassword() {
  useSEO({
    title: "Recover Forgotten Password",
    description: "Submit your account email to request a reset link and recover password credentials.",
    keywords: "forgot password, reset password bcsithub"
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(schema),
  });

  // Auto-slide testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await apiClient.post("/auth/forgot-password", { email: data.email });
      setMessage(response.message || "Password has been reset successfully!");
      setEmailSent(true);
      toast.success("Password reset completed!");
    } catch (err: any) {
      setError(err.message || "Failed to reset password. Please try again.");
      toast.error(err.message || "Error resetting password.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEmailSent(false);
    setMessage("");
    setError("");
  };

  // Animations Presets
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1,
      },
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

  const alertVariants = {
    hidden: { opacity: 0, scale: 0.95, x: 0 },
    visible: {
      opacity: 1,
      scale: 1,
      x: [0, -5, 5, -5, 5, 0], // Shake
      transition: { duration: 0.4 },
    },
  };

  return (
    <div className="min-h-screen bg-slate-50/50 relative overflow-hidden flex flex-col justify-center">
      
      {/* Interactive Glowing Mesh Orbs (Background) */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute -top-10 left-10 w-72 h-72 bg-indigo-400/20 rounded-full blur-3xl"
          animate={{
            x: [0, 60, -30, 0],
            y: [0, -40, 20, 0],
            scale: [1, 1.15, 0.9, 1]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-10 right-10 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl"
          animate={{
            x: [0, -70, 40, 0],
            y: [0, 50, -30, 0],
            scale: [1, 0.9, 1.1, 1]
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="relative min-h-screen flex z-10 w-full">
        
        {/* LEFT PANEL - Premium Brand & Testimonials */}
        <motion.div
          className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-900 via-[#1e1b4b] to-slate-950 text-white p-16 flex-col justify-between relative overflow-hidden shadow-2xl"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          {/* Subtle overlay grid lines */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />



          {/* Slogan and Testimonial carousel */}
          <div className="space-y-12 relative z-10 my-auto">
            <div>
              <h1 className="text-4xl xl:text-5xl font-black leading-tight tracking-tight">
                Secure Account
                <span className="block bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-500 bg-clip-text text-transparent mt-1">
                  Recovery
                </span>
              </h1>
              <p className="text-sm text-indigo-200/70 font-semibold mt-4 leading-relaxed max-w-md">
                We'll verify your registered email address and send a secure validation link to reset your account password.
              </p>
            </div>

            {/* Testimonials Slide-deck */}
            <div className="border-t border-white/5 pt-8 max-w-md">
              <div className="h-36 relative">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTestimonial}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.35 }}
                    className="absolute inset-0 flex flex-col justify-between"
                  >
                    <p className="text-sm italic text-indigo-100/80 leading-relaxed font-medium">
                      "{testimonials[activeTestimonial].quote}"
                    </p>
                    <div className="flex items-center justify-between mt-4">
                      <div>
                        <h4 className="text-sm font-bold text-white">
                          {testimonials[activeTestimonial].author}
                        </h4>
                        <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider">
                          {testimonials[activeTestimonial].role}
                        </span>
                      </div>
                      <div className="flex gap-0.5">
                        {[...Array(testimonials[activeTestimonial].stars)].map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 text-yellow-400 fill-current" />
                        ))}
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Slider Dots */}
              <div className="flex gap-1.5 mt-6">
                {testimonials.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveTestimonial(idx)}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      activeTestimonial === idx ? "w-6 bg-indigo-400" : "w-1.5 bg-white/20 hover:bg-white/40"
                    }`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Stats card grid */}
          <div className="grid grid-cols-3 gap-4 relative z-10 border-t border-white/5 pt-8">
            {[
              { icon: Users, value: "2,500+", label: "Active Users" },
              { icon: Award, value: "98%", label: "Satisfaction" },
              { icon: Shield, value: "100%", label: "Secure Link" }
            ].map((stat, idx) => (
              <motion.div
                key={idx}
                className="p-4 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md hover:bg-white/10 hover:border-white/20 transition-all duration-300 flex flex-col justify-between h-24 text-left group"
                whileHover={{ y: -3, scale: 1.02 }}
              >
                <stat.icon className="w-5 h-5 text-indigo-400 transition-transform duration-300 group-hover:scale-110" />
                <div>
                  <div className="text-lg font-black text-white">{stat.value}</div>
                  <div className="text-[9px] font-bold text-indigo-300 uppercase tracking-widest">
                    {stat.label}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* RIGHT PANEL - Glassmorphic Recovery Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative">
          
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="w-full max-w-md space-y-6"
          >

            {/* Back to Sign In Link */}
            <motion.div variants={itemVariants}>
              <Link
                to="/signin"
                className="inline-flex items-center gap-2 text-indigo-650 hover:text-indigo-800 font-bold transition-colors text-xs"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to Sign In
              </Link>
            </motion.div>

            {/* Title headers */}
            <motion.div variants={itemVariants} className="text-center sm:text-left">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 mb-1.5 tracking-tight">
                {emailSent ? "Password Reset Successfully" : "Forgot Password?"}
              </h2>
              <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider leading-relaxed">
                {emailSent 
                  ? "Your account password has been updated."
                  : "Enter your email address to reset your account password."
                }
              </p>
            </motion.div>

            {/* Form Card Sheet */}
            <motion.div variants={itemVariants}>
              <Card className="border border-white/20 shadow-premium bg-white/75 backdrop-blur-md rounded-3xl p-1.5 overflow-hidden">
                <CardContent className="p-6 sm:p-8 space-y-6">
                  
                  <AnimatePresence mode="wait">
                    {!emailSent ? (
                      
                      /* Form input mode */
                      <motion.form
                        key="form"
                        onSubmit={handleSubmit(onSubmit)}
                        className="space-y-5"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                      >
                        {/* Error alert with shake */}
                        <AnimatePresence>
                          {error && (
                            <motion.div
                              variants={alertVariants}
                              initial="hidden"
                              animate="visible"
                              exit="hidden"
                              className="bg-rose-50 border border-rose-100 text-rose-700 px-4 py-3 rounded-xl flex items-start gap-2.5 text-xs font-semibold shadow-sm"
                            >
                              <div className="w-4.5 h-4.5 bg-rose-500 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-[10px]">
                                !
                              </div>
                              <span className="flex-1 leading-normal">{error}</span>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* Email Input */}
                        <div className="space-y-1.5">
                          <label className="block text-[10px] font-extrabold text-slate-500 mb-1 uppercase tracking-wider">
                            Email Address
                          </label>
                          <div className="relative group">
                            <Mail className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-650 transition-colors" />
                            <input
                              type="email"
                              placeholder="Enter your registered email address"
                              {...register("email")}
                              className={`w-full pl-11 pr-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all duration-300 bg-white/90 text-slate-800 placeholder:text-slate-400 ${
                                errors.email ? "border-rose-300 ring-rose-500/5 focus:border-rose-500" : "border-slate-200"
                              }`}
                            />
                          </div>
                          {errors.email && (
                            <p className="mt-1 text-xs font-bold text-rose-600 pl-1">{errors.email.message}</p>
                          )}
                        </div>

                        {/* Submit */}
                        <Button
                          type="submit"
                          disabled={loading}
                          className="w-full bg-gradient-to-r from-indigo-600 to-purple-650 hover:brightness-110 text-white font-bold py-3.5 rounded-xl shadow-md transition-all duration-200 flex items-center justify-center gap-2"
                        >
                          {loading ? (
                            <>
                              <div className="w-4.5 h-4.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              <span>Sending Reset Link...</span>
                            </>
                          ) : (
                            <>
                              <Send className="w-4 h-4" />
                              <span>Send Reset Link</span>
                            </>
                          )}
                        </Button>
                      </motion.form>
                    ) : (
                      
                      /* Success confirmation mode */
                      <motion.div
                        key="success"
                        className="text-center space-y-5"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                      >
                        {/* Shimmer Check mark */}
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.15, type: "spring", stiffness: 200 }}
                          className="w-16 h-16 bg-emerald-50 border border-emerald-100 rounded-full flex items-center justify-center mx-auto mb-2"
                        >
                          <Lock className="w-6 h-6 text-emerald-600" />
                        </motion.div>

                        <div className="bg-emerald-50/50 border border-emerald-100/50 text-emerald-800 px-4 py-3 rounded-xl text-xs font-semibold shadow-inner leading-relaxed">
                          <div className="flex items-center justify-center gap-2">
                            <CheckCircle className="w-4.5 h-4.5 text-emerald-600 flex-shrink-0" />
                            <span>{message}</span>
                          </div>
                        </div>

                        {/* Informative Instructions */}
                        <div className="bg-indigo-50/40 border border-indigo-100/50 rounded-2xl p-4 text-left">
                          <div className="flex items-start gap-3">
                            <Clock className="w-4.5 h-4.5 text-indigo-650 mt-0.5 flex-shrink-0" />
                            <div className="text-[11px] text-indigo-900 font-semibold leading-relaxed">
                              <p className="font-bold text-slate-800 mb-1 text-xs">What happens next?</p>
                              <ul className="space-y-1 opacity-90 pl-1 list-disc list-inside">
                                <li>Copy the temporary password displayed above.</li>
                                <li>Click "Back to Sign In" to return to the login page.</li>
                                <li>Enter your email and the temporary password to log in.</li>
                                <li>Update your password inside your student profile settings.</li>
                              </ul>
                            </div>
                          </div>
                        </div>

                        {/* Actions block */}
                        <div className="space-y-3.5 pt-2">
                          <p className="text-[11px] text-slate-450 font-semibold leading-relaxed">
                            Need to reset a different account?
                          </p>
                          <button
                            onClick={resetForm}
                            className="w-full py-3 border border-slate-200 text-indigo-600 bg-white hover:bg-slate-50 rounded-xl font-bold text-xs transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                            Reset Another Account
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Sign in footer link */}
                  {!emailSent && (
                    <div className="text-center pt-2 border-t border-slate-50">
                      <span className="text-xs text-slate-450 font-semibold mr-1.5">Remember password?</span>
                      <Link
                        to="/signin"
                        className="inline-flex items-center gap-1.5 text-indigo-650 hover:text-indigo-800 text-xs font-black transition-colors"
                      >
                        <Star className="w-3.5 h-3.5 text-yellow-500 fill-current" />
                        Sign in here
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  )}

                </CardContent>
              </Card>
            </motion.div>

            {/* Bottom footer specs */}
            <motion.div
              variants={itemVariants}
              className="text-center text-[10px] font-extrabold text-slate-400 uppercase tracking-widest flex flex-wrap items-center justify-center gap-4 pt-4"
            >
              <div className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-indigo-500" />
                <span>SSL Encryption</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-purple-500" />
                <span>2.5K+ Students</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-amber-500" />
                <span>Free Platform</span>
              </div>
            </motion.div>

          </motion.div>
        </div>
      </div>
    </div>
  );
}