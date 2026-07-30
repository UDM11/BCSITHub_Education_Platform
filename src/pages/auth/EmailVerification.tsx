// src/pages/auth/EmailVerification.tsx
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Backendless from "backendless";
import { Mail, CheckCircle, RefreshCw, ArrowLeft, ShieldAlert, Users, Award, Shield, Star } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { Button } from "../../components/ui/Button";
import { Card, CardContent } from "../../components/ui/Card";
import { toast } from "react-hot-toast";
import { useNavigate, Link } from "react-router-dom";
import { useSEO } from "../../hooks/useSEO";

const testimonials = [
  {
    quote: "BCSITHub has completely transformed how I study. The chapter notes and solved past questions are organized exactly how we need them for PU exams!",
    author: "Umesh Darlami",
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

const EmailVerification = () => {
  useSEO({
    title: "Verify Your Email Address",
    description: "Verify your email credentials to activate your student account on the BCSITHub portal.",
    keywords: "email verification, activate bcsithub account"
  });

  const { user, reloadUser } = useAuth();
  const navigate = useNavigate();

  const [sending, setSending] = useState(false);
  const [checking, setChecking] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  // Redirect to signin if user doesn't exist
  useEffect(() => {
    if (!user) navigate("/signin");
  }, [user, navigate]);

  // Countdown for resend cooldown
  useEffect(() => {
    if (cooldown === 0) return;
    const timer = setTimeout(() => setCooldown((prev) => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  // Auto-slide testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  // Resend email confirmation
  const handleResend = async () => {
    if (!user?.email) {
      toast.error("No user email found.");
      return;
    }

    try {
      setSending(true);
      await Backendless.UserService.resendEmailConfirmation(user.email);
      toast.success("Verification email resent. Check your inbox!");
      setCooldown(60); // 1 min cooldown
    } catch (error: any) {
      toast.error(error.message || "Failed to resend verification email.");
    } finally {
      setSending(false);
    }
  };

  // Check if user has verified their email
  const handleCheckVerification = async () => {
    if (!user?.objectId) {
      toast.error("User ID not found.");
      return;
    }

    try {
      setChecking(true);
      const updatedUser = await Backendless.Data.of("Users").findById(user.objectId);
      await reloadUser(updatedUser);

      if (updatedUser.emailConfirmed) {
        toast.success("Email verified! Redirecting...");
        navigate("/profile");
      } else {
        toast.error("Email not verified yet. Please check your inbox.");
      }
    } catch (error: any) {
      toast.error(error.message || "Error checking verification status.");
    } finally {
      setChecking(false);
    }
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

  if (!user) return null;

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
                Secure Onboarding
                <span className="block bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-500 bg-clip-text text-transparent mt-1">
                  Email Verification
                </span>
              </h1>
              <p className="text-sm text-indigo-200/70 font-semibold mt-4 leading-relaxed max-w-md">
                Verify your academic email address to unlock official Pokhara University BCSIT syllabi and CGPA calculators.
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

        {/* RIGHT PANEL - Glassmorphic Verification Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative">
          
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="w-full max-w-md space-y-6"
          >
            {/* Mobile Header Logo */}
            <div className="lg:hidden text-center mb-6">
              <div className="flex items-center justify-center space-x-2.5">
                <div className="w-10 h-10 rounded-xl overflow-hidden shadow-md flex items-center justify-center border border-slate-100">
                  <img src="/logo.jpg" alt="BCSITHub Logo" className="w-full h-full object-cover" />
                </div>
                <span className="text-xl font-black bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 bg-clip-text text-transparent tracking-tight">
                  BCSITHub
                </span>
              </div>
            </div>

            {/* Back to Sign In Link */}
            <motion.div variants={itemVariants}>
              <button
                onClick={() => navigate("/signin")}
                className="inline-flex items-center gap-2 text-indigo-650 hover:text-indigo-800 font-bold transition-colors text-xs bg-transparent border-0 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to Sign In
              </button>
            </motion.div>

            {/* Title headers */}
            <motion.div variants={itemVariants} className="text-center sm:text-left">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 mb-1.5 tracking-tight">
                Verify Your Email
              </h2>
              <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider leading-relaxed">
                Confirm your account address to activate your dashboard.
              </p>
            </motion.div>

            {/* Verification Card */}
            <motion.div variants={itemVariants}>
              <Card className="border border-white/20 shadow-premium bg-white/75 backdrop-blur-md rounded-3xl p-1.5 overflow-hidden">
                <CardContent className="p-6 sm:p-8 text-center space-y-6">
                  
                  {/* Bounce Mail Icon */}
                  <div className="w-16 h-16 bg-indigo-50 border border-indigo-100 rounded-full flex items-center justify-center mx-auto">
                    <Mail className="w-7 h-7 text-indigo-600 animate-bounce" />
                  </div>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-semibold">
                    A confirmation link has been sent to <strong className="text-indigo-650 font-black">{user.email}</strong>. Check your inbox and click the validation link to activate.
                  </p>

                  <div className="space-y-4 pt-2">
                    {/* Primary Button */}
                    <Button 
                      onClick={handleCheckVerification} 
                      disabled={checking} 
                      className="w-full bg-gradient-to-r from-indigo-600 to-purple-650 hover:brightness-110 text-white font-bold py-3.5 rounded-xl shadow-md border-0 transition-all duration-200 flex items-center justify-center gap-2"
                    >
                      {checking ? (
                        <>
                          <div className="w-4.5 h-4.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Checking Status...</span>
                        </>
                      ) : (
                        <span>I Have Verified My Email</span>
                      )}
                    </Button>

                    {/* Warning Alert */}
                    <div className="bg-indigo-50/40 border border-indigo-100/50 rounded-2xl p-4 text-xs font-semibold text-indigo-900 flex items-start gap-2.5 text-left leading-relaxed">
                      <ShieldAlert className="w-4 h-4 text-indigo-500 mt-0.5 flex-shrink-0" />
                      <span>Check spam or junk folders if the confirmation link doesn't arrive within 5 minutes.</span>
                    </div>

                    {/* Resend Cooldown Link */}
                    <div className="pt-2 text-xs font-bold text-slate-450">
                      Didn't receive email?
                      <button
                        onClick={handleResend}
                        disabled={sending || cooldown > 0}
                        className={`ml-1.5 font-black transition-all bg-transparent border-0 cursor-pointer inline-flex items-center gap-1 ${
                          sending || cooldown > 0
                            ? "text-slate-400 cursor-not-allowed"
                            : "text-indigo-650 hover:text-indigo-800 underline"
                        }`}
                      >
                        {sending ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            Sending...
                          </>
                        ) : cooldown > 0 ? (
                          `Resend in ${cooldown}s`
                        ) : (
                          "Resend Verification Email"
                        )}
                      </button>
                    </div>
                  </div>

                </CardContent>
              </Card>
            </motion.div>

            {/* Bottom mini-footer */}
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
};

export default EmailVerification;
