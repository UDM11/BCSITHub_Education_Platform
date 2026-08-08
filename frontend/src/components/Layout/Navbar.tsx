import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu,
  X,
  BookOpen,
  Users,
  FileText,
  GraduationCap,
  Home,
  LogIn,
  UserPlus,
  LogOut,
  User,
  ScrollText,
  Calculator,
  Clock,
  Code,
  Brain,
  ChevronDown,
  Download,
  LayoutDashboard,
  Search,
  Bell,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useInstallModal } from '@/context/InstallModalContext';
import { apiClient } from '../../lib/apiClient';
import { PaperPreviewModal } from '../Notes/PaperPreviewModal';
import { NoticeReaderModal } from '../common/NoticeReaderModal';
import LoginRedirectModal from '../common/LoginRedirectModal';
import { semestersData } from '../../data/notesData';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false); // Mobile menu toggle
  const [showUserMenu, setShowUserMenu] = useState(false); // Desktop user dropdown
  const [showToolsMenu, setShowToolsMenu] = useState(false); // Desktop tools dropdown
  const [showSearch, setShowSearch] = useState(false); // Desktop search dropdown
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  const { user, loading, signOut } = useAuth();
  const { open: openInstallModal } = useInstallModal();
  const navigate = useNavigate();
  const location = useLocation();

  const [searchQuery, setSearchQuery] = useState('');
  const [allPapers, setAllPapers] = useState<any[]>([]);
  const [allNotices, setAllNotices] = useState<any[]>([]);
  const [selectedPaper, setSelectedPaper] = useState<any | null>(null);
  const [selectedNotice, setSelectedNotice] = useState<any | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    const loadSearchData = async () => {
      try {
        const [papersData, noticesData] = await Promise.all([
          apiClient.get('/papers'),
          apiClient.get('/notices')
        ]);
        
        // Map papers
        const approvedPapers = (papersData as any[]).filter((p: any) => p.approved);
        setAllPapers(approvedPapers);

        // Map notices
        const mappedNotices = (noticesData as any[]).map((item: any) => ({
          objectId: item.id,
          title: item.title,
          date: new Date(item.date),
          fileUrl: item.file_url,
          fileName: item.file_name,
          fileSize: item.file_size,
          category: item.category,
          content: item.content,
        }));
        setAllNotices(mappedNotices);
      } catch (err) {
        console.error('Failed to load search data for navbar:', err);
      }
    };
    
    loadSearchData();
  }, []);

  const handleDownload = async (paper: any) => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }
    const fileUrl = paper.fileUrl || paper.file_url;
    const paperId = paper.objectId || paper.id;
    if (!fileUrl) return;
    window.open(fileUrl, '_blank');
    try {
      await apiClient.post(`/papers/${paperId}/download`, {});
    } catch (err) {
      console.error(err);
    }
  };

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

  // Calculate search filtering
  const allSubjects = semestersData.flatMap(sem => 
    sem.subjects.map(sub => ({ ...sub, semesterId: sem.id }))
  );
  
  const filteredSubjects = searchQuery 
    ? allSubjects.filter(sub => 
        sub.courseName.toLowerCase().includes(searchQuery.toLowerCase()) || 
        sub.courseCode.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 4)
    : [];

  const filteredPapersResult = searchQuery
    ? allPapers.filter(paper =>
        paper.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        paper.subject.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 4)
    : [];

  const filteredNoticesResult = searchQuery
    ? allNotices.filter(notice =>
        notice.title.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 4)
    : [];

  // Close mobile drawer if screen is resized to desktop width
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1536) {
        setIsOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Lock body scroll when mobile drawer is open (prevents background scroll on mobile)
  useEffect(() => {
    if (isOpen) {
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
    } else {
      const scrollY = document.body.style.top;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0') * -1);
      }
    }
    return () => {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle scroll events to update navbar state (frosted transition)
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 15) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
      
      // Close dropdowns on scroll
      setShowUserMenu(false);
      setShowToolsMenu(false);
      setShowSearch(false);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Listen for online/offline changes
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Listen for Ctrl+K/Cmd+K to toggle search overlay
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setShowSearch((prev) => !prev);
        setShowUserMenu(false);
        setShowToolsMenu(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const navLinks = [
    { to: '/', icon: Home, label: 'Home' },
    { to: '/syllabus', icon: BookOpen, label: 'Syllabus' },
    { to: '/notes', icon: FileText, label: 'Notes' },
    { to: '/past-papers', icon: GraduationCap, label: 'Past Papers' },
    { to: '/colleges', icon: Users, label: 'Colleges' },
    { to: '/pu-notices', icon: ScrollText, label: 'PU Notices' },
  ];

  const toolsLinks = [
    { 
      to: '/cgpa-calculator', 
      icon: Calculator, 
      label: 'CGPA Calculator', 
      description: 'Calculate your SGPA & CGPA instantly.',
      colorClass: 'bg-amber-50 text-amber-600 border-amber-100/50',
      hoverColorClass: 'group-hover:bg-amber-100 group-hover:text-amber-700'
    },
    { 
      to: '/pomodoro-timer', 
      icon: Clock, 
      label: 'Pomodoro Timer', 
      description: 'Boost focus with custom study intervals.',
      colorClass: 'bg-rose-50 text-rose-600 border-rose-100/50',
      hoverColorClass: 'group-hover:bg-rose-100 group-hover:text-rose-700'
    },
    { 
      to: '/code-compiler', 
      icon: Code, 
      label: 'Code Compiler', 
      description: 'Compile and run your code on the fly.',
      colorClass: 'bg-emerald-50 text-emerald-600 border-emerald-100/50',
      hoverColorClass: 'group-hover:bg-emerald-100 group-hover:text-emerald-700'
    },
    { 
      to: '/quiz-generator', 
      icon: Brain, 
      label: 'Quiz Generator', 
      description: 'Generate customized practice quizzes.',
      colorClass: 'bg-indigo-50 text-indigo-600 border-indigo-100/50',
      hoverColorClass: 'group-hover:bg-indigo-100 group-hover:text-indigo-700'
    },
  ];

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const isToolsActive = () => {
    return toolsLinks.some(tool => location.pathname.startsWith(tool.to));
  };

  const isChapterNotes = /^\/notes\/semester\/[^/]+\/subject\/[^/]+\/chapter\/[^/]+$/.test(location.pathname);
  if (isChapterNotes) return null;

  return (
    <>
      <nav 
        className={`sticky top-0 z-50 w-full transition-all duration-300 ${
          isScrolled 
            ? 'bg-white/80 backdrop-blur-lg shadow-lg shadow-slate-100/40 border-b border-slate-100' 
            : 'bg-white border-b border-slate-100'
        }`}
      >
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            
            {/* Brand Logo */}
            <div className="flex items-center space-x-2.5">
              <Link to="/" className="flex items-center space-x-2 group flex-shrink-0">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl overflow-hidden shadow-md shadow-indigo-200 transition-transform duration-300 group-hover:scale-105">
                  <img src="/logo.png" alt="BCSITHub Logo" className="w-full h-full object-cover" />
                </div>
                <span className="hidden sm:inline-block text-xl font-extrabold bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-600 bg-clip-text text-transparent tracking-tight whitespace-nowrap">
                  BCSITHub
                </span>
              </Link>
              {!isOnline && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-extrabold bg-rose-50 text-rose-600 border border-rose-100 uppercase tracking-wide animate-pulse">
                  <span className="w-1 h-1 rounded-full bg-rose-500"></span>
                  Offline
                </span>
              )}
            </div>

            {/* Desktop Search Icon Button + Dropdown (xl and above) */}
            <div className="hidden 2xl:block relative z-40">
              {/* Search trigger button */}
              <button
                onClick={() => { setShowSearch(!showSearch); setShowUserMenu(false); setShowToolsMenu(false); }}
                className={`flex items-center w-48 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 border gap-1.5 ${
                  showSearch
                    ? 'bg-indigo-50 text-indigo-600 border-indigo-300 shadow-sm'
                    : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50 border-slate-200 bg-slate-50/60'
                }`}
                aria-label="Open search"
              >
                <Search className="w-3.5 h-3.5 flex-shrink-0 text-slate-400" />
                <span className="flex-1 text-left text-xs text-slate-400">Search...</span>
                <kbd className="hidden lg:inline-flex items-center gap-0.5 px-1 py-0.5 text-[9px] font-sans font-medium text-slate-400 bg-white border border-slate-200 rounded shadow-sm">
                  <span>Ctrl</span><span>K</span>
                </kbd>
                <ChevronDown className={`w-3.5 h-3.5 flex-shrink-0 transition-transform duration-200 text-slate-400 ${showSearch ? 'rotate-180' : ''}`} />
              </button>

              {/* Search dropdown panel */}
              <AnimatePresence>
                {showSearch && (
                  <>
                    {/* Backdrop click-away */}
                    <div
                      className="fixed inset-0 z-40 bg-black/5"
                      onClick={() => { setShowSearch(false); setSearchQuery(''); }}
                    />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.97 }}
                      transition={{ duration: 0.18, ease: 'easeOut' }}
                      className="absolute left-1/2 -translate-x-1/2 mt-3 w-[640px] bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden"
                    >
                      {/* Search input area */}
                      <div className="p-4 border-b border-slate-100">
                        <div className="relative">
                          <Search className="w-5 h-5 text-indigo-500 absolute left-4 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            placeholder="Search syllabus, papers, notices..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            autoFocus
                            className="w-full pl-12 pr-10 py-3.5 bg-slate-50 border border-slate-200 focus:border-indigo-400 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/15 transition-all duration-200 font-medium"
                          />
                          {searchQuery && (
                            <button
                              onClick={() => setSearchQuery('')}
                              className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-all"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                        {!searchQuery && (
                          <p className="text-xs text-slate-400 mt-2 px-1">Search across subjects, past papers, and PU notices</p>
                        )}
                      </div>

                      {/* Results */}
                      {searchQuery && (
                        <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-50">
                          {/* Subjects */}
                          {filteredSubjects.length > 0 && (
                            <div className="py-2 px-3">
                              <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest px-1 block mb-1.5">Subjects &amp; Notes</span>
                              {filteredSubjects.map(sub => (
                                <div
                                  key={sub.courseCode}
                                  onClick={() => {
                                    navigate(`/notes/semester/${sub.semesterId}/subject/${encodeURIComponent(sub.courseCode || sub.courseName)}`);
                                    setSearchQuery('');
                                    setShowSearch(false);
                                  }}
                                  className="flex items-center justify-between px-3 py-2.5 hover:bg-indigo-50/60 rounded-xl cursor-pointer transition-colors group"
                                >
                                  <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                      <BookOpen className="w-4 h-4 text-indigo-600" />
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                      <span className="text-sm font-semibold text-slate-700 truncate group-hover:text-indigo-700">{sub.courseName}</span>
                                      <span className="text-xs text-slate-400">{sub.courseCode || 'PU Course'} · Semester {sub.semesterId}</span>
                                    </div>
                                  </div>
                                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 flex-shrink-0" />
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Past Papers */}
                          {filteredPapersResult.length > 0 && (
                            <div className="py-2 px-3">
                              <span className="text-[10px] font-bold text-violet-500 uppercase tracking-widest px-1 block mb-1.5">Past Papers</span>
                              {filteredPapersResult.map(paper => (
                                <div
                                  key={paper.id}
                                  onClick={() => {
                                    setSelectedPaper(mapPaper(paper));
                                    setSearchQuery('');
                                    setShowSearch(false);
                                  }}
                                  className="flex items-center justify-between px-3 py-2.5 hover:bg-violet-50/60 rounded-xl cursor-pointer transition-colors group"
                                >
                                  <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 bg-violet-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                      <FileText className="w-4 h-4 text-violet-600" />
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                      <span className="text-sm font-semibold text-slate-700 truncate group-hover:text-violet-700">{paper.title}</span>
                                      <span className="text-xs text-slate-400">{paper.subject} · Sem {paper.semester}</span>
                                    </div>
                                  </div>
                                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-violet-500 flex-shrink-0" />
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Notices */}
                          {filteredNoticesResult.length > 0 && (
                            <div className="py-2 px-3">
                              <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest px-1 block mb-1.5">PU Notices</span>
                              {filteredNoticesResult.map(notice => (
                                <div
                                  key={notice.objectId}
                                  onClick={() => {
                                    setSelectedNotice(notice);
                                    setSearchQuery('');
                                    setShowSearch(false);
                                  }}
                                  className="flex items-center justify-between px-3 py-2.5 hover:bg-amber-50/60 rounded-xl cursor-pointer transition-colors group"
                                >
                                  <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                      <Bell className="w-4 h-4 text-amber-600" />
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                      <span className="text-sm font-semibold text-slate-700 truncate group-hover:text-amber-700">{notice.title}</span>
                                      <span className="text-xs text-slate-400">{notice.category} · {notice.date.toLocaleDateString()}</span>
                                    </div>
                                  </div>
                                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-amber-500 flex-shrink-0" />
                                </div>
                              ))}
                            </div>
                          )}

                          {filteredSubjects.length === 0 && filteredPapersResult.length === 0 && filteredNoticesResult.length === 0 && (
                            <div className="py-10 text-center">
                              <Search className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                              <span className="text-sm text-slate-400">No results for &ldquo;{searchQuery}&rdquo;</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Empty state hint */}
                      {!searchQuery && (
                        <div className="px-4 py-5 grid grid-cols-3 gap-2">
                          {[
                            { icon: BookOpen, label: 'Notes', color: 'text-indigo-600 bg-indigo-50', to: '/notes' },
                            { icon: FileText, label: 'Papers', color: 'text-violet-600 bg-violet-50', to: '/past-papers' },
                            { icon: ScrollText, label: 'Notices', color: 'text-amber-600 bg-amber-50', to: '/pu-notices' },
                          ].map(({ icon: Ic, label, color, to }) => (
                            <button
                              key={to}
                              onClick={() => { navigate(to); setShowSearch(false); }}
                              className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-slate-50 transition-colors group"
                            >
                              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}>
                                <Ic className="w-4.5 h-4.5" />
                              </div>
                              <span className="text-xs font-semibold text-slate-600 group-hover:text-indigo-600">{label}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* Desktop Navigation Links (Visible on 1280px width and above) */}
            <div className="hidden 2xl:flex items-center space-x-1.5">
              {navLinks.map(({ to, icon: Icon, label }) => (
                <Link
                  key={to}
                  to={to}
                  className={`relative flex items-center space-x-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap overflow-hidden group ${
                    isActive(to)
                      ? 'bg-indigo-50/80 text-indigo-600 border border-indigo-100/50 shadow-sm shadow-indigo-100/10'
                      : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0 relative z-10" />
                  <span className="relative z-10">{label}</span>
                  <span className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-indigo-600 transition-all duration-300 group-hover:w-3/5 ${
                    isActive(to) ? 'w-3/5' : ''
                  }`}></span>
                </Link>
              ))}

              {/* Tools Dropdown Container */}
              <div 
                className="relative"
                onMouseEnter={() => setShowToolsMenu(true)}
                onMouseLeave={() => setShowToolsMenu(false)}
              >
                <button
                  onClick={() => setShowToolsMenu(!showToolsMenu)}
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                    isToolsActive()
                      ? 'bg-indigo-50/80 text-indigo-600 border border-indigo-100/50 shadow-sm'
                      : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50'
                  }`}
                >
                  <Brain className="w-4 h-4 flex-shrink-0" />
                  <span>Tools</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${showToolsMenu ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {showToolsMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute left-1/2 -translate-x-1/2 mt-2 w-80 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-slate-100 p-2.5 z-50"
                    >
                      <div className="px-3 py-1.5 border-b border-slate-50 mb-1.5">
                        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Academic Utility Tools</span>
                      </div>
                      <div className="grid grid-cols-1 gap-1">
                        {toolsLinks.map((tool) => {
                          const ToolIcon = tool.icon;
                          return (
                            <Link
                              key={tool.to}
                              to={tool.to}
                              onClick={() => setShowToolsMenu(false)}
                              className={`flex items-start space-x-3 p-2 rounded-xl transition-all duration-200 group ${
                                isActive(tool.to)
                                  ? 'bg-slate-50'
                                  : 'hover:bg-slate-50/60'
                              }`}
                            >
                              <div className={`p-2 rounded-lg border transition-all duration-200 flex-shrink-0 ${tool.colorClass} ${tool.hoverColorClass}`}>
                                <ToolIcon className="w-4 h-4" />
                              </div>
                              <div className="flex flex-col text-left">
                                <span className="text-sm font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors whitespace-nowrap">
                                  {tool.label}
                                </span>
                                <span className="text-xs text-slate-400 font-normal leading-relaxed">
                                  {tool.description}
                                </span>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Desktop Auth & PWA Installer (Visible on 1280px width and above) */}
            <div className="hidden 2xl:flex items-center space-x-3">
              
              {/* Install App button */}
              <button
                onClick={openInstallModal}
                className="flex items-center space-x-1.5 px-3 py-2 text-slate-600 hover:text-indigo-600 hover:bg-slate-50 rounded-xl text-sm font-medium transition-colors whitespace-nowrap"
                title="Install Application"
              >
                <Download className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                <span>Install App</span>
              </button>

              <div className="h-4 w-px bg-slate-200/80 mx-1" />

              {loading ? (
                <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-4" />
              ) : user ? (
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-2 px-2.5 py-1.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-200 transition-all duration-200"
                  >
                    <div className="relative group/avatar flex-shrink-0">
                      {/* Gradient glow ring */}
                      <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 rounded-lg opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-300 blur-sm scale-110"></div>
                      
                      <div className="relative w-7 h-7 bg-gradient-to-tr from-indigo-500 to-violet-600 rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-sm overflow-hidden border border-white/20">
                        {user.avatar_url ? (
                          <img src={user.avatar_url} alt={user.name || user.email || 'User'} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          (user.name || user.email || 'U').charAt(0).toUpperCase()
                        )}
                      </div>
                    </div>
                    <span className="text-sm font-medium text-slate-700 max-w-[100px] truncate whitespace-nowrap">{user.name || user.email || 'User'}</span>
                    <ChevronDown className={`w-3.5 h-3.5 text-slate-400 flex-shrink-0 transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {showUserMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-64 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-slate-100 p-2 z-50"
                      >
                        {/* Profile Header */}
                        <div className="px-3 py-3 border-b border-slate-50 mb-1 flex items-center space-x-2.5">
                          <div className="w-10 h-10 bg-gradient-to-tr from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-md shadow-indigo-100 flex-shrink-0 overflow-hidden">
                            {user.avatar_url ? (
                              <img src={user.avatar_url} alt={user.name || user.email || 'User'} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            ) : (
                              (user.name || user.email || 'U').charAt(0).toUpperCase()
                            )}
                          </div>
                          <div className="flex flex-col text-left min-w-0">
                            <span className="text-sm font-semibold text-slate-800 truncate">{user.name || user.email || 'User'}</span>
                            <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50/80 px-2 py-0.5 rounded-full uppercase tracking-wider self-start mt-0.5">
                              {user.role}
                            </span>
                          </div>
                        </div>

                        {/* Dropdown Links */}
                        <div className="space-y-0.5">
                          {user.role === 'admin' && (
                            <Link
                              to="/admin-dashboard"
                              onClick={() => setShowUserMenu(false)}
                              className="flex items-center space-x-2.5 px-3 py-2 text-sm text-slate-600 hover:text-indigo-600 hover:bg-slate-50 rounded-xl transition-all whitespace-nowrap"
                            >
                              <LayoutDashboard className="w-4 h-4 flex-shrink-0" />
                              <span>Admin Dashboard</span>
                            </Link>
                          )}
                          {user.role === 'teacher' && (
                            <Link
                              to="/teacher-dashboard"
                              onClick={() => setShowUserMenu(false)}
                              className="flex items-center space-x-2.5 px-3 py-2 text-sm text-slate-600 hover:text-indigo-600 hover:bg-slate-50 rounded-xl transition-all whitespace-nowrap"
                            >
                              <LayoutDashboard className="w-4 h-4 flex-shrink-0" />
                              <span>Teacher Dashboard</span>
                            </Link>
                          )}

                          <Link
                            to="/profile"
                            onClick={() => setShowUserMenu(false)}
                            className="flex items-center space-x-2.5 px-3 py-2 text-sm text-slate-600 hover:text-indigo-600 hover:bg-slate-50 rounded-xl transition-all whitespace-nowrap"
                          >
                            <User className="w-4 h-4 flex-shrink-0" />
                            <span>My Profile</span>
                          </Link>

                          <div className="border-t border-slate-50 my-1" />

                          <button
                            onClick={() => {
                              setShowUserMenu(false);
                              handleSignOut();
                            }}
                            className="flex items-center space-x-2.5 w-full text-left px-3 py-2 text-sm text-rose-600 hover:bg-rose-50 rounded-xl transition-all font-medium whitespace-nowrap"
                          >
                            <LogOut className="w-4 h-4 flex-shrink-0" />
                            <span>Sign Out</span>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <>
                  <Link
                    to="/signin"
                    className="flex items-center space-x-1 px-3 py-2 text-slate-600 hover:text-indigo-600 hover:bg-slate-50 rounded-xl text-sm font-medium transition-colors whitespace-nowrap"
                  >
                    <LogIn className="w-4 h-4 flex-shrink-0" />
                    <span>Sign In</span>
                  </Link>
                  <Link
                    to="/signup"
                    className="flex items-center space-x-1.5 bg-gradient-to-tr from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-md shadow-indigo-100 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 whitespace-nowrap"
                  >
                    <UserPlus className="w-4 h-4 flex-shrink-0" />
                    <span>Sign Up</span>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile & Tablet Toggle Menu Button (Visible on screens smaller than 1280px) */}
            <div className="flex 2xl:hidden items-center">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-slate-50 rounded-xl transition-colors duration-200 focus:outline-none"
                aria-label={isOpen ? 'Close Menu' : 'Open Menu'}
              >
                {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile & Tablet Drawer Panel */}
        <AnimatePresence>
          {isOpen && (
            <div className="fixed inset-0 z-[100] flex 2xl:hidden">
              {/* Darkened Backdrop Overlay */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.4 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsOpen(false)}
                className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
              />

              {/* Slider Panel */}
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="relative flex flex-col w-full max-w-xs h-full bg-white/95 backdrop-blur-md shadow-2xl border-r border-slate-100/50 p-5 overflow-y-auto"
              >
                {/* Drawer Header */}
                <div className="flex items-center justify-between pb-5 border-b border-slate-100">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-lg overflow-hidden shadow-md shadow-indigo-100 flex items-center justify-center">
                      <img src="/logo.png" alt="BCSITHub Logo" className="w-full h-full object-cover" />
                    </div>
                    <span className="text-lg font-bold text-slate-800">BCSITHub</span>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg transition-all"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Drawer Content */}
                <div className="flex-1 py-4 space-y-5">
                  {/* Primary Navigation Section */}
                  <div className="space-y-1">
                    {navLinks.map(({ to, icon: Icon, label }) => (
                      <Link
                        key={to}
                        to={to}
                        onClick={() => setIsOpen(false)}
                        className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                          isActive(to)
                            ? 'bg-indigo-50 text-indigo-600 font-semibold'
                            : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50'
                        }`}
                      >
                        <Icon className="w-4.5 h-4.5 flex-shrink-0" />
                        <span>{label}</span>
                      </Link>
                    ))}
                  </div>

                  {/* Academic Utilities / Tools Section */}
                  <div className="border-t border-slate-100 pt-4">
                    <span className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                      Academic Utilities
                    </span>
                    <div className="space-y-1">
                      {toolsLinks.map((tool) => {
                        const ToolIcon = tool.icon;
                        return (
                          <Link
                            key={tool.to}
                            to={tool.to}
                            onClick={() => setIsOpen(false)}
                            className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                              isActive(tool.to)
                                ? 'bg-indigo-50 text-indigo-600 font-semibold'
                                : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50'
                            }`}
                          >
                            <ToolIcon className="w-4.5 h-4.5 flex-shrink-0" />
                            <span>{tool.label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>

                  {/* User Actions Section */}
                  <div className="border-t border-slate-100 pt-4">
                    <span className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                      Account & Actions
                    </span>

                    {/* PWA App installation link */}
                    <button
                      type="button"
                      onClick={() => {
                        openInstallModal();
                        setIsOpen(false);
                      }}
                      className="flex items-center space-x-3 px-3 py-2.5 rounded-xl w-full text-left text-slate-600 hover:text-indigo-600 hover:bg-slate-50 text-sm font-medium transition-colors"
                    >
                      <Download className="w-4.5 h-4.5 text-indigo-500 flex-shrink-0" />
                      <span>Install Web App</span>
                    </button>

                    <div className="mt-2 space-y-1">
                      {loading ? (
                        <div className="flex justify-center py-4">
                          <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                        </div>
                      ) : user ? (
                        <>
                          <Link
                            to="/profile"
                            onClick={() => setIsOpen(false)}
                            className="flex items-center space-x-3 px-3 py-2.5 rounded-xl text-slate-600 hover:text-indigo-600 hover:bg-slate-50 text-sm font-medium transition-all"
                          >
                            <div className="w-8 h-8 bg-gradient-to-tr from-indigo-500 to-violet-600 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0 overflow-hidden">
                              {user.avatar_url ? (
                                <img src={user.avatar_url} alt={user.name || user.email || 'User'} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                              ) : (
                                <User className="w-4.5 h-4.5" />
                              )}
                            </div>
                            <div className="flex flex-col text-left">
                              <span className="text-sm font-semibold text-slate-700 truncate">{user.name || user.email || 'User'}</span>
                              <span className="text-[10px] text-slate-400">View Profile</span>
                            </div>
                          </Link>
                          
                          {user.role === 'admin' && (
                            <Link
                              to="/admin-dashboard"
                              onClick={() => setIsOpen(false)}
                              className="flex items-center space-x-3 px-3 py-2.5 rounded-xl text-slate-600 hover:text-indigo-600 hover:bg-slate-50 text-sm font-medium transition-all"
                            >
                              <LayoutDashboard className="w-4.5 h-4.5 flex-shrink-0" />
                              <span>Admin Dashboard</span>
                            </Link>
                          )}
                          {user.role === 'teacher' && (
                            <Link
                              to="/teacher-dashboard"
                              onClick={() => setIsOpen(false)}
                              className="flex items-center space-x-3 px-3 py-2.5 rounded-xl text-slate-600 hover:text-indigo-600 hover:bg-slate-50 text-sm font-medium transition-all"
                            >
                              <LayoutDashboard className="w-4.5 h-4.5 flex-shrink-0" />
                              <span>Teacher Dashboard</span>
                            </Link>
                          )}

                          <button
                            onClick={() => {
                              setIsOpen(false);
                              handleSignOut();
                            }}
                            className="flex items-center space-x-3 px-3 py-2.5 w-full text-left text-rose-600 hover:bg-rose-50 rounded-xl transition-all text-sm font-medium"
                          >
                            <LogOut className="w-4.5 h-4.5 flex-shrink-0" />
                            <span>Sign Out</span>
                          </button>
                        </>
                      ) : (
                        <div className="grid grid-cols-2 gap-2 mt-3 px-3">
                          <Link
                            to="/signin"
                            className="flex items-center justify-center space-x-1 py-2 px-3 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-semibold transition-colors"
                            onClick={() => setIsOpen(false)}
                          >
                            <LogIn className="w-3.5 h-3.5 flex-shrink-0" />
                            <span>Sign In</span>
                          </Link>
                          <Link
                            to="/signup"
                            className="flex items-center justify-center space-x-1.5 py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition-all"
                            onClick={() => setIsOpen(false)}
                          >
                            <UserPlus className="w-3.5 h-3.5 flex-shrink-0" />
                            <span>Sign Up</span>
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </nav>

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
    </>
  );
}
