import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Users,
  FileText,
  GraduationCap,
  Award,
  Zap,
  Shield,
  Star,
  ChevronRight,
  Play,
  CheckCircle,
  TrendingUp,
  Clock,
  Download,
  ArrowRight,
  MessageCircle,
  Smartphone,
  Laptop,
  Target,
  Mail,
  Plus,
  Minus,
  Trophy,
  Brain,
  Lightbulb,
  Flame,
  Timer,
  Share2,
  Code,
  Calculator,
  Search,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { useAuth } from '../context/AuthContext';
import { useProfile } from '../context/ProfileContext';
import { useInstallModal } from '@/context/InstallModalContext';
import { collegesData } from '../data/collegesData';
import { semesterData } from '../data/syllabusData';

// Stepped how-it-works steps
const howItWorksSteps = [
  {
    step: '01',
    title: 'Create Free Account',
    description: 'Sign up in seconds to unlock personalized learning plans and track your milestones.',
    icon: Users,
    gradient: 'from-blue-500 to-indigo-500',
  },
  {
    step: '02',
    title: 'Choose Your Semester',
    description: 'Select your current semester (from 1 to 8) to access your specific subject materials.',
    icon: Target,
    gradient: 'from-indigo-500 to-purple-500',
  },
  {
    step: '03',
    title: 'Learn & Use Tools',
    description: 'Dive into notes, solved past papers, or build coding skills with the online compiler.',
    icon: BookOpen,
    gradient: 'from-purple-500 to-pink-500',
  },
  {
    step: '04',
    title: 'Excel in Exams',
    description: 'Practice with the AI quiz generator and monitor your CGPA/SGPA progression.',
    icon: TrendingUp,
    gradient: 'from-pink-500 to-rose-500',
  },
];

// FAQ data
const faqs = [
  {
    question: 'Is BCSITHub completely free to use?',
    answer: 'Yes! BCSITHub is 100% free for all BCSIT students. We believe academic resources should be openly accessible to help students succeed.',
  },
  {
    question: 'Are all 8 semesters covered under Pokhara University?',
    answer: 'Absolutely. We cover the entire Pokhara University BCSIT curriculum, including syllabus details, credit structures, notes, and past papers for all semesters.',
  },
  {
    question: 'Can I download materials for offline study?',
    answer: 'Yes! The platform is built as a Progressive Web App (PWA). You can install it on your mobile or desktop and access cached notes and downloaded files offline.',
  },
  {
    question: 'How do the academic tools (like Code Compiler & Quiz Generator) help me?',
    answer: 'The Pomodoro Timer helps you maintain focus, the CGPA Calculator tracks your semester progress, the Code Compiler lets you run C/C++/Java/JS snippets, and the AI Quiz Generator tests your retention before exams.',
  },
  {
    question: 'Can I contribute my own study materials or notes?',
    answer: 'Yes! BCSITHub is a community platform. Once registered, students and teachers can upload notes, past paper solutions, and guidelines for others to review.',
  },
];

// Study tools catalog
const studyTools = [
  {
    icon: Calculator,
    title: 'CGPA Calculator',
    description: 'Plan and project your SGPA and overall CGPA with grade metrics.',
    color: 'from-amber-500 to-orange-500 text-orange-600 bg-orange-50/50 border-orange-100',
    link: '/cgpa-calculator',
  },
  {
    icon: Timer,
    title: 'Pomodoro Timer',
    description: 'Maintain study streaks with focused cycles and breaks.',
    color: 'from-rose-500 to-pink-500 text-rose-600 bg-rose-50/50 border-rose-100',
    link: '/pomodoro-timer',
  },
  {
    icon: Code,
    title: 'Code Compiler',
    description: 'Compile and test code fragments directly in the web browser.',
    color: 'from-emerald-500 to-teal-500 text-emerald-600 bg-emerald-50/50 border-emerald-100',
    link: '/code-compiler',
  },
  {
    icon: Brain,
    title: 'Quiz Generator',
    description: 'Generate customized practice questions to self-evaluate.',
    color: 'from-indigo-500 to-violet-500 text-indigo-600 bg-indigo-50/50 border-indigo-100',
    link: '/quiz-generator',
  },
];

// Testimonials
const testimonials = [
  {
    name: 'Suresh Adhikari',
    role: '6th Semester, BCSIT',
    college: 'Lalitpur, Nepal',
    content: 'The study tools like Pomodoro and notes are so helpful. I was able to raise my CGPA from 3.2 to 3.75 using this portal!',
    rating: 5,
    avatar: 'SA',
    color: 'from-indigo-500 to-purple-600',
  },
  {
    name: 'Monika Thapa',
    role: '8th Semester Graduate',
    college: 'Chitwan, Nepal',
    content: 'Finding past papers with reliable solutions used to be difficult. BCSITHub has them all sorted, saving me hours of search before finals.',
    rating: 5,
    avatar: 'MT',
    color: 'from-emerald-400 to-teal-600',
  },
  {
    name: 'Rohan Shrestha',
    role: '4th Semester, BCSIT',
    college: 'Pokhara, Nepal',
    content: 'A complete lifesaver! The user interface is so fast and smooth. It works even on mobile offline during power cuts.',
    rating: 5,
    avatar: 'RS',
    color: 'from-amber-400 to-orange-600',
  },
];

export function Home() {
  const [activeSemester, setActiveSemester] = useState('1'); // Semester Explorer
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [email, setEmail] = useState('');
  const [collegeSearch, setCollegeSearch] = useState('');
  const { user } = useAuth();
  const { profile } = useProfile();
  const { open: openInstallModal } = useInstallModal();
  const navigate = useNavigate();

  // Autofill user's current semester if logged in
  useEffect(() => {
    if (user && profile?.semester) {
      setActiveSemester(profile.semester);
    }
  }, [user, profile]);

  // Filter partner colleges based on search
  const filteredColleges = collegesData.filter(college =>
    college.name.toLowerCase().includes(collegeSearch.toLowerCase()) ||
    college.address.toLowerCase().includes(collegeSearch.toLowerCase())
  );

  // Dynamic variables for the dashboard preview
  const displayName = profile?.name || "Active Student";
  const displayInitials = profile?.name
    ? profile.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : "AS";
  const displaySemester = profile?.semester
    ? `Semester ${profile.semester}`
    : "Semester I";
  const displayCollege = profile?.college || "Pokhara University";

  return (
    <div className="min-h-screen bg-slate-50/30 overflow-x-hidden">
      
      {/* 1. Hero Section */}
      <section className="relative min-h-[90vh] bg-gradient-to-b from-indigo-950 via-slate-900 to-slate-950 text-white pt-24 pb-20 flex items-center overflow-hidden">
        
        {/* Abstract Glowing Mesh Circles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px]" />
          <div className="absolute top-1/3 -right-20 w-[450px] h-[450px] bg-purple-600/10 rounded-full blur-[140px]" />
          <div className="absolute -bottom-20 left-1/3 w-80 h-80 bg-violet-600/10 rounded-full blur-[100px]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Hero Left Content */}
            <div className="lg:col-span-7 text-left space-y-6">
              


              {/* Title & Headline */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15]"
              >
                Study Smart.
                <br />
                Master{' '}
                <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  BCSIT
                </span>{' '}
                with Ease.
              </motion.h1>

              {/* Subtext description */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-base sm:text-lg text-slate-300 max-w-xl font-normal leading-relaxed"
              >
                Explore comprehensive subject notes, syllabus metrics, past exam papers, and live practice tools designed exclusively to help you score high.
              </motion.p>

              {/* Call to Actions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="flex flex-col sm:flex-row gap-4 pt-2"
              >
                <Button
                  variant="primary"
                  size="lg"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl shadow-indigo-600/20 font-semibold px-8 rounded-xl"
                  onClick={() => navigate(user ? '/notes' : '/signup')}
                >
                  <span>{user ? 'Go to Study Room' : 'Start Learning Free'}</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  className="border border-white/20 text-white hover:bg-white/10 backdrop-blur-sm font-semibold px-8 rounded-xl"
                  onClick={() => navigate('/syllabus')}
                >
                  <BookOpen className="w-4 h-4 mr-2 text-indigo-400" />
                  <span>Browse Syllabus</span>
                </Button>
              </motion.div>

              {/* Trusted Indicators */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="flex flex-wrap items-center gap-6 text-slate-400 text-xs sm:text-sm pt-4 border-t border-slate-800/40"
              >
                <div className="flex items-center space-x-1.5">
                  <CheckCircle className="w-4 h-4 text-indigo-500" />
                  <span>Offline Ready</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <CheckCircle className="w-4 h-4 text-indigo-500" />
                  <span>No Subscriptions</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <CheckCircle className="w-4 h-4 text-indigo-500" />
                  <span>Interactive Mock Tests</span>
                </div>
              </motion.div>
            </div>

            {/* Hero Right Content (Interactive CSS Mockup Dashboard) */}
            <div className="lg:col-span-5 relative w-full flex justify-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="w-full max-w-sm sm:max-w-md bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-3xl p-5 shadow-2xl relative overflow-hidden flex flex-col space-y-4"
              >
                {/* Background lighting within container */}
                <div className="absolute -top-12 -right-12 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />
                <div className="absolute -bottom-12 -left-12 w-24 h-24 bg-purple-500/10 rounded-full blur-xl pointer-events-none" />

                {/* Mockup Header */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-3 relative z-10">
                  <div className="flex items-center space-x-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Portal Preview</span>
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                </div>

                {/* Dashboard Intro Widget */}
                <div className="bg-slate-850/60 border border-slate-800/80 p-3.5 rounded-2xl z-10 animate-fade-in">
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-bold text-slate-200">Welcome Back, {displayName}</span>
                    <span className="text-[10px] text-slate-400">{displaySemester} • {displayCollege}</span>
                  </div>
                </div>

                {/* Widgets Row */}
                <div className="grid grid-cols-2 gap-3 relative z-10">
                  {/* GPA Progress circle widget */}
                  <motion.div 
                    whileHover={{ y: -4 }}
                    className="bg-slate-850/60 border border-slate-800/80 p-3.5 rounded-2xl flex flex-col items-center justify-center text-center"
                  >
                    <span className="text-[10px] font-semibold text-slate-400 mb-2">Target CGPA</span>
                    <div className="relative w-16 h-16 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle cx="32" cy="32" r="28" className="stroke-slate-800 fill-transparent" strokeWidth="4" />
                        <circle cx="32" cy="32" r="28" className="stroke-indigo-500 fill-transparent" strokeWidth="4" strokeDasharray="175" strokeDashoffset="35" strokeLinecap="round" />
                      </svg>
                      <span className="absolute text-xs font-bold text-slate-200">3.84</span>
                    </div>
                  </motion.div>

                  {/* Study Streak widget */}
                  <motion.div 
                    whileHover={{ y: -4 }}
                    className="bg-slate-850/60 border border-slate-800/80 p-3.5 rounded-2xl flex flex-col items-center justify-center text-center"
                  >
                    <span className="text-[10px] font-semibold text-slate-400 mb-2">Study Streak</span>
                    <div className="w-10 h-10 bg-rose-500/10 border border-rose-500/20 rounded-full flex items-center justify-center mb-1">
                      <Flame className="w-5 h-5 text-rose-500 animate-bounce" />
                    </div>
                    <span className="text-xs font-bold text-slate-200">12 Days</span>
                  </motion.div>
                </div>

                {/* Recent Activities List Widget */}
                <div className="bg-slate-850/60 border border-slate-800/80 p-3.5 rounded-2xl flex flex-col text-left space-y-2 relative z-10">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Recent Study Activity</span>
                  
                  <div className="flex items-center justify-between text-xs py-1 border-b border-slate-800/50">
                    <div className="flex items-center space-x-2">
                      <FileText className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                      <span className="text-slate-300 truncate max-w-[150px]">Software Engineering Notes</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-medium">Just now</span>
                  </div>

                  <div className="flex items-center justify-between text-xs py-1">
                    <div className="flex items-center space-x-2">
                      <GraduationCap className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                      <span className="text-slate-300 truncate max-w-[150px]">Solved Question paper 2024</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-medium">2h ago</span>
                  </div>
                </div>

                {/* Mini bar chart tracker */}
                <div className="bg-slate-850/60 border border-slate-800/80 p-3.5 rounded-2xl flex flex-col text-left relative z-10">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Study Time Tracker (Hours)</span>
                  <div className="flex items-end justify-between h-12 px-2">
                    <div className="flex flex-col items-center space-y-1">
                      <div className="w-3 bg-slate-800 rounded-t-sm h-6" />
                      <span className="text-[8px] text-slate-500">M</span>
                    </div>
                    <div className="flex flex-col items-center space-y-1">
                      <div className="w-3 bg-indigo-500 rounded-t-sm h-10" />
                      <span className="text-[8px] text-slate-500">T</span>
                    </div>
                    <div className="flex flex-col items-center space-y-1">
                      <div className="w-3 bg-indigo-500 rounded-t-sm h-8" />
                      <span className="text-[8px] text-slate-500">W</span>
                    </div>
                    <div className="flex flex-col items-center space-y-1">
                      <div className="w-3 bg-purple-500 rounded-t-sm h-12" />
                      <span className="text-[8px] text-slate-500">T</span>
                    </div>
                    <div className="flex flex-col items-center space-y-1">
                      <div className="w-3 bg-slate-800 rounded-t-sm h-4" />
                      <span className="text-[8px] text-slate-500">F</span>
                    </div>
                    <div className="flex flex-col items-center space-y-1">
                      <div className="w-3 bg-emerald-500 rounded-t-sm h-9" />
                      <span className="text-[8px] text-slate-500">S</span>
                    </div>
                  </div>
                </div>

                {/* Floating crown badge */}
                <motion.div
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute -top-3 -left-6 bg-white border border-slate-100 rounded-2xl shadow-lg p-2.5 flex items-center space-x-2 text-slate-800 scale-90 z-20 pointer-events-none"
                >
                  <div className="w-8 h-8 bg-amber-500/10 rounded-xl flex items-center justify-center">
                    <Trophy className="w-4 h-4 text-amber-500" />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-[10px] font-bold">Quiz Master</span>
                    <span className="text-[8px] text-slate-500">100% Score achieved</span>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. core Stats Box (Overlap layout) */}
      <section className="relative z-20 -mt-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white/80 backdrop-blur-md border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-xl shadow-slate-200/50 grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {[
            { label: 'Active Students', value: '2,500+', icon: Users, color: 'text-indigo-600 bg-indigo-50' },
            { label: 'Study Resources', value: '10,000+', icon: FileText, color: 'text-purple-600 bg-purple-50' },
            { label: 'Practice Hours', value: '50,000+', icon: Clock, color: 'text-rose-600 bg-rose-50' },
            { label: 'Partner Colleges', value: '25+', icon: Award, color: 'text-amber-600 bg-amber-50' },
          ].map((stat, i) => (
            <div key={stat.label} className="flex items-center space-x-3.5">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.color} flex-shrink-0 border border-current/10`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-none mb-1">
                  {stat.value}
                </span>
                <span className="text-xs font-semibold text-slate-500">
                  {stat.label}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Interactive Semester Explorer */}
      <section className="py-24 relative bg-slate-50/50">
        
        {/* Soft Background blob */}
        <div className="absolute top-1/4 left-10 w-96 h-96 bg-indigo-50 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <div className="inline-flex items-center space-x-1.5 bg-indigo-50 border border-indigo-100 rounded-full px-4 py-1.5">
              <BookOpen className="w-4 h-4 text-indigo-600" />
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Syllabus Explorer</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Explore Semester{' '}
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Curriculum
              </span>
            </h2>
            <p className="text-base text-slate-600 leading-relaxed">
              Dynamically browse notes, lecture syllabus details, and credits required for all 8 semesters of the Pokhara University BCSIT program.
            </p>
          </div>

          {/* Semester Tabs - Horizontally Scrollable on Mobile */}
          <div className="flex justify-start lg:justify-center items-center overflow-x-auto pb-4 mb-10 -mx-4 px-4 scrollbar-none space-x-2">
            {Object.keys(semesterData).map((semKey) => {
              const sem = semesterData[semKey];
              return (
                <button
                  key={semKey}
                  onClick={() => setActiveSemester(semKey)}
                  className={`flex-shrink-0 px-5 py-2.5 rounded-full text-xs font-bold transition-all border ${
                    activeSemester === semKey
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-600/15'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-400 hover:text-indigo-600'
                  }`}
                >
                  {sem.title}
                </button>
              );
            })}
          </div>

          {/* Course Subject Cards grid */}
          <motion.div
            key={activeSemester}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {semesterData[activeSemester]?.courses.map((course) => (
              <div
                key={course.code || course.name}
                className="bg-white rounded-2xl border border-slate-100 shadow-md hover:shadow-lg transition-all duration-300 flex flex-col h-full group"
              >
                <div className="p-6 flex-1 flex flex-col text-left justify-between space-y-4">
                  <div>
                    {/* Badge line */}
                    <div className="flex items-center justify-between mb-3.5">
                      <span className="text-[10px] font-extrabold text-indigo-600 bg-indigo-50/80 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                        {course.code || 'PU Course'}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">
                        {course.credits} Credits
                      </span>
                    </div>
                    {/* Course Title */}
                    <h4 className="text-base font-bold text-slate-800 leading-snug group-hover:text-indigo-600 transition-colors">
                      {course.name}
                    </h4>
                    <p className="text-xs text-slate-500 font-normal leading-relaxed mt-2">
                      Access dynamic unit notes, solutions to past examinations, and reference materials.
                    </p>
                  </div>

                  <Button
                    variant="outline"
                    className="w-full justify-between hover:bg-indigo-600 hover:text-white hover:border-indigo-600 group-hover:translate-x-0.5 transition-all text-xs"
                    onClick={() => {
                      const subjectCode = course.code || course.name;
                      navigate(`/notes/semester/${activeSemester}/subject/${encodeURIComponent(subjectCode)}`);
                    }}
                  >
                    <span>View Study Materials</span>
                    <ArrowRight className="w-4 h-4 ml-1.5" />
                  </Button>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 4. Bento-style Features Grid */}
      <section className="py-24 bg-white relative">
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-50 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <div className="inline-flex items-center space-x-1.5 bg-purple-50 border border-purple-100 rounded-full px-4 py-1.5">
              <Zap className="w-4 h-4 text-purple-600" />
              <span className="text-xs font-bold text-purple-600 uppercase tracking-wider">Why BCSITHub</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Comprehensive Tools Built for{' '}
              <span className="bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 bg-clip-text text-transparent">
                Student Growth
              </span>
            </h2>
            <p className="text-base text-slate-600 leading-relaxed">
              Every feature on this platform is crafted to address the exact challenges faced by Pokhara University IT students.
            </p>
          </div>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:auto-rows-[240px]">
            
            {/* Bento Card 1: Smart Notes (Large) */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="lg:col-span-2 row-span-1 md:row-span-2 bg-gradient-to-br from-indigo-900 to-indigo-950 rounded-3xl p-8 text-white relative overflow-hidden flex flex-col justify-between shadow-lg"
            >
              <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="space-y-3 relative z-10 text-left">
                <div className="w-12 h-12 bg-white/10 border border-white/10 rounded-2xl flex items-center justify-center">
                  <FileText className="w-6 h-6 text-indigo-300" />
                </div>
                <h3 className="text-2xl font-bold tracking-tight">Smart Study Materials</h3>
                <p className="text-slate-300 text-sm max-w-md leading-relaxed">
                  Say goodbye to photocopies. Access structured unit notes curated by senior students and educators, compiled specifically for Pokhara University syllabi.
                </p>
              </div>
              <div className="flex flex-wrap gap-2.5 relative z-10 pt-4 border-t border-white/10 mt-6 lg:mt-0">
                {['Unit Notes', 'Solved Past Papers', 'Syllabus Breakdowns', 'Syllabus PDFs'].map((tag) => (
                  <span key={tag} className="text-xs bg-white/10 px-3 py-1 rounded-full text-indigo-200 border border-white/5">
                    {tag}
                  </span>
                ))}
              </div>
            </motion.div>

            {/* Bento Card 2: Community Forum */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-white border border-slate-100 rounded-3xl p-6 flex flex-col justify-between shadow-md hover:shadow-lg transition-all"
            >
              <div className="space-y-3 text-left">
                <div className="w-11 h-11 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center border border-purple-100">
                  <Users className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-800">Expert Community</h3>
                <p className="text-slate-500 text-xs font-normal leading-relaxed">
                  Join doubt-clearing sections, connect with academic mentors, and share study materials.
                </p>
              </div>
              <div className="flex items-center space-x-2 text-xs font-bold text-purple-600 pt-3">
                <span>Join Forums</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </motion.div>

            {/* Bento Card 3: Progress Analytics */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-white border border-slate-100 rounded-3xl p-6 flex flex-col justify-between shadow-md hover:shadow-lg transition-all"
            >
              <div className="space-y-3 text-left">
                <div className="w-11 h-11 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center border border-rose-100">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-800">Progress Tracking</h3>
                <p className="text-slate-500 text-xs font-normal leading-relaxed">
                  Log your study intervals and grade milestones. Check progress with visual target parameters.
                </p>
              </div>
              <div className="flex items-center space-x-2 text-xs font-bold text-rose-600 pt-3">
                <span>View Analytics</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </motion.div>

            {/* Bento Card 4: Exam Excellence (Horizontal large) */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="lg:col-span-3 bg-gradient-to-br from-purple-900 via-purple-950 to-slate-900 rounded-3xl p-8 text-white relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center shadow-lg"
            >
              <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="space-y-3 relative z-10 text-left max-w-xl">
                <div className="w-12 h-12 bg-white/10 border border-white/10 rounded-2xl flex items-center justify-center">
                  <GraduationCap className="w-6 h-6 text-purple-300" />
                </div>
                <h3 className="text-2xl font-bold tracking-tight">Exam Excellence Strategy</h3>
                <p className="text-slate-300 text-sm leading-relaxed">
                  Ace your board exams with our comprehensive list of previous question papers (2018–2024), expert solution guides, and exam structures.
                </p>
              </div>
              <Button
                onClick={() => navigate('/past-papers')}
                className="bg-white hover:bg-slate-50 text-slate-850 font-bold px-6 py-3 rounded-xl shadow-lg mt-6 md:mt-0 relative z-10 border-0 flex-shrink-0 self-start md:self-auto text-xs"
              >
                Access Past Papers
                <ArrowRight className="w-4 h-4 ml-1.5 text-purple-600" />
              </Button>
            </motion.div>

          </div>
        </div>
      </section>

      {/* 5. Study Tools Showcase */}
      <section className="py-24 bg-slate-50/50 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <div className="inline-flex items-center space-x-1.5 bg-amber-50 border border-amber-100 rounded-full px-4 py-1.5">
              <Calculator className="w-4 h-4 text-amber-600" />
              <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">Utility Suite</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Interactive Academic{' '}
              <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
                Study Tools
              </span>
            </h2>
            <p className="text-base text-slate-600 leading-relaxed">
              Don't just read. Practice with our custom tool suite designed to optimize study habits, track grades, and compiler codes.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {studyTools.map((tool) => {
              const ToolIcon = tool.icon;
              return (
                <div
                  key={tool.title}
                  onClick={() => navigate(tool.link)}
                  className="bg-white rounded-2xl p-6 border border-slate-100 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col text-left justify-between space-y-6 cursor-pointer group"
                >
                  <div className="space-y-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${tool.color} group-hover:scale-105 transition-transform`}>
                      <ToolIcon className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                      {tool.title}
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed font-normal">
                      {tool.description}
                    </p>
                  </div>
                  <div className="flex items-center text-xs font-bold text-slate-600 group-hover:text-indigo-600 transition-colors">
                    <span>Open Tool</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 6. Stepped "How it Works" */}
      <section className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <div className="inline-flex items-center space-x-1.5 bg-blue-50 border border-blue-100 rounded-full px-4 py-1.5">
              <Play className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Simple Steps</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              How BCSITHub{' '}
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Works
              </span>
            </h2>
            <p className="text-base text-slate-600 leading-relaxed">
              Start your journey to Academic Excellence in under two minutes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            {howItWorksSteps.map((step, index) => {
              const StepIcon = step.icon;
              return (
                <div key={step.step} className="text-center relative flex flex-col items-center">
                  
                  {/* Step Connector Line */}
                  {index < howItWorksSteps.length - 1 && (
                    <div className="hidden lg:block absolute top-9 left-1/2 w-full h-[2px] bg-gradient-to-r from-indigo-100 to-purple-100 z-0" />
                  )}

                  {/* Icon Card */}
                  <div className="relative mb-5 z-10">
                    <div className="w-16 h-16 bg-gradient-to-tr from-indigo-600 to-violet-600 rounded-2xl flex items-center justify-center text-white shadow-md shadow-indigo-100">
                      <StepIcon className="w-8 h-8" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-amber-400 rounded-full flex items-center justify-center text-[10px] font-bold text-gray-900 border border-white">
                      {step.step}
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-slate-800 mb-2">{step.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed max-w-[200px]">{step.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 7. Multi-Platform Capabilities */}
      <section className="py-24 bg-slate-50/50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-6 text-left space-y-6">
              <div className="inline-flex items-center space-x-1.5 bg-purple-50 border border-purple-100 rounded-full px-4 py-1.5">
                <Smartphone className="w-4 h-4 text-purple-600" />
                <span className="text-xs font-bold text-purple-600 uppercase tracking-wider">Multi-Platform</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                Study Anywhere,{' '}
                <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Anytime
                </span>
              </h2>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                Access your notes seamlessly across all devices. Since the platform is fully responsive and PWA-enabled, you can read on your laptop, tablet, or smartphone without losing your study history.
              </p>

              <div className="space-y-4">
                {[
                  { icon: Laptop, title: 'Desktop & Laptop Layouts', desc: 'Full study-oriented environment with compile & calculate utilities.' },
                  { icon: Smartphone, title: 'Offline Mobile PWA', desc: 'Add to Home Screen to load notes instantaneously even with slow internet.' },
                ].map((item, i) => (
                  <div key={i} className="flex items-start space-x-3.5">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div className="text-left">
                      <h4 className="text-sm font-bold text-slate-800">{item.title}</h4>
                      <p className="text-xs text-slate-500 leading-relaxed mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Card (Mobile App notification widget) */}
            <div className="lg:col-span-6 flex justify-center">
              <div className="w-full max-w-md bg-gradient-to-tr from-indigo-600 via-indigo-700 to-purple-800 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl text-left space-y-5">
                <div className="absolute top-0 right-0 w-82 h-82 bg-white/5 rounded-full blur-3xl pointer-events-none" />
                
                <span className="text-[10px] font-bold text-yellow-400 bg-yellow-400/10 border border-yellow-400/20 px-2.5 py-0.5 rounded-full uppercase tracking-wider inline-block">
                  PWA Mobile App
                </span>

                <h3 className="text-2xl font-bold tracking-tight">Download App for Offline Access</h3>
                <p className="text-indigo-200 text-xs sm:text-sm leading-relaxed">
                  Install BCSITHub directly onto your mobile device for rapid, offline cached studies. Read your notes in college halls or on the bus, no data packs required.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <Button
                    onClick={openInstallModal}
                    className="bg-white hover:bg-slate-50 text-indigo-600 font-bold px-6 py-3 rounded-xl shadow-lg border-0 text-xs flex items-center justify-center"
                  >
                    <Download className="w-4 h-4 mr-1.5" />
                    Install App on Mobile
                  </Button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 8. Testimonials Section */}
      <section className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <div className="inline-flex items-center space-x-1.5 bg-rose-50 border border-rose-100 rounded-full px-4 py-1.5">
              <Star className="w-4 h-4 text-rose-600" />
              <span className="text-xs font-bold text-rose-600 uppercase tracking-wider">Success Stories</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Loved by BCSIT{' '}
              <span className="bg-gradient-to-r from-rose-500 to-pink-500 bg-clip-text text-transparent">
                Students
              </span>
            </h2>
            <p className="text-base text-slate-600 leading-relaxed">
              Read how our study materials and resources helped IT students improve their grades.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((test, index) => (
              <div
                key={test.name}
                className="bg-slate-50/50 border border-slate-100 rounded-2xl p-6 flex flex-col justify-between space-y-5 text-left"
              >
                <div className="space-y-4">
                  {/* Rating Stars */}
                  <div className="flex items-center space-x-0.5">
                    {[...Array(test.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                    ))}
                  </div>
                  {/* Review Text */}
                  <p className="text-slate-600 text-xs sm:text-sm italic leading-relaxed">
                    "{test.content}"
                  </p>
                </div>

                {/* Profile Card */}
                <div className="flex items-center space-x-3 pt-3 border-t border-slate-200/50">
                  <div className={`w-9 h-9 bg-gradient-to-tr ${test.color} rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-sm`}>
                    {test.avatar}
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-bold text-slate-800">{test.name}</span>
                    <span className="text-[10px] text-slate-400 font-medium">{test.role}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. FAQ Section */}
      <section className="py-24 bg-slate-50/50 relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <div className="inline-flex items-center space-x-1.5 bg-indigo-50 border border-indigo-100 rounded-full px-4 py-1.5">
              <MessageCircle className="w-4 h-4 text-indigo-600" />
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Help Desk</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Frequently Asked{' '}
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Questions
              </span>
            </h2>
            <p className="text-base text-slate-600">
              Clear your doubts about using the portal.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm transition-all duration-200"
              >
                <button
                  className="w-full px-6 sm:px-8 py-5 text-left flex items-center justify-between hover:bg-slate-50/50 transition-colors"
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                >
                  <h3 className="text-sm sm:text-base font-bold text-slate-800 pr-4">{faq.question}</h3>
                  {openFaq === index ? (
                    <Minus className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                  ) : (
                    <Plus className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  )}
                </button>
                
                <AnimatePresence>
                  {openFaq === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="px-6 sm:px-8 pb-5 border-t border-slate-50 pt-2 text-left"
                    >
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                        {faq.answer}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 10. Partner Colleges Section */}
      <section className="py-20 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-10">
          <div className="space-y-3">
            <h3 className="text-xl font-bold text-slate-800">Trusted by Students Across Leading Colleges</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Students from top Pokhara University affiliated colleges choose BCSITHub for their studies.
            </p>
          </div>

          {/* Search bar inside colleges */}
          <div className="max-w-md mx-auto relative">
            <input
              type="text"
              placeholder="Search your college (e.g. Ace, SAIM, Quest)..."
              value={collegeSearch}
              onChange={(e) => setCollegeSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 text-xs text-slate-800"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          </div>

          {/* College logo grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
            {filteredColleges.slice(0, 12).map((college) => (
              <div
                key={college.id}
                onClick={() => window.open(college.website, '_blank')}
                className="bg-slate-50/50 hover:bg-white border border-slate-100 hover:border-indigo-100 hover:shadow-lg transition-all duration-300 rounded-2xl p-4 flex flex-col justify-center items-center text-center cursor-pointer group h-32"
              >
                <div className="w-12 h-12 rounded-lg overflow-hidden flex items-center justify-center mb-2.5 bg-white">
                  <img
                    src={college.logo}
                    alt={college.name}
                    className="max-w-full max-h-full object-contain p-1"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/64';
                    }}
                  />
                </div>
                <span className="text-[10px] font-bold text-slate-600 truncate w-full group-hover:text-indigo-600 transition-colors">
                  {college.name}
                </span>
                <span className="text-[8px] text-slate-400 mt-0.5 truncate w-full">
                  {college.address}
                </span>
              </div>
            ))}
          </div>

          {filteredColleges.length === 0 && (
            <p className="text-xs text-slate-400 py-6">No colleges found matching "{collegeSearch}".</p>
          )}

          <div className="pt-4">
            <Button
              variant="outline"
              onClick={() => navigate('/colleges')}
              className="border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold px-6 py-2.5 rounded-xl"
            >
              <span>Explore All Colleges ({collegesData.length})</span>
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </div>
        </div>
      </section>



    </div>
  );
}
