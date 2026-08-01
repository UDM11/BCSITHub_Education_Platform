import React, { useState, useEffect } from 'react';
import {
  Download,
  Calendar,
  FileText,
  UploadCloud,
  Search,
  ExternalLink,
  Filter,
  Grid,
  List,
  Bell,
  Users,
  TrendingUp,
  Award,
  Clock,
  X,
  ChevronRight,
  BookOpen,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import UploadNoticeForm from '../components/common/UploadNoticeForm';
import { motion, AnimatePresence } from 'framer-motion';
import { apiClient } from '../lib/apiClient';
import { useNavigate } from 'react-router-dom';
import { useSEO } from '../hooks/useSEO';

interface Notice {
  objectId: string;
  title: string;
  date: Date;
  fileUrl: string;
  fileName: string;
  fileSize: string;
  category: 'Exam' | 'Admission' | 'Result' | 'General';
}

const categories = ['Exam', 'Admission', 'Result', 'General'];

const LoginRedirectModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  message: string;
}> = ({ isOpen, onClose, message }) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleOk = () => {
    onClose();
    navigate('/signup');
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-sm text-center"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
      >
        <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Bell className="w-8 h-8 text-indigo-600" />
        </div>
        <h2 className="text-xl font-semibold mb-3 text-gray-900">Login Required</h2>
        <p className="text-gray-600 mb-6">{message}</p>
        <button
          onClick={handleOk}
          className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors font-medium w-full"
        >
          Login / Sign Up
        </button>
      </motion.div>
    </motion.div>
  );
};

interface PythonNoticeItem {
  id: string;
  title: string;
  date: string;
  file_url: string;
  file_name: string;
  file_size: string;
  category: 'Exam' | 'Admission' | 'Result' | 'General';
}

const PUNotices: React.FC = () => {
  useSEO({
    title: "Pokhara University Official Notices & Exam Schedules",
    description: "Stay updated with official Pokhara University (PU) exam schedules, result publications, admission calls, and general notices.",
    keywords: "pu notices, pokhara university notices, exam schedule, pu results"
  });

  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [loading, setLoading] = useState(true);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        const data = await apiClient.get('/notices') as PythonNoticeItem[];

        const formatted = data.map((item) => ({
          objectId: item.id,
          title: item.title,
          date: new Date(item.date),
          fileUrl: item.file_url,
          fileName: item.file_name,
          fileSize: item.file_size,
          category: item.category,
        }));

        setNotices(formatted);
      } catch (err) {
        console.error('Error fetching notices:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchNotices();
  }, []);

  useEffect(() => {
    if (showUploadModal || loginModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showUploadModal, loginModalOpen]);

  const filteredNotices = notices.filter((notice) => {
    const matchesSearch = searchTerm
      ? notice.title.toLowerCase().includes(searchTerm.toLowerCase())
      : true;
    const matchesCategory = selectedCategory ? notice.category === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Exam':
        return 'bg-red-55/70 text-red-600 border-red-100/50';
      case 'Admission':
        return 'bg-blue-50 text-blue-600 border-blue-100/50';
      case 'Result':
        return 'bg-green-50 text-green-600 border-green-100/50';
      case 'General':
        return 'bg-slate-50 text-slate-600 border-slate-100/50';
      default:
        return 'bg-slate-50 text-slate-600 border-slate-100/50';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Exam':
        return <BookOpen className="w-3.5 h-3.5" />;
      case 'Admission':
        return <Users className="w-3.5 h-3.5" />;
      case 'Result':
        return <Award className="w-3.5 h-3.5" />;
      case 'General':
        return <Bell className="w-3.5 h-3.5" />;
      default:
        return <FileText className="w-3.5 h-3.5" />;
    }
  };

  const handleDownload = (notice: Notice) => {
    if (!user) {
      setLoginModalOpen(true);
      return;
    }

    if (notice.fileUrl && notice.fileUrl !== '#') {
      const link = document.createElement('a');
      link.href = notice.fileUrl;
      link.download = notice.fileName;
      link.target = '_blank';
      link.click();
    } else {
      alert('File URL not available.');
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 120,
        damping: 18,
      },
    },
  };

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-800 pb-20">
      <AnimatePresence>
        {loginModalOpen && (
          <LoginRedirectModal
            isOpen={loginModalOpen}
            onClose={() => setLoginModalOpen(false)}
            message="Please login or signup to download notices."
          />
        )}
      </AnimatePresence>

      {/* Top Banner Hero Area */}
      <section className="relative bg-slate-950 text-white py-24 px-4 overflow-hidden">
        {/* Soft Glowing Background Orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-1/4 w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 right-1/4 w-[350px] h-[350px] bg-purple-600/10 rounded-full blur-[120px]" />
        </div>

        <div className="relative max-w-6xl mx-auto text-center z-10 space-y-6">
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent"
          >
            PU Notices
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed"
          >
            Official exam guidelines, admission alerts, result announcements, and general notices from Pokhara University for the BCSIT program.
          </motion.p>

          {/* Quick Statistics Banner */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto pt-6"
          >
            {[
              { icon: FileText, label: 'Total Notices', value: notices.length },
              { icon: Bell, label: 'Alert Categories', value: categories.length },
              {
                icon: Clock,
                label: 'This Month',
                value: notices.filter(
                  (n) => new Date(n.date).getMonth() === new Date().getMonth()
                ).length,
              },
              { icon: TrendingUp, label: 'Downloads', value: '100+' },
            ].map((stat, idx) => (
              <div
                key={idx}
                className="flex items-center space-x-3 bg-slate-900/60 backdrop-blur-md border border-slate-800/80 rounded-2xl p-4 text-left shadow-sm hover:border-slate-700/50 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-indigo-400">
                  <stat.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{stat.value}</p>
                  <p className="text-[10px] text-slate-500 font-semibold">{stat.label}</p>
                </div>
              </div>
            ))}
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap justify-center gap-3 pt-2"
          >
            <a
              href="https://exam.pu.edu.np:9094/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center space-x-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-white font-bold text-xs px-6 py-3 rounded-xl transition-all shadow-md"
            >
              <ExternalLink className="h-4 w-4" />
              <span>Official PU Result Portal</span>
            </a>

            {isAdmin && (
              <Button
                onClick={() => setShowUploadModal(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-6 py-3 rounded-xl border-0 shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/35 transition-all flex items-center gap-2"
              >
                <UploadCloud className="h-4 w-4" />
                <span>Upload New Notice</span>
              </Button>
            )}
          </motion.div>
        </div>
      </section>

      {/* Sticky Interactive Dashboard Controls */}
      <section className="sticky top-16 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200/60 py-4 px-4 shadow-sm">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          
          {/* Search bar */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search notices by title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all bg-white text-slate-800 placeholder:text-slate-400"
            />
          </div>

          {/* Filters & Display toggles */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 border-slate-200 text-slate-700 font-semibold px-4 py-2 text-xs rounded-xl ${
                showFilters ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : ''
              }`}
            >
              <Filter className="w-4 h-4" />
              <span>Filters</span>
            </Button>

            <div className="flex bg-slate-100 rounded-xl p-1 border border-slate-200/40">
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === 'list' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'
                }`}
                aria-label="List View"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === 'grid' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'
                }`}
                aria-label="Grid View"
              >
                <Grid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Expandable filter panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="max-w-6xl mx-auto overflow-hidden"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 mt-4 border-t border-slate-100">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Notice Category</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-slate-800"
                  >
                    <option value="">All Categories</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {(searchTerm || selectedCategory) && (
                <div className="flex justify-between items-center pt-3 text-[10px] font-bold text-slate-500">
                  <span>
                    Showing {filteredNotices.length} of {notices.length} notices
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedCategory('');
                    }}
                    className="text-[10px] border-slate-200 font-bold px-3 py-1 bg-slate-50 hover:bg-slate-100"
                  >
                    Reset Filters
                  </Button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* Main Notices Directory Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        
        {loading ? (
          /* Localized loading skeletons */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse bg-white border border-slate-100 rounded-2xl p-6 space-y-4 shadow-sm text-left">
                <div className="space-y-2">
                  <div className="h-4 bg-slate-100 rounded w-1/4"></div>
                  <div className="h-4 bg-slate-100 rounded w-3/4"></div>
                </div>
                <div className="h-8 bg-slate-50 rounded-xl w-full mt-6"></div>
              </div>
            ))}
          </div>
        ) : filteredNotices.length > 0 ? (
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedCategory + '-' + viewMode}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start'
                  : 'space-y-4 max-w-4xl mx-auto'
              }
            >
              {filteredNotices.map((notice) => (
                <motion.div
                  key={notice.objectId}
                  variants={itemVariants}
                  className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-indigo-150 transition-all duration-300 overflow-hidden flex flex-col h-full text-left group"
                >
                  {/* Notice Content Header */}
                  <div className="p-6 border-b border-slate-100/50 bg-gradient-to-b from-slate-50/50 to-transparent flex-1">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[10px] font-bold ${getCategoryColor(notice.category)}`}>
                        {getCategoryIcon(notice.category)}
                        <span>{notice.category}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-bold flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-405" />
                        <span>
                          {notice.date.toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                    </div>

                    <h3 className="text-sm font-bold text-slate-800 mb-3 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                      {notice.title}
                    </h3>

                    <div className="flex items-center justify-between text-[10px] text-slate-405 font-semibold border-t border-slate-100/60 pt-3.5 mt-4">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-slate-400 flex-shrink-0" />
                        <span className="truncate max-w-[150px] font-bold text-slate-500">
                          {notice.fileName}
                        </span>
                      </div>
                      <span className="bg-slate-50 border border-slate-100 px-2 py-0.5 rounded text-[9px] font-extrabold text-slate-500">
                        {notice.fileSize}
                      </span>
                    </div>
                  </div>

                  {/* Notice Card Footer Action Button */}
                  <div className="p-5 bg-slate-50/40 border-t border-slate-100/60">
                    <button
                      onClick={() => handleDownload(notice)}
                      className="w-full flex items-center justify-center gap-2 bg-indigo-50 border border-indigo-100/40 hover:bg-indigo-600 text-indigo-600 hover:text-white px-4 py-2.5 rounded-xl transition-all duration-300 font-bold text-xs group-hover:shadow-sm"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download Notice Document</span>
                      <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20 bg-white border border-slate-100 rounded-3xl p-8 max-w-lg mx-auto"
          >
            <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-100">
              <FileText className="w-6 h-6 text-slate-400" />
            </div>
            <h3 className="text-base font-bold text-slate-800 mb-1">No notices found</h3>
            <p className="text-xs text-slate-500 mb-6 leading-relaxed">
              We couldn't find any PU notices matching your search filters.
            </p>
            {(searchTerm || selectedCategory) && (
              <Button
                variant="outline"
                className="text-xs font-bold border-slate-200 px-4 py-2"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('');
                }}
              >
                Clear Search Filters
              </Button>
            )}
          </motion.div>
        )}
      </main>

      {/* Upload Modal Trigger for admin */}
      <AnimatePresence>
        {showUploadModal && isAdmin && (
          <motion.div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-50 p-4 sm:p-6 overflow-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white/95 backdrop-blur-lg border border-slate-100 p-6 rounded-2xl shadow-premium w-full max-w-lg space-y-4 max-h-[90vh] overflow-auto"
            >
              <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-3">
                <h2 className="text-xl font-bold text-slate-800">Upload PU Notice</h2>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="text-slate-400 hover:text-slate-600 transition-colors p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <UploadNoticeForm
                onUploadSuccess={(newNotice) => {
                  setNotices((prev) => [newNotice, ...prev]);
                  setShowUploadModal(false);
                }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Button component for consistency
const Button: React.FC<{
  variant?: 'default' | 'outline';
  onClick?: () => void;
  className?: string;
  children: React.ReactNode;
}> = ({ variant = 'default', onClick, className = '', children }) => {
  const baseClasses =
    'px-4 py-2.5 rounded-lg font-semibold transition-colors duration-200 flex items-center gap-2 border';
  const variantClasses =
    variant === 'outline'
      ? 'border-slate-200 text-slate-700 bg-white hover:bg-slate-50'
      : 'bg-indigo-600 border-indigo-650 text-white hover:bg-indigo-700';

  return (
    <button onClick={onClick} className={`${baseClasses} ${variantClasses} ${className}`}>
      {children}
    </button>
  );
};

export default PUNotices;