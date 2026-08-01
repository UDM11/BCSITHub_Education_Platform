// src/pages/auth/EmailVerification.tsx
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { apiClient, setAuthSession } from "../../lib/apiClient";
import { Mail, CheckCircle, RefreshCw, ArrowLeft, ShieldAlert, Users, Award, Shield, Star } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { Button } from "../../components/ui/Button";
import { Card, CardContent } from "../../components/ui/Card";
import { toast } from "react-hot-toast";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useSEO } from "../../hooks/useSEO";

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

const EmailVerification = () => {
  useSEO({
    title: "Verify Your Email Address",
    description: "Enter the 6-digit verification code sent to your email to activate your BCSITHub account.",
    keywords: "email verification, activate bcsithub account, OTP"
  });

  const { reloadUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const emailFromUrl = searchParams.get("email") || "";

  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [email] = useState<string>(emailFromUrl);
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [error, setError] = useState("");
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Redirect if no email in URL
  useEffect(() => {
    if (!emailFromUrl) navigate("/signin");
  }, [emailFromUrl, navigate]);

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

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return; // digits only
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // keep only last char
    setOtp(newOtp);
    setError("");
    // Auto-advance to next box
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === "ArrowLeft" && index > 0) inputRefs.current[index - 1]?.focus();
    if (e.key === "ArrowRight" && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const newOtp = Array(6).fill("");
    pasted.split("").forEach((char, i) => { newOtp[i] = char; });
    setOtp(newOtp);
    inputRefs.current[Math.min(pasted.length, 5)]?.focus();
  };

  const handleVerify = async () => {
    const code = otp.join("");
    if (code.length < 6) {
      setError("Please enter all 6 digits of the verification code.");
      return;
    }
    if (!email) {
      setError("Email address not found. Please go back and try again.");
      return;
    }

    try {
      setVerifying(true);
      setError("");
      const data = await apiClient.post("/auth/verify-otp", { email, otp: code }) as any;

      // Store session token returned from verify-otp
      setAuthSession(data.access_token, data.user);
      await reloadUser();
      setVerified(true);
      toast.success("Email verified successfully! Welcome to BCSITHub 🎉");
      setTimeout(() => navigate("/"), 2000);
    } catch (err: any) {
      setError(err.message || "Verification failed. Please try again.");
      toast.error(err.message || "Invalid verification code.");
      // Clear OTP inputs on error
      setOtp(Array(6).fill(""));
      inputRefs.current[0]?.focus();
    } finally {
      setVerifying(false);
    }
  };

  const handleResend = async () => {
    if (!email) return;
    try {
      setResending(true);
      await apiClient.post("/auth/resend-verification", { email });
      toast.success("A new verification code has been sent to your email!");
      setCooldown(60);
      setOtp(Array(6).fill(""));
      setError("");
      inputRefs.current[0]?.focus();
    } catch (err: any) {
      toast.error(err.message || "Failed to resend verification code.");
    } finally {
      setResending(false);
    }
  };

  // Animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 120, damping: 18 } },
  };

  if (!emailFromUrl) return null;

  return (
    <div className="min-h-screen bg-slate-50/50 relative overflow-hidden flex flex-col justify-center">

      {/* Animated background orbs */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute -top-10 left-10 w-72 h-72 bg-indigo-400/20 rounded-full blur-3xl"
          animate={{ x: [0, 60, -30, 0], y: [0, -40, 20, 0], scale: [1, 1.15, 0.9, 1] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-10 right-10 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl"
          animate={{ x: [0, -70, 40, 0], y: [0, 50, -30, 0], scale: [1, 0.9, 1.1, 1] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="relative min-h-screen flex z-10 w-full">

        {/* LEFT PANEL */}
        <motion.div
          className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-900 via-[#1e1b4b] to-slate-950 text-white p-16 flex-col justify-between relative overflow-hidden shadow-2xl"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />

          <div className="space-y-12 relative z-10 my-auto">
            <div>
              <h1 className="text-4xl xl:text-5xl font-black leading-tight tracking-tight">
                Secure Onboarding
                <span className="block bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-500 bg-clip-text text-transparent mt-1">
                  Email Verification
                </span>
              </h1>
              <p className="text-sm text-indigo-200/70 font-semibold mt-4 leading-relaxed max-w-md">
                Enter the 6-digit code sent to your inbox to activate your Pokhara University BCSIT student account.
              </p>
            </div>

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
                        <h4 className="text-sm font-bold text-white">{testimonials[activeTestimonial].author}</h4>
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
              <div className="flex gap-1.5 mt-6">
                {testimonials.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveTestimonial(idx)}
                    className={`h-1.5 rounded-full transition-all duration-300 ${activeTestimonial === idx ? "w-6 bg-indigo-400" : "w-1.5 bg-white/20 hover:bg-white/40"}`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 relative z-10 border-t border-white/5 pt-8">
            {[
              { icon: Users, value: "2,500+", label: "Active Users" },
              { icon: Award, value: "98%", label: "Satisfaction" },
              { icon: Shield, value: "100%", label: "Secure" }
            ].map((stat, idx) => (
              <motion.div
                key={idx}
                className="p-4 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md hover:bg-white/10 hover:border-white/20 transition-all duration-300 flex flex-col justify-between h-24 text-left group"
                whileHover={{ y: -3, scale: 1.02 }}
              >
                <stat.icon className="w-5 h-5 text-indigo-400 transition-transform duration-300 group-hover:scale-110" />
                <div>
                  <div className="text-lg font-black text-white">{stat.value}</div>
                  <div className="text-[9px] font-bold text-indigo-300 uppercase tracking-widest">{stat.label}</div>
                </div>
              </motion.div>
            ))}
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
            {/* Back to Sign In */}
            <motion.div variants={itemVariants}>
              <button
                onClick={() => navigate("/signin")}
                className="inline-flex items-center gap-2 text-indigo-650 hover:text-indigo-800 font-bold transition-colors text-xs bg-transparent border-0 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to Sign In
              </button>
            </motion.div>

            {/* Header */}
            <motion.div variants={itemVariants} className="text-center sm:text-left">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 mb-1.5 tracking-tight">
                {verified ? "Email Verified!" : "Verify Your Email"}
              </h2>
              <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider leading-relaxed">
                {verified
                  ? "Your account is now active. Redirecting..."
                  : `Enter the 6-digit code sent to ${email || "your email"}`
                }
              </p>
            </motion.div>

            {/* Card */}
            <motion.div variants={itemVariants}>
              <Card className="border border-white/20 shadow-premium bg-white/75 backdrop-blur-md rounded-3xl p-1.5 overflow-hidden">
                <CardContent className="p-6 sm:p-8 space-y-6">

                  <AnimatePresence mode="wait">
                    {verified ? (
                      <motion.div
                        key="success"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center space-y-4"
                      >
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 200 }}
                          className="w-20 h-20 bg-emerald-50 border-2 border-emerald-200 rounded-full flex items-center justify-center mx-auto"
                        >
                          <CheckCircle className="w-10 h-10 text-emerald-500" />
                        </motion.div>
                        <p className="text-sm font-semibold text-slate-600">
                          Your email has been verified successfully. Welcome to BCSITHub! 🎉
                        </p>
                      </motion.div>
                    ) : (
                      <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">

                        {/* Bouncing mail icon */}
                        <div className="flex justify-center">
                          <div className="w-14 h-14 bg-indigo-50 border border-indigo-100 rounded-full flex items-center justify-center">
                            <Mail className="w-6 h-6 text-indigo-600 animate-bounce" />
                          </div>
                        </div>

                        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-semibold text-center">
                          A 6-digit code was sent to{" "}
                          <strong className="text-indigo-600 font-black">{email}</strong>.
                          <br />Enter it below to activate your account.
                        </p>

                        {/* 6-digit OTP Input Boxes */}
                        <div className="flex justify-center gap-2 sm:gap-3">
                          {otp.map((digit, index) => (
                            <input
                              key={index}
                              ref={(el) => { inputRefs.current[index] = el; }}
                              type="text"
                              inputMode="numeric"
                              maxLength={1}
                              value={digit}
                              onChange={(e) => handleOtpChange(index, e.target.value)}
                              onKeyDown={(e) => handleKeyDown(index, e)}
                              onPaste={index === 0 ? handlePaste : undefined}
                              className={`w-11 h-13 sm:w-12 sm:h-14 text-center text-xl font-black border-2 rounded-xl outline-none transition-all duration-200 bg-white
                                ${digit ? "border-indigo-500 text-indigo-700 bg-indigo-50/50" : "border-slate-200 text-slate-800"}
                                focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10
                                ${error ? "border-rose-400 bg-rose-50/30" : ""}`}
                              style={{ height: "56px" }}
                              aria-label={`OTP digit ${index + 1}`}
                              id={`otp-box-${index}`}
                              autoComplete="one-time-code"
                            />
                          ))}
                        </div>

                        {/* Error message */}
                        <AnimatePresence>
                          {error && (
                            <motion.div
                              initial={{ opacity: 0, y: -4 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0 }}
                              className="bg-rose-50 border border-rose-100 text-rose-700 px-4 py-3 rounded-xl flex items-start gap-2.5 text-xs font-semibold"
                            >
                              <div className="w-4 h-4 bg-rose-500 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-[10px]">!</div>
                              <span>{error}</span>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* Verify Button */}
                        <Button
                          onClick={handleVerify}
                          disabled={verifying || otp.join("").length < 6}
                          className="w-full bg-gradient-to-r from-indigo-600 to-purple-650 hover:brightness-110 text-white font-bold py-3.5 rounded-xl shadow-md border-0 transition-all duration-200 flex items-center justify-center gap-2"
                        >
                          {verifying ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              <span>Verifying...</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle className="w-4 h-4" />
                              <span>Verify Email</span>
                            </>
                          )}
                        </Button>

                        {/* Spam warning */}
                        <div className="bg-indigo-50/40 border border-indigo-100/50 rounded-2xl p-4 text-xs font-semibold text-indigo-900 flex items-start gap-2.5 text-left leading-relaxed">
                          <ShieldAlert className="w-4 h-4 text-indigo-500 mt-0.5 flex-shrink-0" />
                          <span>Check your spam or junk folder if the code doesn't arrive within a few minutes.</span>
                        </div>

                        {/* Resend */}
                        <div className="pt-1 text-xs font-bold text-slate-450 text-center">
                          Didn't receive the code?{" "}
                          <button
                            onClick={handleResend}
                            disabled={resending || cooldown > 0}
                            className={`ml-1 font-black transition-all bg-transparent border-0 cursor-pointer inline-flex items-center gap-1 ${
                              resending || cooldown > 0
                                ? "text-slate-400 cursor-not-allowed"
                                : "text-indigo-600 hover:text-indigo-800 underline"
                            }`}
                          >
                            {resending ? (
                              <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Sending...</>
                            ) : cooldown > 0 ? (
                              `Resend in ${cooldown}s`
                            ) : (
                              "Resend Code"
                            )}
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </motion.div>

            {/* Footer badges */}
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
