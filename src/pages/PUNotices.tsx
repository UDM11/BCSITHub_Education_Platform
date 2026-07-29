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
  Eye,
  Clock,
  X,
  ChevronRight,
  BookOpen
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import UploadNoticeForm from '../components/common/UploadNoticeForm';
import { motion, AnimatePresence } from 'framer-motion';
import Backendless from '../lib/backendless';
import { useNavigate } from 'react-router-dom';

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

const PUNotices: React.FC = () => {
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
        const queryBuilder = Backendless.DataQueryBuilder.create()
          .setSortBy(['date DESC']);

        const data = await Backendless.Data.of('PU_Notices').find(queryBuilder);

        const formatted = data.map((item: any) => ({
          objectId: item.objectId,
          title: item.title,
          date: new Date(item.date),
          fileUrl: item.fileUrl,
          fileName: item.fileName,
          fileSize: item.fileSize,
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
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Admission':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Result':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'General':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Exam':
        return <BookOpen className="w-4 h-4" />;
      case 'Admission':
        return <Users className="w-4 h-4" />;
      case 'Result':
        return <Award className="w-4 h-4" />;
      case 'General':
        return <Bell className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div 
            className="relative w-20 h-20 mx-auto mb-6"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <div className="absolute inset-0 rounded-full border-4 border-indigo-200"></div>
            <div className="absolute inset-0 rounded-full border-4 border-indigo-600 border-t-transparent"></div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Loading PU Notices</h3>
            <p className="text-gray-500">Fetching latest announcements...</p>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <>
      <AnimatePresence>
        {loginModalOpen && (
          <LoginRedirectModal
            isOpen={loginModalOpen}
            onClose={() => setLoginModalOpen(false)}
            message="Please login or signup to download notices."
          />
        )}
      </AnimatePresence>

      <div className="min-h-screen bg-slate-50/30">
        {/* Hero Section */}
        <motion.section 
          className="relative py-20 sm:py-24 px-4 overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-900"></div>
          <motion.div 
            className="absolute inset-0 opacity-20"
            animate={{
              background: [
                'radial-gradient(circle at 10% 40%, rgba(99, 102, 241, 0.4) 0%, transparent 60%)',
                'radial-gradient(circle at 90% 10%, rgba(139, 92, 246, 0.4) 0%, transparent 60%)',
                'radial-gradient(circle at 30% 90%, rgba(59, 130, 246, 0.4) 0%, transparent 60%)'
              ]
            }}
            transition={{ duration: 10, repeat: Infinity }}
          />
          
          <div className="relative max-w-6xl mx-auto text-center text-white z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="inline-flex items-center bg-white/10 backdrop-blur-sm rounded-full px-5 py-1.5 mb-6 border border-white/10">
                <Bell className="w-5 h-5 text-yellow-300 mr-2" />
                <span className="text-sm font-semibold text-yellow-50">Announcements Portal</span>
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 leading-tight bg-gradient-to-r from-white via-slate-100 to-indigo-100 bg-clip-text text-transparent">
                PU Notices
              </h1>
              <p className="text-lg sm:text-xl text-indigo-100 mb-10 max-w-3xl mx-auto px-4 sm:px-0">
                Official notices, exam guidelines, and announcements from Pokhara University for the BCSIT program.
              </p>
            </motion.div>
            
            {/* Stats */}
            <motion.div 
              className="grid grid-cols-2 sm:grid-cols-4 gap-4 lg:gap-6 max-w-4xl mx-auto mb-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              {[
                { icon: FileText, label: 'Total Notices', value: notices.length },
                { icon: Bell, label: 'Categories', value: categories.length },
                { icon: Clock, label: 'This Month', value: notices.filter(n => new Date(n.date).getMonth() === new Date().getMonth()).length },
                { icon: TrendingUp, label: 'Downloads', value: '100+' }
              ].map((stat, index) => (
                <motion.div 
                  key={stat.label}
                  className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/10 hover:border-white/20 transition-all duration-300 shadow-lg shadow-indigo-950/10"
                  whileHover={{ scale: 1.05 }}
                >
                  <stat.icon className="w-7 h-7 mx-auto mb-3 text-yellow-300" />
                  <div className="text-2xl sm:text-3xl font-bold">{stat.value}</div>
                  <div className="text-xs sm:text-sm text-indigo-200 font-semibold">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="flex flex-col sm:flex-row justify-center gap-4"
            >
              <a
                href="https://exam.pu.edu.np:9094/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center space-x-2.5 bg-white text-indigo-600 hover:bg-indigo-50 px-6 py-3.5 rounded-xl font-semibold transition-all duration-300 shadow-md hover:shadow-lg hover:translate-y-[-2px]"
              >
                <ExternalLink className="h-5 w-5" />
                <span>PU Result Portal</span>
              </a>

              {isAdmin && (
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="inline-flex items-center justify-center space-x-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-6 py-3.5 rounded-xl font-semibold transition-all duration-300 shadow-md hover:shadow-lg hover:translate-y-[-2px]"
                >
                  <UploadCloud className="h-5 w-5" />
                  <span>Upload Notice</span>
                </button>
              )}
            </motion.div>
          </div>
        </motion.section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 mt-12">
          {/* Controls Section */}
          <motion.section 
            className="py-5 px-6 bg-white/70 backdrop-blur-md border border-slate-100 rounded-2xl shadow-premium mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4">
              {/* Search */}
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search notices..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all duration-300 bg-white text-slate-800 placeholder:text-slate-400"
                  />
                </div>
              </div>

              {/* Controls */}
              <div className="flex flex-wrap items-center gap-4">
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 border-slate-200 text-slate-700 font-semibold"
                >
                  <Filter className="w-4 h-4" />
                  Filters
                </Button>
                
                <div className="flex bg-slate-100 rounded-xl p-1 border border-slate-200/40">
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg transition-all duration-200 ${viewMode === 'list' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg transition-all duration-200 ${viewMode === 'grid' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Filters */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-5 pt-5 border-t border-slate-100"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Category</label>
                      <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all duration-300 text-slate-800"
                      >
                        <option value="">All Categories</option>
                        {categories.map((category) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  {(searchTerm || selectedCategory) && (
                    <div className="mt-4 flex justify-between items-center text-xs font-semibold">
                      <span className="text-slate-500">
                        Showing {filteredNotices.length} of {notices.length} notices
                      </span>
                      <button
                        onClick={() => {
                          setSearchTerm('');
                          setSelectedCategory('');
                        }}
                        className="text-indigo-600 hover:text-indigo-800"
                      >
                        Clear Filters
                      </button>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.section>

          {/* Notices List/Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            {filteredNotices.length > 0 ? (
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
                <AnimatePresence>
                  {filteredNotices.map((notice, index) => (
                    <motion.div
                      key={notice.objectId}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.4, delay: 0.05 * index }}
                      whileHover={{ y: -5 }}
                      className="group cursor-pointer"
                    >
                      <div className="bg-white rounded-2xl border border-slate-100 shadow-premium group-hover:shadow-premium-hover transition-all duration-300 overflow-hidden flex flex-col justify-between h-full">
                        {/* Notice Header */}
                        <div className="p-6">
                          <div className="flex items-center justify-between mb-4">
                            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold ${getCategoryColor(notice.category)}`}>
                              {getCategoryIcon(notice.category)}
                              <span>{notice.category}</span>
                            </div>
                            <div className="text-xs text-slate-500 font-semibold flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-slate-400" />
                              {notice.date.toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                            </div>
                          </div>
                          
                          <h3 className="text-lg font-bold text-slate-800 mb-3 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                            {notice.title}
                          </h3>
                          
                          <div className="flex items-center justify-between text-xs text-slate-500 mb-2 border-t border-slate-50 pt-4 mt-4">
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4 text-slate-400 flex-shrink-0" />
                              <span className="truncate max-w-[150px] font-semibold">{notice.fileName}</span>
                            </div>
                            <span className="bg-slate-50 text-slate-500 border border-slate-100 px-2 py-0.5 rounded font-bold">{notice.fileSize}</span>
                          </div>
                        </div>

                        {/* Download Button */}
                        <div className="px-6 pb-6">
                          <button
                            onClick={() => handleDownload(notice)}
                            className="w-full flex items-center justify-center gap-2 bg-indigo-50 border border-indigo-100/50 hover:bg-indigo-600 text-indigo-600 hover:text-white px-4 py-3 rounded-xl transition-all duration-300 font-semibold group-hover:shadow-sm"
                          >
                            <Download className="w-4 h-4" />
                            <span>Download Notice</span>
                            <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="text-center py-16"
              >
                <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">No notices found</h3>
                <p className="text-slate-600 mb-6 text-sm">
                  {searchTerm || selectedCategory 
                    ? "Try adjusting your search or filter criteria" 
                    : "Check back later for new notices"}
                </p>
                {(searchTerm || selectedCategory) && (
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedCategory('');
                    }}
                    className="text-indigo-600 hover:text-indigo-800 font-semibold text-sm"
                  >
                    Clear Search & Filters
                  </button>
                )}
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* Upload Modal */}
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
                  <h2 className="text-xl font-bold text-slate-800">Upload Notice</h2>
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
    </>
  );
};

// Button component for consistency
const Button: React.FC<{
  variant?: 'default' | 'outline';
  onClick?: () => void;
  className?: string;
  children: React.ReactNode;
}> = ({ variant = 'default', onClick, className = '', children }) => {
  const baseClasses = 'px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2';
  const variantClasses = variant === 'outline' 
    ? 'border border-gray-300 text-gray-700 hover:bg-gray-50' 
    : 'bg-indigo-600 text-white hover:bg-indigo-700';
  
  return (
    <button 
      onClick={onClick} 
      className={`${baseClasses} ${variantClasses} ${className}`}
    >
      {children}
    </button>
  );
};

export default PUNotices;