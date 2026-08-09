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
  Bell,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { useAuth } from '../context/AuthContext';
import { useProfile } from '../context/ProfileContext';
import { useInstallModal } from '@/context/InstallModalContext';
import { collegesData } from '../data/collegesData';
import { semesterData } from '../data/syllabusData';
import { semestersData } from '../data/notesData';
import { useSEO } from '../hooks/useSEO';
import { apiClient } from '../lib/apiClient';
import { watermarkFile } from '../lib/watermark';
import { PaperPreviewModal } from '../components/Notes/PaperPreviewModal';
import LoginRedirectModal from '../components/common/LoginRedirectModal';
import { NoticeReaderModal } from '../components/common/NoticeReaderModal';

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
    question: 'Where can I find Pokhara University BCSIT notes and syllabus guidelines?',
    answer: 'BCSITHub offers complete semester-wise BCSIT notes, course syllabus breakdowns, and examination guidelines. You can access bcsit 1st sem notes, 2nd sem notes, 3rd sem notes, 4th sem notes, and upcoming senior modules for free.',
  },
  {
    question: 'How do I download BCSIT past question papers and solutions?',
    answer: 'Navigate to the Past Papers section to search and download Pokhara University BCSIT question papers and solved answer keys. You can filter by subject code (e.g., CMP 271 Database Management System notes) and semester.',
  },
  {
    question: 'Which are the best BCSIT colleges in Nepal affiliated with Pokhara University?',
    answer: 'You can explore our Colleges page for a comprehensive list of top BCSIT colleges in Nepal, including Nepal College of Information Technology (NCIT), Gandaki College of Engineering, Prime College, and others with address details.',
  },
  {
    question: 'Where can I see the latest Pokhara University BCSIT notices?',
    answer: 'We fetch and publish official exam schedules, result updates, and academic notifications in real-time under the PU Notices panel, keeping you updated instantly.',
  },
  {
    question: 'Does the portal provide study tools like a CGPA Calculator or Online Compiler?',
    answer: 'Yes! BCSITHub includes built-in academic utilities: a PU SGPA/CGPA calculator, a Pomodoro timer for focus, an online multi-language compiler for running code draft scripts, and an AI quiz generator.',
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

function CountUp({ to, duration = 1.5 }: { to: number; duration?: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = to;
    if (start === end) return;

    const totalMiliseconds = duration * 1000;
    const incrementTime = Math.max(Math.floor(totalMiliseconds / end), 15);

    const timer = setInterval(() => {
      start += Math.ceil(end / (totalMiliseconds / incrementTime));
      if (start >= end) {
        clearInterval(timer);
        setCount(end);
      } else {
        setCount(start);
      }
    }, incrementTime);

    return () => clearInterval(timer);
  }, [to, duration]);

  return <>{count.toLocaleString()}</>;
}

export function Home() {
  useSEO({
    title: "Master BCSIT Courses & Exams with Confidence",
    description: "Welcome to BCSITHub, the complete student portal for Pokhara University BCSIT studies. Access semester subject notes, syllabus indices, solved past exam papers, and study toolkits.",
    keywords: "bcsit course, bcsit notes, bcsit syllabus, bcsithub, pokhara university, pu notes"
  });

  const [activeSemester, setActiveSemester] = useState('1'); // Semester Explorer
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [email, setEmail] = useState('');
  const [collegeSearch, setCollegeSearch] = useState('');
  const { user } = useAuth();
  const { profile } = useProfile();
  const { open: openInstallModal } = useInstallModal();
  const navigate = useNavigate();

  const [latestPapers, setLatestPapers] = useState<any[]>([]);
  const [papersLoading, setPapersLoading] = useState(true);
  const [selectedPaper, setSelectedPaper] = useState<any | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  
  const [latestNotices, setLatestNotices] = useState<any[]>([]);
  const [noticesLoading, setNoticesLoading] = useState(true);
  const [selectedNotice, setSelectedNotice] = useState<any | null>(null);

  const mapPaper = (item: any) => ({
    objectId: item.id,
    title: item.title,
    subject: item.subject,
    semester: item.semester,
    examType: item.exam_type,
    college: item.college,
    uploadedAt: item.created_at,
    uploadedBy: item.uploaded_by || '',
    downloads: item.downloads,
    approved: item.approved,
    fileUrl: item.file_url,
    ownerId: item.uploaded_by || '',
    uploaderName: item.uploader_name || '',
    uploaderRole: item.uploader_role || '',
  });

  useEffect(() => {
    const fetchLatestNotices = async () => {
      try {
        setNoticesLoading(true);
        const data = (await apiClient.get('/notices')) as any[];
        const mapped = data.slice(0, 3).map((item: any) => ({
          objectId: item.id,
          title: item.title,
          date: new Date(item.date),
          fileUrl: item.file_url,
          fileName: item.file_name,
          fileSize: item.file_size,
          category: item.category,
          content: item.content,
        }));
        setLatestNotices(mapped);
      } catch (err) {
        console.error('Error fetching latest notices:', err);
      } finally {
        setNoticesLoading(false);
      }
    };
    fetchLatestNotices();
  }, []);

  useEffect(() => {
    const fetchLatestPapers = async () => {
      try {
        setPapersLoading(true);
        const data = (await apiClient.get('/papers')) as any[];
        const approved = data.filter((p: any) => p.approved).slice(0, 4);
        setLatestPapers(approved);
      } catch (err) {
        console.error('Error fetching latest papers:', err);
      } finally {
        setPapersLoading(false);
      }
    };
    fetchLatestPapers();
  }, []);

  const handleDownload = async (paper: any) => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }
    const fileUrl = paper.fileUrl || paper.file_url;
    const paperId = paper.objectId || paper.id;
    if (!fileUrl) return;

    try {
      // Fetch file
      const response = await fetch(fileUrl);
      if (!response.ok) throw new Error("Failed to fetch file directly.");
      const originalBlob = await response.blob();

      // Apply watermark
      const watermarkedBlob = await watermarkFile(originalBlob, "BCSITHub");
      const blobUrl = window.URL.createObjectURL(watermarkedBlob);

      // Create download link
      const link = document.createElement('a');
      link.href = blobUrl;
      const urlParts = fileUrl.split('?')[0].split('.');
      const ext = urlParts.length > 1 ? urlParts[urlParts.length - 1] : 'pdf';
      const safeTitle = (paper.title || "past-paper").replace(/[^a-zA-Z0-9\s-_]/g, '').trim();
      link.download = `${safeTitle}.${ext}`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);

      // Increment downloads count
      await apiClient.post(`/papers/${paperId}/download`, {});
      setLatestPapers(prev =>
        prev.map(p => (p.id === paperId ? { ...p, downloads: (p.downloads || 0) + 1 } : p))
      );
      if (selectedPaper && (selectedPaper.objectId === paperId || selectedPaper.id === paperId)) {
        setSelectedPaper(prev => prev ? { ...prev, downloads: (prev.downloads || 0) + 1 } : null);
      }
    } catch (err) {
      console.error("Watermarked download failed, falling back to redirect:", err);
      window.open(fileUrl, '_blank');
      try {
        await apiClient.post(`/papers/${paperId}/download`, {});
        setLatestPapers(prev =>
          prev.map(p => (p.id === paperId ? { ...p, downloads: (p.downloads || 0) + 1 } : p))
        );
        if (selectedPaper && (selectedPaper.objectId === paperId || selectedPaper.id === paperId)) {
          setSelectedPaper(prev => prev ? { ...prev, downloads: (prev.downloads || 0) + 1 } : null);
        }
      } catch (postErr) {
        console.error(postErr);
      }
    }
  };

  const formatUploadedDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - date.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays <= 1) return 'Today';
      if (diffDays === 2) return 'Yesterday';
      if (diffDays <= 7) return `${diffDays - 1} days ago`;
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return 'Recently';
    }
  };

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
          <motion.div 
            animate={{ 
              x: [0, 20, -20, 0], 
              y: [0, -35, 20, 0],
              scale: [1, 1.08, 0.92, 1]
            }}
            transition={{ repeat: Infinity, duration: 22, ease: "easeInOut" }}
            className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px]" 
          />
          <motion.div 
            animate={{ 
              x: [0, -30, 25, 0], 
              y: [0, 25, -25, 0],
              scale: [1, 0.93, 1.07, 1]
            }}
            transition={{ repeat: Infinity, duration: 26, ease: "easeInOut" }}
            className="absolute top-1/3 -right-20 w-[450px] h-[450px] bg-purple-600/10 rounded-full blur-[140px]" 
          />
          <motion.div 
            animate={{ 
              x: [0, 25, -15, 0], 
              y: [0, -25, 30, 0]
            }}
            transition={{ repeat: Infinity, duration: 24, ease: "easeInOut" }}
            className="absolute -bottom-20 left-1/3 w-80 h-80 bg-violet-600/10 rounded-full blur-[100px]" 
          />
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

            {/* Hero Right Content: Live PU Notices Feed */}
            <div className="lg:col-span-5 relative w-full flex justify-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="w-full max-w-sm sm:max-w-md bg-slate-900/70 backdrop-blur-md border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden flex flex-col space-y-5"
              >
                {/* Background glow effects */}
                <div className="absolute -top-12 -right-12 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />
                <div className="absolute -bottom-12 -left-12 w-24 h-24 bg-purple-500/10 rounded-full blur-xl pointer-events-none" />

                {/* Widget Header */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-3.5 relative z-10">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 text-indigo-400">
                      <Bell className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-slate-200 tracking-wide uppercase">PU Notices</span>
                  </div>
                </div>

                {/* Notices List */}
                <div className="flex flex-col space-y-3 z-10">
                  {noticesLoading ? (
                    <div className="flex flex-col space-y-3 w-full">
                      {[1, 2, 3].map((n) => (
                        <div key={n} className="bg-slate-950/40 border border-slate-800/80 rounded-2xl p-3.5 flex flex-col space-y-2.5 animate-pulse">
                          <div className="flex items-center justify-between">
                            <div className="h-4.5 w-14 bg-slate-800 rounded-full"></div>
                            <div className="h-3 w-10 bg-slate-800 rounded"></div>
                          </div>
                          <div className="space-y-1.5">
                            <div className="h-3 w-full bg-slate-800 rounded"></div>
                            <div className="h-3 w-4/5 bg-slate-800 rounded"></div>
                          </div>
                          <div className="h-2.5 w-1/2 bg-slate-800 rounded"></div>
                        </div>
                      ))}
                    </div>
                  ) : latestNotices.length === 0 ? (
                    <div className="text-center py-8">
                      <span className="text-[11px] text-slate-500">No active notices found.</span>
                    </div>
                  ) : (
                    latestNotices.map((notice) => {
                      const categoryColors: Record<string, string> = {
                        Exam: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
                        Admission: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
                        Result: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
                        General: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
                      };
                      return (
                        <motion.div
                          key={notice.objectId}
                          whileHover={{ x: 4, backgroundColor: 'rgba(255,255,255,0.03)' }}
                          onClick={() => setSelectedNotice(notice)}
                          className="bg-slate-950/40 border border-slate-800/80 rounded-2xl p-3.5 flex flex-col text-left space-y-2 cursor-pointer transition-all duration-200"
                        >
                          <div className="flex items-center justify-between">
                            <span className={`text-[8px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider border ${categoryColors[notice.category] || categoryColors.General}`}>
                              {notice.category}
                            </span>
                            <span className="text-[9px] text-slate-500 font-medium">
                              {notice.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </span>
                          </div>
                          <h4 className="text-xs font-bold text-slate-200 line-clamp-2 leading-relaxed hover:text-indigo-400 transition-colors pr-2">
                            {notice.title}
                          </h4>
                          {notice.fileUrl && (
                            <div className="flex items-center space-x-1.5 text-[10px] text-slate-400 pt-0.5">
                              <FileText className="w-3 h-3 text-indigo-400" />
                              <span className="truncate max-w-[200px] text-[9px]">{notice.fileName || 'Notice Attachment'}</span>
                            </div>
                          )}
                        </motion.div>
                      );
                    })
                  )}
                </div>

                {/* Footer Link */}
                <div className="pt-2 z-10">
                  <Button
                    onClick={() => navigate('/pu-notices')}
                    variant="outline"
                    className="w-full border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white bg-slate-950/20 hover:bg-slate-900/50 py-2.5 rounded-xl font-semibold text-xs transition-colors"
                  >
                    <span>Browse All Notices</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                  </Button>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. core Stats Box (Overlap layout) */}
      <section className="relative z-20 -mt-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white/80 backdrop-blur-md border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-xl shadow-slate-200/50 grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {[
            { label: 'Active Students', value: 2500, suffix: '+', icon: Users, color: 'text-indigo-600 bg-indigo-50' },
            { label: 'Study Resources', value: 10000, suffix: '+', icon: FileText, color: 'text-purple-600 bg-purple-50' },
            { label: 'Practice Hours', value: 50000, suffix: '+', icon: Clock, color: 'text-rose-600 bg-rose-50' },
            { label: 'Partner Colleges', value: 25, suffix: '+', icon: Award, color: 'text-amber-600 bg-amber-50' },
          ].map((stat, i) => (
            <div key={stat.label} className="flex items-center space-x-3.5">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.color} flex-shrink-0 border border-current/10`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-none mb-1">
                  <CountUp to={stat.value} />{stat.suffix}
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

      {/* 4. Latest Past Papers Section */}
      <section className="py-24 bg-white relative">
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-indigo-50/50 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute top-10 left-10 w-80 h-80 bg-purple-50/30 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <div className="inline-flex items-center space-x-1.5 bg-indigo-50 border border-indigo-100 rounded-full px-4 py-1.5">
              <FileText className="w-4 h-4 text-indigo-600" />
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Updates</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Recently Uploaded{' '}
              <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 bg-clip-text text-transparent">
                Past Papers
              </span>
            </h2>
            <p className="text-base text-slate-600 leading-relaxed">
              Access the latest question papers and solutions uploaded by the student community and teachers.
            </p>
          </div>

          {papersLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4 animate-pulse">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 bg-slate-100 rounded-xl"></div>
                    <div className="h-4 w-12 bg-slate-100 rounded-full"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 w-full bg-slate-100 rounded"></div>
                    <div className="h-4 w-3/4 bg-slate-100 rounded"></div>
                  </div>
                  <div className="flex gap-1.5 pt-1">
                    <div className="h-4.5 w-12 bg-slate-100 rounded"></div>
                    <div className="h-4.5 w-20 bg-slate-100 rounded" style={{ maxWidth: '130px' }}></div>
                  </div>
                  <div className="pt-4 border-t border-slate-50 flex justify-between">
                    <div className="h-3.5 w-16 bg-slate-100 rounded"></div>
                    <div className="h-3.5 w-20 bg-slate-100 rounded"></div>
                  </div>
                  <div className="h-8.5 w-full bg-slate-100 rounded-lg"></div>
                </div>
              ))}
            </div>
          ) : latestPapers.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-100">
              <p className="text-sm text-slate-500 font-medium">No past papers uploaded yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {latestPapers.map((paper) => (
                <motion.div
                  key={paper.id}
                  whileHover={{ 
                    y: -8, 
                    scale: 1.02,
                    boxShadow: "0 20px 25px -5px rgba(99, 102, 241, 0.08), 0 8px 10px -6px rgba(99, 102, 241, 0.08)"
                  }}
                  className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm transition-all duration-300 flex flex-col justify-between text-left group"
                >
                  <div className="space-y-4">
                    {/* Header: Document Icon & Semester Badge */}
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center border border-indigo-100 group-hover:scale-105 transition-transform">
                        <FileText className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-extrabold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                        Sem {paper.semester}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="space-y-2">
                      <h3 className="text-sm font-bold text-slate-800 line-clamp-2 min-h-[40px] group-hover:text-indigo-600 transition-colors">
                        {paper.title}
                      </h3>
                      <p className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                        <span className="truncate max-w-[150px]">{paper.subject}</span>
                      </p>
                    </div>

                    {/* Metadata tags */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      <span className="text-[9px] bg-purple-50 text-purple-600 border border-purple-100/50 px-2 py-0.5 rounded-md font-semibold">
                        {paper.exam_type}
                      </span>
                      <span className="text-[9px] bg-slate-50 text-slate-600 border border-slate-100 px-2 py-0.5 rounded-md font-semibold truncate max-w-[130px]" title={paper.college}>
                        {paper.college}
                      </span>
                    </div>
                  </div>

                  {/* Actions & Footer info */}
                  <div className="mt-5 pt-4 border-t border-slate-50 space-y-3">
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatUploadedDate(paper.created_at)}
                      </span>
                      <span className="flex items-center gap-1 font-medium text-slate-500">
                        <Download className="w-3 h-3" />
                        {paper.downloads || 0} downloads
                      </span>
                    </div>

                    <Button
                      variant="outline"
                      onClick={() => setSelectedPaper(mapPaper(paper))}
                      className="w-full justify-between hover:bg-indigo-600 hover:text-white hover:border-indigo-600 group-hover:translate-x-0.5 transition-all text-xs"
                    >
                      <span>View Paper</span>
                      <ArrowRight className="w-4 h-4 ml-1.5" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Button
              variant="outline"
              onClick={() => navigate('/past-papers')}
              className="border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold px-6 py-2.5 rounded-xl inline-flex items-center gap-2"
            >
              <span>Explore All Past Papers</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
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
                <motion.div
                  key={tool.title}
                  onClick={() => navigate(tool.link)}
                  whileHover={{ 
                    y: -8, 
                    scale: 1.02,
                    boxShadow: "0 20px 25px -5px rgba(245, 158, 11, 0.08), 0 8px 10px -6px rgba(245, 158, 11, 0.08)"
                  }}
                  className="bg-white rounded-2xl p-6 border border-slate-100 shadow-md transition-all duration-300 flex flex-col text-left justify-between space-y-6 cursor-pointer group"
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
                </motion.div>
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

          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ staggerChildren: 0.15 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {testimonials.map((test) => (
              <motion.div
                key={test.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                whileHover={{ y: -8, scale: 1.02, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05)" }}
                className="bg-slate-50/50 border border-slate-100 rounded-2xl p-6 flex flex-col justify-between space-y-5 text-left transition-all duration-300"
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
              </motion.div>
            ))}
          </motion.div>
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

      {/* Paper Preview Modal */}
      <AnimatePresence>
        {selectedPaper && (
          <PaperPreviewModal
            paper={selectedPaper}
            onClose={() => setSelectedPaper(null)}
            isAuthenticated={!!user}
            onDownload={() => handleDownload(selectedPaper)}
          />
        )}
      </AnimatePresence>

      {/* Notice Reader Modal */}
      <AnimatePresence>
        {selectedNotice && (
          <NoticeReaderModal
            notice={selectedNotice}
            onClose={() => setSelectedNotice(null)}
            isAuthenticated={!!user}
            onAuthRequired={() => {
              setSelectedNotice(null);
              setShowLoginModal(true);
            }}
          />
        )}
      </AnimatePresence>

      {/* Auth Gate Redirect Modal */}
      <LoginRedirectModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        message="Please log in to download past papers and solution keys."
      />

    </div>
  );
}
