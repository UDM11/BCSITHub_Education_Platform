// src/pages/NotFound.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Home, ArrowLeft, BookOpen, FileText, Calculator, 
  HelpCircle, Compass, GraduationCap 
} from "lucide-react";
import { useSEO } from "../hooks/useSEO";

export function NotFound() {
  useSEO({
    title: "404 - Lost in the Library",
    description: "The page you are looking for does not exist on BCSITHub. Return home or browse our notes and past papers.",
    keywords: "404 not found, bcsithub page not found"
  });

  const navigate = useNavigate();

  // Stagger animation configurations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 25 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: "spring", stiffness: 100, damping: 15 } 
    },
  };

  const floatingVariants = {
    animate: {
      y: [0, -12, 0],
      rotate: [0, 4, -4, 0],
      transition: {
        duration: 6,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  return (
    <div className="min-h-screen bg-slate-50/40 relative overflow-hidden flex flex-col justify-center items-center px-4 py-16">
      
      {/* Background decoration glows */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl" />
      </div>

      {/* Floating Graduation Cap Icon */}
      <motion.div
        variants={floatingVariants}
        animate="animate"
        className="absolute top-16 sm:top-24 left-10 sm:left-24 text-indigo-250/20 w-16 h-16 sm:w-24 sm:h-24 pointer-events-none hidden md:block"
      >
        <GraduationCap className="w-full h-full text-indigo-400/20" />
      </motion.div>

      {/* Floating Book Icon */}
      <motion.div
        variants={floatingVariants}
        animate="animate"
        className="absolute bottom-16 sm:bottom-24 right-10 sm:right-24 text-purple-250/20 w-16 h-16 sm:w-24 sm:h-24 pointer-events-none hidden md:block"
        style={{ animationDelay: "1.5s" }}
      >
        <BookOpen className="w-full h-full text-purple-400/20" />
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-2xl w-full text-center space-y-8 z-10"
      >
        {/* Massive 3D-Style 404 text */}
        <motion.div variants={itemVariants} className="relative inline-block select-none">
          <h1 className="text-8xl sm:text-9xl font-black bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-800 bg-clip-text text-transparent tracking-tighter filter drop-shadow-md">
            404
          </h1>
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-2/3 h-2 bg-indigo-600/10 blur-sm rounded-full" />
        </motion.div>

        {/* Text Meta info */}
        <div className="space-y-3">
          <motion.h2 
            variants={itemVariants} 
            className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight flex items-center justify-center gap-2"
          >
            <Compass className="w-7 h-7 text-indigo-600 animate-spin-slow" />
            Lost in the Library?
          </motion.h2>
          <motion.p 
            variants={itemVariants} 
            className="text-xs sm:text-sm font-semibold text-slate-500 max-w-md mx-auto leading-relaxed"
          >
            The study resources or syllabus chapter page you are trying to visit has been archived, moved, or doesn't exist in our portal database.
          </motion.p>
        </div>

        {/* Action Triggers Grid */}
        <motion.div 
          variants={itemVariants}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto"
        >
          {/* Notes Portal Card */}
          <div 
            onClick={() => navigate("/notes")}
            className="p-5 bg-white border border-slate-200/60 rounded-3xl text-left cursor-pointer hover:border-indigo-300 hover:shadow-md transition-all flex items-start gap-4 group"
          >
            <div className="w-10 h-10 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105">
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="font-extrabold text-slate-850 text-xs sm:text-sm">Browse Course Notes</h3>
              <p className="text-[11px] font-semibold text-slate-500 mt-1 leading-normal">
                Access chapter summaries, exam outlines, and syllabus slides.
              </p>
            </div>
          </div>

          {/* Past Papers Card */}
          <div 
            onClick={() => navigate("/past-papers")}
            className="p-5 bg-white border border-slate-200/60 rounded-3xl text-left cursor-pointer hover:border-purple-300 hover:shadow-md transition-all flex items-start gap-4 group"
          >
            <div className="w-10 h-10 bg-purple-50 border border-purple-100 text-purple-600 rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105">
              <FileText className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="font-extrabold text-slate-850 text-xs sm:text-sm">Past Exam Papers</h3>
              <p className="text-[11px] font-semibold text-slate-500 mt-1 leading-normal">
                Browse, search, and download past semester question papers.
              </p>
            </div>
          </div>

          {/* CGPA Calculator Card */}
          <div 
            onClick={() => navigate("/cgpa-calculator")}
            className="p-5 bg-white border border-slate-200/60 rounded-3xl text-left cursor-pointer hover:border-emerald-300 hover:shadow-md transition-all flex items-start gap-4 group"
          >
            <div className="w-10 h-10 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105">
              <Calculator className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="font-extrabold text-slate-850 text-xs sm:text-sm">CGPA Calculator</h3>
              <p className="text-[11px] font-semibold text-slate-500 mt-1 leading-normal">
                Estimate course marks, SGPA, and cumulative target scores.
              </p>
            </div>
          </div>

          {/* Help Center Card */}
          <div 
            onClick={() => navigate("/support")}
            className="p-5 bg-white border border-slate-200/60 rounded-3xl text-left cursor-pointer hover:border-amber-300 hover:shadow-md transition-all flex items-start gap-4 group"
          >
            <div className="w-10 h-10 bg-amber-50 border border-amber-100 text-amber-600 rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="font-extrabold text-slate-850 text-xs sm:text-sm">Help & Support</h3>
              <p className="text-[11px] font-semibold text-slate-500 mt-1 leading-normal">
                Contact portal operators or submit a missing resource ticket.
              </p>
            </div>
          </div>

        </motion.div>

        {/* Global Navigation Console */}
        <motion.div 
          variants={itemVariants}
          className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-4"
        >
          <button
            onClick={() => navigate("/")}
            className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-purple-600 hover:brightness-110 text-white font-extrabold text-xs px-8 py-3.5 rounded-xl shadow-md border-0 transition-all cursor-pointer flex items-center justify-center gap-2 group"
          >
            <Home className="w-4 h-4" />
            <span>Go to Homepage</span>
          </button>
          
          <button
            onClick={() => navigate(-1)}
            className="w-full sm:w-auto bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 font-extrabold text-xs px-8 py-3.5 rounded-xl shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go Back</span>
          </button>
        </motion.div>

      </motion.div>
    </div>
  );
}
