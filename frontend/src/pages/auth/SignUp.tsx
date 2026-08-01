// src/pages/auth/SignUp.tsx
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  Mail,
  Lock,
  User,
  UserPlus,
  BookOpen,
  MapPin,
  Eye,
  EyeOff,
  Shield,
  Users,
  Award,
  ArrowRight,
  Sparkles,
  Star,
  GraduationCap,
  Building,
  Calendar
} from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Card, CardContent } from "../../components/ui/Card";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-hot-toast";
import { useSEO } from "../../hooks/useSEO";

const schema = yup.object({
  name: yup.string().required("Name is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
  password: yup
    .string()
    .min(8, "Password must be at least 8 characters")
    .required("Password is required"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "Passwords must match")
    .required("Confirm password is required"),
  role: yup.string().required("Role is required"),
  semester: yup.number().when("role", {
    is: "student",
    then: (schema) => schema.required("Semester is required for students"),
    otherwise: (schema) => schema.notRequired(),
  }),
  college: yup.string().when("role", {
    is: "student",
    then: (schema) => schema.required("College is required for students"),
    otherwise: (schema) => schema.notRequired(),
  }),
});

interface FormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: string;
  semester?: number;
  college?: string;
}

const roleOptions = [
  { value: "student", label: "Student" },
  { value: "teacher", label: "Teacher" },
];

const semesterOptions = [
  { value: 1, label: "1st Semester" },
  { value: 2, label: "2nd Semester" },
  { value: 3, label: "3rd Semester" },
  { value: 4, label: "4th Semester" },
  { value: 5, label: "5th Semester" },
  { value: 6, label: "6th Semester" },
  { value: 7, label: '7th Semester' },
  { value: 8, label: '8th Semester' },
];

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

export function SignUp() {
  useSEO({
    title: "Create Your Account",
    description: "Sign up to BCSITHub to unlock custom study trackers, download past papers, and access computing lecture notes.",
    keywords: "bcsit signup, register bcsithub, pu student registration"
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  const { signUp } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    trigger,
  } = useForm<FormData>({
    resolver: yupResolver(schema),
  });

  const watchedRole = watch("role");
  const watchedCollege = watch("college");

  // Auto-slide testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const getCollegeAddress = () => {
    if (!watchedCollege) return "";
    const college = collegeOptions.find((c) => c.value === watchedCollege);
    return college ? college.address : "";
  };

  const nextStep = async () => {
    const fieldsToValidate = currentStep === 1 
      ? ["name", "email", "role"] 
      : ["password", "confirmPassword"];
    
    // For students, check semester and college in step 1 too
    if (currentStep === 1 && watchedRole === "student") {
      fieldsToValidate.push("semester", "college");
    }

    const isValid = await trigger(fieldsToValidate as any);
    if (isValid) {
      setCurrentStep(2);
    } else {
      toast.error("Please fill in all required fields correctly.");
    }
  };

  const prevStep = () => {
    setCurrentStep(1);
  };

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);
      setError("");

      const additionalData: any = {};
      if (data.role === "student") {
        additionalData.semester = data.semester;
        additionalData.college = data.college;
        additionalData.collegeAddress = getCollegeAddress();
      }

      await signUp(data.email, data.password, data.name, data.role, additionalData);
      toast.success("Account created successfully!");
      navigate("/");
    } catch (err: any) {
      setError(err.message || "Failed to create account");
      toast.error(err.message || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
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
                Start Your
                <span className="block bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-500 bg-clip-text text-transparent mt-1">
                  Learning Journey
                </span>
              </h1>
              <p className="text-sm text-indigo-200/70 font-semibold mt-4 leading-relaxed max-w-md">
                Create a student profile to save bookmarks, download course guides, compute your CGPA grades, and practice coding tools.
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

        {/* RIGHT PANEL - Glassmorphic Signup Form */}
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
                Create Your Account
              </h2>
              <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">
                Join the portal and access comprehensive course syllabi.
              </p>
            </motion.div>

            {/* Step Indicators */}
            <motion.div variants={itemVariants} className="mb-2">
              <div className="flex items-center justify-center sm:justify-start space-x-4">
                <div className={`flex items-center ${currentStep >= 1 ? "text-indigo-650" : "text-slate-400"}`}>
                  <div className={`w-8 h-8 rounded-xl text-xs font-bold flex items-center justify-center transition-all duration-300 ${currentStep >= 1 ? "bg-indigo-600 text-white shadow-sm ring-4 ring-indigo-500/10" : "bg-slate-200"}`}>
                    1
                  </div>
                  <span className="ml-2 text-xs font-extrabold uppercase tracking-wider hidden sm:inline">Basic Info</span>
                </div>
                <div className={`w-12 h-0.5 transition-all duration-500 ${currentStep >= 2 ? "bg-indigo-600" : "bg-slate-200"}`} />
                <div className={`flex items-center ${currentStep >= 2 ? "text-indigo-650" : "text-slate-400"}`}>
                  <div className={`w-8 h-8 rounded-xl text-xs font-bold flex items-center justify-center transition-all duration-300 ${currentStep >= 2 ? "bg-indigo-600 text-white shadow-sm ring-4 ring-indigo-500/10" : "bg-slate-200"}`}>
                    2
                  </div>
                  <span className="ml-2 text-xs font-extrabold uppercase tracking-wider hidden sm:inline">Security</span>
                </div>
              </div>
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
                    <AnimatePresence mode="wait">
                      
                      {/* STEP 1: Basic Information */}
                      {currentStep === 1 ? (
                        <motion.div
                          key="step1"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ duration: 0.25 }}
                          className="space-y-4"
                        >
                          {/* Name Input */}
                          <div className="space-y-1.5">
                            <label className="block text-[10px] font-extrabold text-slate-500 mb-1 uppercase tracking-wider">
                              Full Name
                            </label>
                            <div className="relative group">
                              <User className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-650 transition-colors" />
                              <input
                                type="text"
                                placeholder="Enter your full name"
                                {...register("name")}
                                className={`w-full pl-11 pr-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all duration-300 bg-white/90 text-slate-800 placeholder:text-slate-400 ${
                                  errors.name ? "border-rose-300 ring-rose-500/5 focus:border-rose-500" : "border-slate-200"
                                }`}
                              />
                            </div>
                            {errors.name && (
                              <p className="mt-1 text-xs font-bold text-rose-600 pl-1">{errors.name.message}</p>
                            )}
                          </div>

                          {/* Email Input */}
                          <div className="space-y-1.5">
                            <label className="block text-[10px] font-extrabold text-slate-500 mb-1 uppercase tracking-wider">
                              Email Address
                            </label>
                            <div className="relative group">
                              <Mail className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-650 transition-colors" />
                              <input
                                type="email"
                                placeholder="Enter your email"
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

                          {/* Role Select */}
                          <div className="space-y-1.5">
                            <label className="block text-[10px] font-extrabold text-slate-500 mb-1 uppercase tracking-wider">
                              I am a
                            </label>
                            <div className="relative group">
                              <GraduationCap className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-650 transition-colors pointer-events-none" />
                              <select
                                {...register("role")}
                                className={`w-full pl-11 pr-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all duration-300 bg-white/90 text-slate-800 font-semibold cursor-pointer ${
                                  errors.role ? "border-rose-300 ring-rose-500/5 focus:border-rose-500" : "border-slate-200"
                                }`}
                              >
                                <option value="">Select your role</option>
                                {roleOptions.map((option) => (
                                  <option key={option.value} value={option.value}>
                                    {option.label}
                                  </option>
                                ))}
                              </select>
                            </div>
                            {errors.role && (
                              <p className="mt-1 text-xs font-bold text-rose-600 pl-1">{errors.role.message}</p>
                            )}
                          </div>

                          {/* Student Specific Fields */}
                          {watchedRole === "student" && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className="space-y-4 pt-1"
                            >
                              {/* Semester */}
                              <div className="space-y-1.5">
                                <label className="block text-[10px] font-extrabold text-slate-500 mb-1 uppercase tracking-wider">
                                  Current Semester
                                </label>
                                <div className="relative group">
                                  <Calendar className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-650 transition-colors pointer-events-none" />
                                  <select
                                    {...register("semester")}
                                    className={`w-full pl-11 pr-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all duration-300 bg-white/90 text-slate-800 font-semibold cursor-pointer ${
                                      errors.semester ? "border-rose-300 ring-rose-500/5 focus:border-rose-500" : "border-slate-200"
                                    }`}
                                  >
                                    <option value="">Select your semester</option>
                                    {semesterOptions.map((option) => (
                                      <option key={option.value} value={option.value}>
                                        {option.label}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                                {errors.semester && (
                                  <p className="mt-1 text-xs font-bold text-rose-600 pl-1">{errors.semester.message}</p>
                                )}
                              </div>

                              {/* College Selection */}
                              <div className="space-y-1.5">
                                <label className="block text-[10px] font-extrabold text-slate-500 mb-1 uppercase tracking-wider">
                                  College
                                </label>
                                <div className="relative group">
                                  <Building className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-650 transition-colors pointer-events-none" />
                                  <select
                                    {...register("college")}
                                    className={`w-full pl-11 pr-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all duration-300 bg-white/90 text-slate-800 font-semibold cursor-pointer ${
                                      errors.college ? "border-rose-300 ring-rose-500/5 focus:border-rose-500" : "border-slate-200"
                                    }`}
                                  >
                                    <option value="">Select your college</option>
                                    {collegeOptions.map((option) => (
                                      <option key={option.value} value={option.value}>
                                        {option.label}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                                {errors.college && (
                                  <p className="mt-1 text-xs font-bold text-rose-600 pl-1">{errors.college.message}</p>
                                )}
                              </div>

                              {/* College Address Badge */}
                              {watchedCollege && watchedCollege !== "Other" && (
                                <motion.div 
                                  initial={{ opacity: 0, y: -5 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  className="flex items-start space-x-2 text-[11px] font-semibold text-indigo-650 bg-indigo-50/50 p-3 rounded-xl border border-indigo-100/50"
                                >
                                  <MapPin className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-indigo-600" />
                                  <span className="leading-tight">{getCollegeAddress()}</span>
                                </motion.div>
                              )}
                            </motion.div>
                          )}

                          <Button
                            type="button"
                            onClick={nextStep}
                            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-3.5 rounded-xl shadow-md transition-all duration-205 flex items-center justify-center gap-2"
                          >
                            <span>Continue</span>
                            <ArrowRight className="w-4.5 h-4.5" />
                          </Button>
                        </motion.div>
                      ) : (
                        
                        /* STEP 2: Password and Security */
                        <motion.div
                          key="step2"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ duration: 0.25 }}
                          className="space-y-4"
                        >
                          {/* Password */}
                          <div className="space-y-1.5">
                            <label className="block text-[10px] font-extrabold text-slate-500 mb-1 uppercase tracking-wider">
                              Password
                            </label>
                            <div className="relative group">
                              <Lock className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-650 transition-colors" />
                              <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Create a strong password"
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

                          {/* Confirm Password */}
                          <div className="space-y-1.5">
                            <label className="block text-[10px] font-extrabold text-slate-500 mb-1 uppercase tracking-wider">
                              Confirm Password
                            </label>
                            <div className="relative group">
                              <Lock className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-650 transition-colors" />
                              <input
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="Confirm your password"
                                {...register("confirmPassword")}
                                className={`w-full pl-11 pr-12 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all duration-300 bg-white/90 text-slate-800 placeholder:text-slate-400 ${
                                  errors.confirmPassword ? "border-rose-300 ring-rose-500/5 focus:border-rose-500" : "border-slate-200"
                                }`}
                              />
                              <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3.5 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                              >
                                {showConfirmPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                              </button>
                            </div>
                            {errors.confirmPassword && (
                              <p className="mt-1 text-xs font-bold text-rose-600 pl-1">{errors.confirmPassword.message}</p>
                            )}
                          </div>

                          {/* Control Buttons */}
                          <div className="flex gap-4 pt-1">
                            <button
                              type="button"
                              onClick={prevStep}
                              className="flex-1 py-3 border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-350 rounded-xl font-bold text-xs transition-all duration-200 cursor-pointer"
                            >
                              Back
                            </button>
                            <button
                              type="submit"
                              disabled={loading}
                              className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-650 hover:brightness-110 text-white font-bold py-3 rounded-xl shadow-md transition-all duration-200 border-0 text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              {loading ? (
                                <>
                                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                  <span>Creating...</span>
                                </>
                              ) : (
                                <>
                                  <UserPlus className="w-4 h-4" />
                                  <span>Create Account</span>
                                </>
                              )}
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </form>

                  {/* Sign in prompt footer */}
                  <div className="text-center pt-2 border-t border-slate-50">
                    <span className="text-xs text-slate-450 font-semibold mr-1.5">Already have an account?</span>
                    <Link
                      to="/signin"
                      className="inline-flex items-center gap-1.5 text-indigo-650 hover:text-indigo-800 text-xs font-black transition-colors"
                    >
                      <Star className="w-3.5 h-3.5 text-yellow-500 fill-current" />
                      Sign in here
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>

                </CardContent>
              </Card>
            </motion.div>

            {/* Bottom stats details */}
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
                <span>PU Curriculum</span>
              </div>
            </motion.div>

          </motion.div>
        </div>
      </div>
    </div>
  );
}