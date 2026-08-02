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
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useInstallModal } from '@/context/InstallModalContext';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false); // Mobile menu toggle
  const [showUserMenu, setShowUserMenu] = useState(false); // Desktop user dropdown
  const [showToolsMenu, setShowToolsMenu] = useState(false); // Desktop tools dropdown
  const [isScrolled, setIsScrolled] = useState(false);
  
  const { user, signOut } = useAuth();
  const { open: openInstallModal } = useInstallModal();
  const navigate = useNavigate();
  const location = useLocation();

  // Close mobile drawer if screen is resized to desktop width
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1280) {
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
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
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
            <Link to="/" className="flex items-center space-x-2.5 group flex-shrink-0">
              <div className="w-9 h-9 rounded-xl overflow-hidden shadow-md shadow-indigo-200 transition-transform duration-300 group-hover:scale-105">
                <img src="/logo.jpg" alt="BCSITHub Logo" className="w-full h-full object-cover" />
              </div>
              <span className="text-xl font-extrabold bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-600 bg-clip-text text-transparent tracking-tight whitespace-nowrap">
                BCSITHub
              </span>
            </Link>

            {/* Desktop Navigation Links (Visible on 1280px width and above) */}
            <div className="hidden xl:flex items-center space-x-1.5">
              {navLinks.map(({ to, icon: Icon, label }) => (
                <Link
                  key={to}
                  to={to}
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                    isActive(to)
                      ? 'bg-indigo-50/80 text-indigo-600 border border-indigo-100/50 shadow-sm shadow-indigo-100/10'
                      : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span>{label}</span>
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
            <div className="hidden xl:flex items-center space-x-3">
              
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

              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-2 px-2.5 py-1.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-200 transition-all duration-200"
                  >
                    <div className="w-7 h-7 bg-gradient-to-tr from-indigo-500 to-violet-600 rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-sm flex-shrink-0 overflow-hidden">
                      {user.avatar_url ? (
                        <img src={user.avatar_url} alt={user.name || user.email || 'User'} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        (user.name || user.email || 'U').charAt(0).toUpperCase()
                      )}
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
            <div className="flex xl:hidden items-center">
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
            <div className="fixed inset-0 z-[100] flex xl:hidden">
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
                      <img src="/logo.jpg" alt="BCSITHub Logo" className="w-full h-full object-cover" />
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
                      {user ? (
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
    </>
  );
}
