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
  Wrench,
  Download,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useInstallModal } from '@/context/InstallModalContext';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false); // mobile menu
  const [showUserMenu, setShowUserMenu] = useState(false); // user dropdown
  const [showToolsMenu, setShowToolsMenu] = useState(false); // tools dropdown
  const [isTablet, setIsTablet] = useState(false);
  const { user, signOut } = useAuth();
  const { open: openInstallModal } = useInstallModal();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsTablet(width >= 768 && width <= 1024); // Tablet range
      if (width > 1024) {
        setIsOpen(false);
      }
    };

    handleResize(); // Initial check
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close mobile menu on scroll
  useEffect(() => {
    if (!isOpen) return;

    const handleScroll = () => {
      setIsOpen(false);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isOpen]);

  // Close user dropdown on scroll
  useEffect(() => {
    if (!showUserMenu) return;

    const handleScroll = () => {
      setShowUserMenu(false);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [showUserMenu]);

  // Close tools dropdown on scroll
  useEffect(() => {
    if (!showToolsMenu) return;

    const handleScroll = () => {
      setShowToolsMenu(false);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [showToolsMenu]);

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
    { to: '/cgpa-calculator', icon: Calculator, label: 'CGPA Calculator' },
    { to: '/pomodoro-timer', icon: Clock, label: 'Pomodoro Timer' },
    { to: '/code-compiler', icon: Code, label: 'Code Compiler' },
    { to: '/quiz-generator', icon: Brain, label: 'Quiz Generator' },
  ];

  // Helper to check if link is active
  const isActive = (path: string) => {
    // exact match for root, otherwise startsWith to cover subpages if any
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  // Helper to check if any tools link is active
  const isToolsActive = () => {
    return toolsLinks.some(tool => location.pathname.startsWith(tool.to));
  };

  return (
    <>
      {/* Inject hover underline styles and active box styles */}
      <style>{`
        .hover-underline {
          position: relative;
          display: inline-block;
        }
        .hover-underline::after {
          content: '';
          position: absolute;
          width: 100%;
          height: 2px;
          background: linear-gradient(to right, #6366f1, #8b5cf6);
          bottom: -4px;
          left: 0;
          transform: scaleX(0);
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          transform-origin: left;
          pointer-events: none;
        }
        .hover-underline:hover::after {
          transform: scaleX(1);
        }
        /* Active page box style */
        .active-link {
          background: linear-gradient(135deg, #4f46e5, #7c3aed);
          border-radius: 0.5rem; /* rounded-lg */
          padding: 0.25rem 0.625rem; /* top/bottom 4px, left/right 10px */
          color: white !important;
          font-weight: 600;
          box-shadow: 0 4px 12px 0 rgba(79, 70, 229, 0.2);
        }
      `}</style>

      <nav className="bg-white/80 backdrop-blur-md shadow-premium border-b border-slate-100/80 sticky top-0 z-50">
        {/* Tools Row - Large Devices Only */}
        <div className={`${isTablet ? 'hidden lg:block' : 'hidden md:block'} bg-gradient-to-r from-indigo-500 to-purple-600 w-full`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-center items-center py-2">
              {toolsLinks.map(({ to, icon: Icon, label }) => (
                <Link
                  key={to}
                  to={to}
                  className={`flex items-center space-x-1 px-4 py-1 mx-2 text-sm transition-colors duration-200 rounded-md ${
                    isActive(to)
                      ? 'bg-white/20 text-white font-semibold'
                      : 'text-white/90 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  <span>{label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                BCSITHub
              </span>
            </Link>

            {/* Desktop/Tablet Navigation */}
            <div
              className={`${isTablet ? 'hidden lg:flex' : 'hidden md:flex'} items-center space-x-8`}
            >
              {navLinks.map(({ to, icon: Icon, label }) => (
                <Link
                  key={to}
                  to={to}
                  className={`flex items-center space-x-1 transition-colors duration-200 ${
                    isActive(to)
                      ? 'active-link'
                      : 'text-gray-700 hover:text-indigo-600'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive(to) ? 'text-white' : ''}`} />
                  <span
                    className={`hover-underline ${
                      isActive(to) ? '' : ''
                    }`}
                  >
                    {label}
                  </span>
                </Link>
              ))}
            </div>

            {/* Desktop/Tablet Auth Buttons */}
            <div className={`${isTablet ? 'hidden lg:flex' : 'hidden md:flex'} items-center space-x-4`}>
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-2 text-gray-700 hover:text-indigo-600 transition-colors duration-200"
                  >
                    <User className="w-4 h-4" />
                    <span className={isTablet ? 'hidden lg:inline' : ''}>{user.name}</span>
                  </button>
                  <AnimatePresence>
                    {showUserMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 border border-gray-200 z-50"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <div className="px-4 py-2 text-sm text-gray-500 border-b border-gray-100">
                          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        </div>
                        {user.role === 'admin' && (
                          <Link
                            to="/admin-dashboard"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            Admin Dashboard
                          </Link>
                        )}
                        {user.role === 'teacher' && (
                          <Link
                            to="/teacher-dashboard"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            Teacher Dashboard
                          </Link>
                        )}

                        <Link
                          to="/profile"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Profile
                        </Link>
                        <button
                          onClick={handleSignOut}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <LogOut className="w-4 h-4 inline mr-2" />
                          Sign Out
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <>
                  <Link
                    to="/signin"
                    className="flex items-center space-x-1 text-gray-700 hover:text-indigo-600 transition-colors duration-200"
                  >
                    <LogIn className="w-4 h-4" />
                    <span className={isTablet ? 'hidden lg:inline' : ''}>Sign In</span>
                  </Link>
                  <Link
                    to="/signup"
                    className="flex items-center space-x-1 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors duration-200"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span className={isTablet ? 'hidden lg:inline' : ''}>Sign Up</span>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile/Tablet Menu Button */}
            <div className={`${isTablet ? 'lg:hidden' : 'md:hidden'} flex items-center`}>
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="text-gray-700 hover:text-indigo-600 transition-colors duration-200 focus:outline-none"
                aria-label="Toggle menu"
              >
                {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile/Tablet Navigation */}
          <AnimatePresence>
            {isOpen && (
              <motion.div
                // Animate sliding in from the left
                initial={{ opacity: 0, x: '-100%' }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: '-100%' }}
                transition={{ type: 'tween', duration: 0.3 }}
                className={`${
                  isTablet ? 'lg:hidden' : 'md:hidden'
                } fixed top-16 left-0 h-[calc(100vh-4rem)] bg-white border-r border-gray-200 shadow-lg z-50`}
                style={{ width: '80vw' }}
              >
                <div className="px-4 pt-4 pb-3 space-y-1 overflow-y-auto h-full">
                  {navLinks.map(({ to, icon: Icon, label }) => (
                    <Link
                      key={to}
                      to={to}
                      className={`flex items-center space-x-3 px-3 py-2 rounded-md transition-colors duration-200 ${
                        isActive(to)
                          ? 'active-link'
                          : 'text-gray-700 hover:text-indigo-600 hover:bg-gray-50'
                      }`}
                      onClick={() => setIsOpen(false)}
                    >
                      <Icon className={`w-5 h-5 ${isActive(to) ? 'text-white' : ''}`} />
                      <span className="hover-underline">{label}</span>
                    </Link>
                  ))}
                  
                  {/* Install app - Mobile */}
                  <button
                    type="button"
                    onClick={() => {
                      openInstallModal();
                      setIsOpen(false);
                    }}
                    className="flex items-center space-x-3 px-3 py-2 rounded-md w-full text-left text-gray-700 hover:text-indigo-600 hover:bg-gray-50 transition-colors"
                  >
                    <Download className="w-5 h-5 text-indigo-600" />
                    <span>Install app</span>
                  </button>

                  {/* Tools Section in Mobile */}
                  <div className="border-t border-gray-200 pt-3 mt-3">
                    <div className="px-3 py-2 text-sm font-semibold text-gray-500 uppercase tracking-wider">
                      Tools
                    </div>
                    {toolsLinks.map(({ to, icon: Icon, label }) => (
                      <Link
                        key={to}
                        to={to}
                        className={`flex items-center space-x-3 px-3 py-2 rounded-md transition-colors duration-200 ${
                          isActive(to)
                            ? 'active-link'
                            : 'text-gray-700 hover:text-indigo-600 hover:bg-gray-50'
                        }`}
                        onClick={() => setIsOpen(false)}
                      >
                        <Icon className={`w-5 h-5 ${isActive(to) ? 'text-white' : ''}`} />
                        <span className="hover-underline">{label}</span>
                      </Link>
                    ))}
                  </div>
                  
                  <div className="border-t border-gray-200 pt-3 mt-3">
                    {user ? (
                      <>
                        <div className="px-3 py-2 text-sm text-gray-500">
                          {user.name} ({user.role})
                        </div>
                        {user.role === 'admin' && (
                          <Link
                            to="/admin-dashboard"
                            className="block px-3 py-2 text-gray-700 hover:text-indigo-600 hover:bg-gray-50 rounded-md"
                            onClick={() => setIsOpen(false)}
                          >
                            Admin Dashboard
                          </Link>
                        )}
                        {user.role === 'teacher' && (
                          <Link
                            to="/teacher-dashboard"
                            className="block px-3 py-2 text-gray-700 hover:text-indigo-600 hover:bg-gray-50 rounded-md"
                            onClick={() => setIsOpen(false)}
                          >
                            Teacher Dashboard
                          </Link>
                        )}

                        <Link
                          to="/profile"
                          className="block px-3 py-2 text-gray-700 hover:text-indigo-600 hover:bg-gray-50 rounded-md"
                          onClick={() => setIsOpen(false)}
                        >
                          Profile
                        </Link>
                        <button
                          onClick={() => {
                            handleSignOut();
                            setIsOpen(false);
                          }}
                          className="flex items-center space-x-2 w-full px-3 py-2 text-gray-700 hover:text-indigo-600 hover:bg-gray-50 rounded-md"
                        >
                          <LogOut className="w-5 h-5" />
                          <span>Sign Out</span>
                        </button>
                      </>
                    ) : (
                      <>
                        <Link
                          to="/signin"
                          className="flex items-center space-x-2 px-3 py-2 text-gray-700 hover:text-indigo-600 hover:bg-gray-50 rounded-md"
                          onClick={() => setIsOpen(false)}
                        >
                          <LogIn className="w-5 h-5" />
                          <span className="hover-underline">Sign In</span>
                        </Link>
                        <Link
                          to="/signup"
                          className="flex items-center space-x-2 px-3 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 mt-3"
                          onClick={() => setIsOpen(false)}
                        >
                          <UserPlus className="w-5 h-5" />
                          <span className="hover-underline">Sign Up</span>
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>
    </>
  );
}
