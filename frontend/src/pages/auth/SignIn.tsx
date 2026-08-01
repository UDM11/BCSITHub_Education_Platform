// src/pages/auth/SignIn.tsx
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  Mail,
  Lock,
  LogIn,
  BookOpen,
  Eye,
  EyeOff,
  Shield,
  Users,
  Award,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Star
} from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Card, CardContent } from "../../components/ui/Card";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-hot-toast";
import { useSEO } from "../../hooks/useSEO";

const schema = yup.object({
  email: yup.string().email("Invalid email").required("Email is required"),
  password: yup
    .string()
    .min(8, "Password must be at least 8 characters")
    .required("Password is required"),
  rememberMe: yup.boolean(),
});

interface FormData {
  email: string;
  password: string;
  rememberMe?: boolean;
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

export function SignIn() {
  useSEO({
    title: "Sign In to Your Account",
    description: "Access your BCSITHub dashboard to download papers, upload study materials, and track your achievements.",
    keywords: "bcsit login, bcsithub signin, pu student login"
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  
  const navigate = useNavigate();
  const { signIn } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
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

  // Load email from localStorage if remembered
  useEffect(() => {
    const rememberedEmail = localStorage.getItem("rememberedEmail");
    if (rememberedEmail) {
      setValue("email", rememberedEmail);
      setValue("rememberMe", true);
    }
  }, [setValue]);

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);
      setError("");
      await signIn(data.email, data.password);

      if (data.rememberMe) {
        localStorage.setItem("rememberedEmail", data.email);
      } else {
        localStorage.removeItem("rememberedEmail");
      }

      toast.success("Successfully logged in!");
      navigate("/");
    } catch (err: any) {
      // If backend says email is not verified, redirect to the verification page
      if (err.message === "EMAIL_NOT_VERIFIED") {
        toast("Please verify your email to continue.", { icon: "📧" });
        navigate(`/verify?email=${encodeURIComponent(data.email)}`);
        return;
      }
      setError(err.message || "Failed to sign in");
      toast.error(err.message || "Sign in failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  // Framer Motion Animation Presets
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
      x: [0, -5, 5, -5, 5, 0], // Shake animation
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
        
        {/* LEFT PANEL - Premium Brand & Testimonial Carousel */}
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

              <h1 className="text-4xl xl:text-5xl font-black leading-tight tracking-tight mt-4">
                Your Gateway to
                <span className="block bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-500 bg-clip-text text-transparent mt-1">
                  Academic Excellence
                </span>
              </h1>
              <p className="text-sm text-indigo-200/70 font-semibold mt-4 leading-relaxed max-w-md">
                Access curated chapter handouts, syllabus specifications, solved board questions, and online code utilities.
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

        {/* RIGHT PANEL - Glassmorphic Form Card */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative">
          
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="w-full max-w-md space-y-6"
          >

            {/* Title headers */}
            <motion.div variants={itemVariants} className="text-center sm:text-left">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 mb-1.5 tracking-tight">
                Welcome Back!
              </h2>
              <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">
                Sign in to access study handouts and calculator utilities.
              </p>
            </motion.div>

            {/* Form Sheet Card */}
            <motion.div variants={itemVariants}>
              <Card className="border border-white/20 shadow-premium bg-white/75 backdrop-blur-md rounded-3xl p-1.5 overflow-hidden">
                <CardContent className="p-6 sm:p-8 space-y-6">
                  
                  {/* Error alerts with shake animation */}
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

                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    
                    {/* Email Input */}
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-extrabold text-slate-500 mb-1 uppercase tracking-wider">
                        Email Address
                      </label>
                      <div className="relative group">
                        <Mail className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-650 transition-colors" />
                        <input
                          type="email"
                          placeholder="Enter your registered email"
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

                    {/* Password Input */}
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-extrabold text-slate-500 mb-1 uppercase tracking-wider">
                        Password
                      </label>
                      <div className="relative group">
                        <Lock className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-650 transition-colors" />
                        <input
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your security password"
                          {...register("password")}
                          className={`w-full pl-11 pr-12 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all duration-300 bg-white/90 text-slate-800 placeholder:text-slate-400 ${
                            errors.password ? "border-rose-300 ring-rose-500/5 focus:border-rose-500" : "border-slate-200"
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3.5 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                          {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                        </button>
                      </div>
                      {errors.password && (
                        <p className="mt-1 text-xs font-bold text-rose-600 pl-1">{errors.password.message}</p>
                      )}
                    </div>

                    {/* Remember me & Forgot password */}
                    <div className="flex items-center justify-between gap-4 text-xs">
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          {...register("rememberMe")}
                          className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500/10 focus:ring-offset-0 transition-colors cursor-pointer"
                        />
                        <span className="text-slate-600 font-semibold hover:text-indigo-650 transition-colors">Remember me</span>
                      </label>
                      <Link
                        to="/forgot-password"
                        className="text-indigo-650 hover:text-indigo-800 font-bold flex items-center gap-1 transition-colors"
                      >
                        Forgot password?
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-3.5 rounded-xl shadow-md transition-all duration-200 flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <div className="w-4.5 h-4.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Signing in...</span>
                        </>
                      ) : (
                        <>
                          <LogIn className="w-4.5 h-4.5" />
                          <span>Sign In</span>
                        </>
                      )}
                    </Button>
                  </form>

                  {/* Mock OAuth Logins Section */}
                  <div className="space-y-3.5 pt-2">
                    <div className="relative flex py-1.5 items-center">
                      <div className="flex-grow border-t border-slate-100/80" />
                      <span className="flex-shrink mx-3 text-[9px] font-extrabold text-slate-400 uppercase tracking-widest">
                        Or continue with
                      </span>
                      <div className="flex-grow border-t border-slate-100/80" />
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <button
                        type="button"
                        onClick={() => toast.success("Google Sign-In integration ready.")}
                        className="flex items-center justify-center py-2.5 px-4 border border-slate-200 hover:border-slate-300 hover:bg-slate-50/60 rounded-xl transition-all duration-200 active:scale-98"
                        title="Sign in with Google"
                      >
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                        </svg>
                      </button>

                      <button
                        type="button"
                        onClick={() => toast.success("GitHub Sign-In integration ready.")}
                        className="flex items-center justify-center py-2.5 px-4 border border-slate-200 hover:border-slate-300 hover:bg-slate-50/60 rounded-xl transition-all duration-200 active:scale-98"
                        title="Sign in with GitHub"
                      >
                        <svg className="w-5 h-5 text-slate-800" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                        </svg>
                      </button>

                      <button
                        type="button"
                        onClick={() => toast.success("Microsoft Sign-In integration ready.")}
                        className="flex items-center justify-center py-2.5 px-4 border border-slate-200 hover:border-slate-300 hover:bg-slate-50/60 rounded-xl transition-all duration-200 active:scale-98"
                        title="Sign in with Microsoft"
                      >
                        <svg className="w-5 h-5" viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <rect width="10.5" height="10.5" fill="#F25022"/>
                          <rect x="11.5" width="10.5" height="10.5" fill="#7FBA00"/>
                          <rect y="11.5" width="10.5" height="10.5" fill="#00A4EF"/>
                          <rect x="11.5" y="11.5" width="10.5" height="10.5" fill="#FFB900"/>
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Sign up prompt footer */}
                  <div className="text-center pt-2 border-t border-slate-50">
                    <span className="text-xs text-slate-450 font-semibold mr-1.5">New to BCSITHub?</span>
                    <Link
                      to="/signup"
                      className="inline-flex items-center gap-1.5 text-indigo-650 hover:text-indigo-800 text-xs font-black transition-colors"
                    >
                      <Star className="w-3.5 h-3.5 text-yellow-500 fill-current" />
                      Create a free account
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>

                </CardContent>
              </Card>
            </motion.div>

            {/* Bottom mini-footer info */}
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
                <span>Pokhara Uni</span>
              </div>
            </motion.div>

          </motion.div>
        </div>
      </div>
    </div>
  );
}