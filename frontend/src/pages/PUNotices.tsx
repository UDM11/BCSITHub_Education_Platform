import React, { useState, useEffect, useMemo } from 'react';
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
  Award,
  X,
  ChevronRight,
  BookOpen,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import UploadNoticeForm from '../components/common/UploadNoticeForm';
import { NoticeReaderModal } from '../components/common/NoticeReaderModal';
import LoginRedirectModal from '../components/common/LoginRedirectModal';
import { motion, AnimatePresence } from 'framer-motion';
import { apiClient } from '../lib/apiClient';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useSEO } from '../hooks/useSEO';

interface Notice {
  objectId: string;
  title: string;
  date: Date;
  fileUrl?: string;
  fileName?: string;
  fileSize?: string;
  category: 'Exam' | 'Admission' | 'Result' | 'General';
  content?: string;
}

const slugify = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');

const categories = ['Exam', 'Admission', 'Result', 'General'];

interface PythonNoticeItem {
  id: string;
  title: string;
  date: string;
  file_url?: string;
  file_name?: string;
  file_size?: string;
  category: 'Exam' | 'Admission' | 'Result' | 'General';
  content?: string;
}

const PUNotices: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const { noticeId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  
  // Notice Preview Modal State
  const [selectedNoticeForPreview, setSelectedNoticeForPreview] = useState<Notice | null>(null);

  // Find current notice matching URL parameters
  const currentNotice = useMemo(() => {
    if (!noticeId || notices.length === 0) return null;
    return notices.find((n) => n.objectId === noticeId || slugify(n.title) === noticeId) || null;
  }, [noticeId, notices]);

  const seoTitle = useMemo(() => {
    if (currentNotice) {
      return `${currentNotice.title}`;
    }
    if (selectedCategory) {
      return `${selectedCategory} Notices`;
    }
    return "Pokhara University Official Notices";
  }, [currentNotice, selectedCategory]);

  const seoDescription = useMemo(() => {
    if (currentNotice) {
      const excerpt = currentNotice.content 
        ? currentNotice.content.substring(0, 150) + "..." 
        : `Official Pokhara University notice published on ${currentNotice.date.toLocaleDateString()}.`;
      return excerpt;
    }
    return "Stay updated with official Pokhara University (PU) exam schedules, result publications, admission calls, and general notices.";
  }, [currentNotice]);

  useSEO({
    title: seoTitle,
    description: seoDescription,
    keywords: `pu notices, pokhara university notices, exam schedule, pu results${selectedCategory ? `, pu ${selectedCategory.toLowerCase()} notices` : ''}`,
    image: "https://bcsithub.umeshdarlami.com.np/logo.jpg"
  });

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
          content: item.content,
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

  // Sync notice selection with URL path parameter
  useEffect(() => {
    if (notices.length > 0) {
      if (noticeId) {
        const matched = notices.find(n => n.objectId === noticeId || slugify(n.title) === noticeId);
        if (matched) {
          setSelectedNoticeForPreview(matched);
        } else {
          setSelectedNoticeForPreview(null);
        }
      } else {
        setSelectedNoticeForPreview(null);
      }
    }
  }, [noticeId, notices]);

  useEffect(() => {
    if (showUploadModal || loginModalOpen || selectedNoticeForPreview) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showUploadModal, loginModalOpen, selectedNoticeForPreview]);

  const filteredNotices = notices.filter((notice) => {
    const matchesSearch = searchTerm
      ? notice.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (notice.content && notice.content.toLowerCase().includes(searchTerm.toLowerCase()))
      : true;
    const matchesCategory = selectedCategory ? notice.category === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Exam':
        return 'bg-rose-50 text-rose-600 border-rose-100';
      case 'Admission':
        return 'bg-sky-50 text-sky-600 border-sky-100';
      case 'Result':
        return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'General':
        return 'bg-slate-50 text-slate-600 border-slate-250';
      default:
        return 'bg-slate-50 text-slate-605 border-slate-100';
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

  const handleCardClick = (notice: Notice) => {
    navigate(`/pu-notices/${slugify(notice.title)}`);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.04,
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
        stiffness: 130,
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
            message="Please sign up or log in to view and download PU notices."
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedNoticeForPreview && (
          <NoticeReaderModal
            notice={selectedNoticeForPreview}
            onClose={() => navigate('/pu-notices')}
            isAuthenticated={!!user}
            onAuthRequired={() => setLoginModalOpen(true)}
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
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent"
          >
            PU Announcements & Notices
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto leading-relaxed font-medium"
          >
            Official examination routines, result declarations, admission updates, and administrative notices directly from Pokhara University (PU) for the BCSIT stream.
          </motion.p>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap justify-center gap-3.5 pt-2"
          >
            <a
              href="https://exam.pu.edu.np:9094/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-white font-bold text-xs px-6 py-3 rounded-xl transition-all shadow-md cursor-pointer hover:border-slate-700"
            >
              <ExternalLink className="h-4 w-4 text-slate-400" />
              <span>Official Result Portal</span>
            </a>

            {isAdmin && (
              <Button
                onClick={() => setShowUploadModal(true)}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:brightness-105 border-0 text-white font-bold text-xs px-6 py-3 rounded-xl shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/20 transition-all flex items-center gap-2 cursor-pointer"
              >
                <UploadCloud className="h-4 w-4" />
                <span>Upload PU Notice</span>
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
              placeholder="Search by title or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all bg-white text-slate-800 placeholder:text-slate-400"
            />
          </div>

          {/* Filters & Display toggles */}
          <div className="flex flex-wrap items-center justify-between md:justify-end gap-3 w-full md:w-auto">
            <div className="flex bg-slate-100 rounded-xl p-1 border border-slate-200/40">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(selectedCategory === cat ? '' : cat)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-black tracking-wide uppercase transition-all ${
                    selectedCategory === cat
                      ? 'bg-white text-indigo-600 shadow-sm border border-slate-200/50'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 border-slate-200 text-slate-700 font-semibold px-4 py-2 text-xs rounded-xl ${
                showFilters ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : ''
              }`}
            >
              <Filter className="w-4 h-4" />
              <span>More Filters</span>
            </Button>

            <div className="flex bg-slate-100 rounded-xl p-1 border border-slate-200/40">
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === 'list' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'
                }`}
                aria-label="List View"
              >
                <List className="w-4.5 h-4.5" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === 'grid' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'
                }`}
                aria-label="Grid View"
              >
                <Grid className="w-4.5 h-4.5" />
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 mt-4 border-t border-slate-100 text-left">
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
                    className="text-[10px] border-slate-200 font-bold px-3 py-1 bg-slate-50 hover:bg-slate-100 rounded-lg"
                  >
                    Reset Filters
                  </Button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Active Filter Chips */}
        {(selectedCategory || searchTerm) && (
          <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-slate-100 max-w-6xl mx-auto justify-start text-left items-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">Active Filters:</span>
            {selectedCategory && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-indigo-50 border border-indigo-100 text-indigo-700 text-[10px] font-bold rounded-xl">
                <span>Category: {selectedCategory}</span>
                <button onClick={() => setSelectedCategory('')} className="hover:text-indigo-900 font-extrabold text-xs">×</button>
              </span>
            )}
            {searchTerm && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-rose-50 border border-rose-100 text-rose-700 text-[10px] font-bold rounded-xl">
                <span>Query: "{searchTerm}"</span>
                <button onClick={() => setSearchTerm('')} className="hover:text-rose-900 font-extrabold text-xs">×</button>
              </span>
            )}
            <button
              onClick={() => { setSelectedCategory(''); setSearchTerm(''); }}
              className="text-[10px] font-bold text-slate-400 hover:text-indigo-650 transition-colors uppercase ml-2 underline cursor-pointer"
            >
              Reset All
            </button>
          </div>
        )}
      </section>

      {/* Main Notices Directory Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        
        {loading ? (
          /* Localized loading skeletons */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse bg-white border border-slate-100 rounded-3xl p-6 space-y-4 shadow-sm text-left">
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
                  ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch'
                  : 'space-y-4 max-w-4xl mx-auto'
              }
            >
              {filteredNotices.map((notice) => {
                const hasFile = !!notice.fileUrl;
                
                return viewMode === 'grid' ? (
                  /* Grid View Card */
                  <Link
                    key={notice.objectId}
                    to={`/pu-notices/${slugify(notice.title)}`}
                    className="block h-full cursor-pointer"
                  >
                    <motion.div
                      variants={itemVariants}
                      className="bg-white rounded-3xl border border-slate-200/60 shadow-sm hover:shadow-md hover:border-indigo-400 transition-all duration-355 overflow-hidden flex flex-col h-full text-left group cursor-pointer"
                    >
                      {/* Notice Card Body */}
                      <div className="p-6 flex flex-col flex-1 relative justify-between">
                        <div>
                          <div className="flex items-center justify-between mb-4.5">
                            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-[9px] font-black tracking-wide uppercase ${getCategoryColor(notice.category)}`}>
                              {getCategoryIcon(notice.category)}
                              <span>{notice.category}</span>
                            </div>
                            
                            <div className="text-[10px] text-slate-400 font-bold flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-slate-400" />
                              <span>
                                {notice.date.toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                })}
                              </span>
                            </div>
                          </div>

                          <h3 className="text-sm sm:text-base font-extrabold text-slate-800 mb-3 group-hover:text-indigo-650 transition-colors leading-snug line-clamp-2">
                            {notice.title}
                          </h3>

                          {notice.content && (
                            <p className="text-xs text-slate-400 leading-relaxed font-medium line-clamp-3 mb-4">
                              {notice.content}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center justify-between text-[10px] text-slate-400 font-semibold border-t border-slate-100/80 pt-3.5 mt-4">
                          {hasFile ? (
                            <>
                              <div className="flex items-center gap-1.5 truncate max-w-[170px]">
                                <FileText className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                                <span className="truncate font-bold text-slate-500">
                                  {notice.fileName}
                                </span>
                              </div>
                              <span className="bg-slate-50 border border-slate-150 px-2 py-0.5 rounded text-[8px] font-black uppercase text-slate-500">
                                {notice.fileSize}
                              </span>
                            </>
                          ) : (
                            <>
                              <div className="flex items-center gap-1.5">
                                <Bell className="w-4 h-4 text-purple-500 flex-shrink-0" />
                                <span className="font-bold text-purple-650">
                                  Text announcement
                                </span>
                              </div>
                              <span className="bg-purple-50 border border-purple-100 px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase text-purple-600">
                                No attachment
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Footer Call-to-Action */}
                      <div className="p-4 bg-slate-50/40 border-t border-slate-100/60 flex items-center justify-between group-hover:bg-slate-50/80 transition-colors">
                        <span className="text-[10px] font-black text-indigo-600 flex items-center gap-1">
                          {hasFile ? "View Attachment & Details" : "Read Announcement"}
                          <ChevronRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
                        </span>
                      </div>
                    </motion.div>
                  </Link>
                ) : (
                  /* List View Card */
                  <Link
                    key={notice.objectId}
                    to={`/pu-notices/${slugify(notice.title)}`}
                    className="block cursor-pointer"
                  >
                    <motion.div
                      variants={itemVariants}
                      className="bg-white rounded-2xl border border-slate-200/50 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm hover:shadow-md hover:border-indigo-400 transition-all duration-300 cursor-pointer text-left group"
                    >
                      <div className="flex items-start gap-4 flex-1 min-w-0">
                        {/* Left icon wrapper */}
                        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                          notice.category === 'Exam' ? 'bg-rose-50 border border-rose-100 text-rose-600' :
                          notice.category === 'Admission' ? 'bg-sky-50 border border-sky-100 text-sky-600' :
                          notice.category === 'Result' ? 'bg-emerald-50 border border-emerald-100 text-emerald-600' :
                          'bg-purple-50 border border-purple-100 text-purple-600'
                        }`}>
                          {getCategoryIcon(notice.category)}
                        </div>

                        {/* Middle description columns */}
                        <div className="space-y-1 flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">
                              {notice.category} Notice
                            </span>
                            <span className="text-[9px] text-slate-400 font-bold">•</span>
                            <span className="text-[9px] text-slate-400 font-bold flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-slate-400" />
                              {notice.date.toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                            </span>
                          </div>
                          
                          <h4 className="text-xs sm:text-sm font-extrabold text-slate-800 group-hover:text-indigo-650 transition-colors truncate">
                            {notice.title}
                          </h4>

                          {notice.content && (
                            <p className="text-[10px] text-slate-400 truncate leading-snug font-medium max-w-xl">
                              {notice.content}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Right side attachment flags */}
                      <div className="flex items-center gap-3 shrink-0 self-stretch sm:self-auto border-t sm:border-0 border-slate-100 pt-3 sm:pt-0 justify-between sm:justify-end">
                        {hasFile ? (
                          <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-xl text-[10px]">
                            <FileText className="w-3.5 h-3.5 text-indigo-500" />
                            <span className="font-bold text-slate-500">{notice.fileSize}</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 bg-purple-50/50 border border-purple-100 px-3 py-1.5 rounded-xl text-[10px]">
                            <Bell className="w-3.5 h-3.5 text-purple-500" />
                            <span className="font-bold text-purple-650">Text-Only</span>
                          </div>
                        )}
                        
                        <button className="h-8 w-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-455 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all">
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  </Link>
                );
              })}
            </motion.div>
          </AnimatePresence>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20 bg-white border border-slate-200/60 rounded-3xl p-8 max-w-lg mx-auto"
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
                className="text-xs font-bold border-slate-200 px-4 py-2 rounded-xl"
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
              className="bg-white/95 backdrop-blur-lg border border-slate-200/60 p-6 rounded-3xl shadow-premium w-full max-w-lg space-y-4 max-h-[90vh] overflow-auto text-left"
            >
              <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-3">
                <h2 className="text-lg sm:text-xl font-extrabold text-slate-805 tracking-tight">Upload PU Notice</h2>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="text-slate-400 hover:text-slate-600 transition-colors p-1 border-0 bg-transparent cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <UploadNoticeForm
                onUploadSuccess={(newNotice) => {
                  const formattedNewNotice: Notice = {
                    objectId: newNotice.id || Math.random().toString(),
                    title: newNotice.title,
                    date: new Date(newNotice.date),
                    fileUrl: newNotice.fileUrl,
                    fileName: newNotice.fileName,
                    fileSize: newNotice.fileSize,
                    category: newNotice.category,
                    content: newNotice.content,
                  };
                  setNotices((prev) => [formattedNewNotice, ...prev]);
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
    'px-4 py-2.5 rounded-lg font-bold transition-all duration-200 flex items-center gap-2 border cursor-pointer';
  const variantClasses =
    variant === 'outline'
      ? 'border-slate-200 text-slate-700 bg-white hover:bg-slate-50'
      : 'bg-indigo-650 border-indigo-650 text-white hover:brightness-105';

  return (
    <button onClick={onClick} className={`${baseClasses} ${variantClasses} ${className}`}>
      {children}
    </button>
  );
};

export default PUNotices;