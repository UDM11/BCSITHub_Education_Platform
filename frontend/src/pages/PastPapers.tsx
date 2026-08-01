import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload,
  Download,
  Calendar,
  School,
  FileText,
  Filter,
  Plus,
  Search,
  Users,
  Clock,
  Grid,
  List,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { UploadPaperModal } from '../components/Notes/UploadPaperModal';
import { apiClient } from '../lib/apiClient';
import LoginRedirectModal from '../components/common/LoginRedirectModal';
import { useSEO } from '../hooks/useSEO';

const semesters = [
  { value: '1', label: '1st Semester' },
  { value: '2', label: '2nd Semester' },
  { value: '3', label: '3rd Semester' },
  { value: '4', label: '4th Semester' },
  { value: '5', label: '5th Semester' },
  { value: '6', label: '6th Semester' },
  { value: '7', label: '7th Semester' },
  { value: '8', label: '8th Semester' },
];

const examTypes = [
  { value: 'midterm', label: 'Midterm' },
  { value: 'pre-board', label: 'Pre-board' },
  { value: 'final', label: 'Final' },
];

const colleges = [
  { value: 'Pokhara University', label: 'Pokhara University' },
  { value: 'Ace Institute of Management', label: 'Ace Institute of Management' },
  { value: 'SAIM College', label: 'SAIM College' },
  { value: 'Apollo International College', label: 'Apollo International College' },
  { value: 'Quest International College', label: 'Quest International College' },
  { value: 'Shubhashree College of Management', label: 'Shubhashree College of Management' },
  { value: 'Liberty College', label: 'Liberty College' },
  { value: 'Uniglobe College', label: 'Uniglobe College' },
  { value: 'Medhavi College', label: 'Medhavi College' },
  { value: 'Crimson College of Technology', label: 'Crimson College of Technology' },
  { value: 'Rajdhani Model College', label: 'Rajdhani Model College' },
  { value: 'Excel Business College', label: 'Excel Business College' },
  { value: 'Malpi International College', label: 'Malpi International College' },
  { value: 'Nobel College', label: 'Nobel College' },
  { value: 'Boston International College', label: 'Boston International College' },
  { value: 'Pokhara College of Management', label: 'Pokhara College of Management' },
  { value: 'Apex College', label: 'Apex College' },
  { value: 'Other', label: 'Other College' },
];

interface Paper {
  objectId?: string;
  title: string;
  subject: string;
  semester: number;
  examType: string;
  college: string;
  uploadedAt: string | Date;
  uploadedBy: string;
  downloads: number;
  approved: boolean;
  fileUrl: string;
  ownerId?: string;
}

export function PastPapers() {
  useSEO({
    title: "Pokhara University BCSIT Past Question Papers & Solutions",
    description: "Download Pokhara University BCSIT semester final past exam question papers, midterm questions, and student solutions for all core subjects.",
    keywords: "bcsit past papers, pokhara university question papers, pu past papers, bcsit exam papers"
  });

  const [papers, setPapers] = useState<Paper[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSemester, setSelectedSemester] = useState('');
  const [selectedExamType, setSelectedExamType] = useState('');
  const [selectedCollege, setSelectedCollege] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginModalMessage, setLoginModalMessage] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'date' | 'downloads' | 'name'>('date');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const papersPerPage = 18;

  const { user } = useAuth();

  useEffect(() => {
    const fetchPapers = async () => {
      try {
        setLoading(true);

        const params = new URLSearchParams();
        if (selectedSemester) params.append('semester', selectedSemester);
        if (selectedExamType) params.append('exam_type', selectedExamType.toLowerCase());
        if (selectedCollege) params.append('college', selectedCollege);

        const url = `/papers?${params.toString()}`;
        const data = await apiClient.get(url) as any[];

        const mappedResult: Paper[] = data.map((item) => ({
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
        }));
        setPapers(mappedResult);
      } catch (error) {
        console.error('Error fetching papers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPapers();
  }, [selectedSemester, selectedExamType, selectedCollege]);

  const filteredPapers = papers
    .filter((paper) => {
      if (searchQuery && !paper.subject.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return paper.approved || user?.role === 'admin' || user?.objectId === paper.ownerId;
    })
    .sort((a, b) => {
      if (sortBy === 'downloads') {
        return (b.downloads || 0) - (a.downloads || 0);
      }
      if (sortBy === 'name') {
        return a.subject.localeCompare(b.subject);
      }
      // default: sort by date desc
      return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime();
    });

  // Pagination calculations
  const totalPages = Math.ceil(filteredPapers.length / papersPerPage);
  const startIndex = (currentPage - 1) * papersPerPage;
  const endIndex = startIndex + papersPerPage;
  const currentPapers = filteredPapers.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedSemester, selectedExamType, selectedCollege, searchQuery]);

  const getExamTypeColor = (type: string) => {
    switch (type) {
      case 'midterm':
        return 'text-blue-600 bg-blue-50 border-blue-100/50';
      case 'pre-board':
        return 'text-amber-600 bg-amber-50 border-amber-100/50';
      case 'final':
        return 'text-rose-600 bg-rose-50 border-rose-100/50';
      default:
        return 'text-slate-600 bg-slate-50 border-slate-100/50';
    }
  };

  const handleDownload = async (paper: Paper) => {
    if (!user) {
      setLoginModalMessage('Please login or signup to download papers.');
      setShowLoginModal(true);
      return;
    }

    try {
      window.open(paper.fileUrl, '_blank');

      await apiClient.post(`/papers/${paper.objectId}/download`, {});

      setPapers((prev) =>
        prev.map((p) =>
          p.objectId === paper.objectId ? { ...p, downloads: (p.downloads || 0) + 1 } : p
        )
      );
    } catch (error) {
      console.error('Error updating download count:', error);
    }
  };

  const handleResetFilters = () => {
    setSelectedSemester('');
    setSelectedExamType('');
    setSelectedCollege('');
    setSearchQuery('');
  };

  const handleUploadClick = () => {
    if (!user) {
      setLoginModalMessage('Please login or signup to upload papers.');
      setShowLoginModal(true);
      return;
    }
    setShowUploadModal(true);
  };

  const handleApprove = async (paperId: string) => {
    try {
      await apiClient.post(`/papers/${paperId}/approve`, {});
      setPapers((prev) => prev.map((p) => (p.objectId === paperId ? { ...p, approved: true } : p)));
    } catch (error) {
      console.error(error);
      alert('Failed to approve paper.');
    }
  };

  const handleReject = async (paperId: string) => {
    if (!window.confirm('Are you sure you want to reject and delete this paper?')) return;
    try {
      await apiClient.delete(`/papers/${paperId}`);
      setPapers((prev) => prev.filter((p) => p.objectId !== paperId));
    } catch (error) {
      console.error(error);
      alert('Failed to reject paper.');
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
            Past Question Papers
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed"
          >
            Study smarter with previous exam papers. Access midterm, pre-board, and final papers shared by fellow BCSIT students across different affiliated colleges.
          </motion.p>

          {/* Quick Statistics Banner */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto pt-6"
          >
            {[
              { icon: FileText, label: 'Total Papers', value: papers.length },
              { icon: School, label: 'Colleges', value: colleges.length - 1 },
              { icon: Users, label: 'Contributors', value: '50+' },
              { icon: Download, label: 'Downloads', value: papers.reduce((sum, p) => sum + (p.downloads || 0), 0) },
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

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex justify-center pt-2"
          >
            <Button
              onClick={handleUploadClick}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8 py-3 rounded-xl shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/35 transition-all flex items-center gap-2 border-0"
            >
              <Upload className="w-4 h-4" />
              Upload Question Paper
            </Button>
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
              placeholder="Search by subject (e.g. Java, DBMS)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'date' | 'downloads' | 'name')}
              className="px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-semibold text-slate-700"
            >
              <option value="date">Latest Uploads</option>
              <option value="downloads">Most Downloaded</option>
              <option value="name">Subject A-Z</option>
            </select>

            <div className="flex bg-slate-100 rounded-xl p-1 border border-slate-200/40">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === 'grid' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'
                }`}
                aria-label="Grid View"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === 'list' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'
                }`}
                aria-label="List View"
              >
                <List className="w-4 h-4" />
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 mt-4 border-t border-slate-100">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Semester</label>
                  <select
                    value={selectedSemester}
                    onChange={(e) => setSelectedSemester(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-slate-800"
                  >
                    <option value="">All Semesters</option>
                    {semesters.map((sem) => (
                      <option key={sem.value} value={sem.value}>
                        {sem.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Exam Type</label>
                  <select
                    value={selectedExamType}
                    onChange={(e) => setSelectedExamType(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-slate-800"
                  >
                    <option value="">All Exams</option>
                    {examTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">College Origin</label>
                  <select
                    value={selectedCollege}
                    onChange={(e) => setSelectedCollege(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-slate-800"
                  >
                    <option value="">All Colleges</option>
                    {colleges.map((college) => (
                      <option key={college.value} value={college.value}>
                        {college.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {(selectedSemester || selectedExamType || selectedCollege) && (
                <div className="flex justify-end pt-3">
                  <Button
                    variant="outline"
                    onClick={handleResetFilters}
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

      {/* Main Papers Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        
        {/* Localized Loading Skeleten Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse bg-white border border-slate-100 rounded-2xl p-6 space-y-4 shadow-sm text-left">
                <div className="space-y-2">
                  <div className="h-4 bg-slate-100 rounded w-3/4"></div>
                  <div className="h-3 bg-slate-100 rounded w-1/2"></div>
                </div>
                <div className="h-10 bg-slate-50 rounded-xl w-full mt-6"></div>
              </div>
            ))}
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage + '-' + sortBy}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start'
                  : 'space-y-4 max-w-4xl mx-auto'
              }
            >
              {currentPapers.map((paper, idx) => (
                <motion.div
                  key={paper.objectId || idx}
                  variants={itemVariants}
                  className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-indigo-150 transition-all duration-300 overflow-hidden flex flex-col h-full text-left"
                >
                  {/* Paper Header */}
                  <div className="p-6 border-b border-slate-150/40 bg-gradient-to-b from-slate-50/50 to-transparent flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-2 flex-1">
                        <span className={`inline-block text-[9px] font-bold px-2.5 py-0.5 rounded-full border ${getExamTypeColor(paper.examType)}`}>
                          {paper.examType ? paper.examType.toUpperCase() : 'EXAM'}
                        </span>
                        
                        <h3 className="text-sm font-bold text-slate-800 line-clamp-2">
                          {paper.title}
                        </h3>

                        <div className="flex items-center space-x-1 text-[10px] text-slate-400 font-semibold">
                          <School className="w-3.5 h-3.5 flex-shrink-0" />
                          <span className="truncate">{paper.college}</span>
                        </div>
                      </div>

                      <div className="flex flex-col items-end space-y-1.5 flex-shrink-0">
                        <span className="inline-block px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-100/40 text-[10px] font-bold text-indigo-650">
                          Sem {paper.semester}
                        </span>

                        {!paper.approved && (
                          <span className="inline-block px-2 py-0.5 rounded-md bg-amber-50 border border-amber-100 text-[8px] font-bold text-amber-600">
                            {user?.objectId === paper.ownerId ? 'Your Draft' : 'Pending'}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-[10px] font-bold text-indigo-600 mt-3.5 flex items-center">
                      <FileText className="w-3.5 h-3.5 mr-1" />
                      <span>Subject: {paper.subject}</span>
                    </div>
                  </div>

                  {/* Paper Footer Card Content */}
                  <div className="p-5 bg-slate-50/40 border-t border-slate-100/60 flex flex-col justify-end space-y-4">
                    <div className="flex items-center justify-between text-[10px] text-slate-405 font-semibold">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{new Date(paper.uploadedAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <Download className="w-3.5 h-3.5" />
                        <span>{paper.downloads || 0} Downloads</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-100/60 pt-3 text-[10px]">
                      <span className="font-semibold text-slate-500">By: {paper.uploadedBy}</span>
                      
                      <div className="flex-shrink-0">
                        {paper.approved ? (
                          <Button
                            variant="primary"
                            className="text-[10px] font-bold px-4 py-2 rounded-xl"
                            onClick={() => handleDownload(paper)}
                          >
                            <Download className="w-3.5 h-3.5 mr-1.5" />
                            Download
                          </Button>
                        ) : user?.role === 'admin' ? (
                          <div className="flex space-x-1">
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-[9px] font-bold px-2 py-1.5 hover:bg-emerald-50 hover:text-emerald-700 border-slate-200"
                              onClick={() => paper.objectId && handleApprove(paper.objectId)}
                            >
                              Approve
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-[9px] font-bold px-2 py-1.5 hover:bg-rose-50 hover:text-rose-700 border-slate-200"
                              onClick={() => paper.objectId && handleReject(paper.objectId)}
                            >
                              Reject
                            </Button>
                          </div>
                        ) : (
                          <span className="text-slate-400 font-bold flex items-center space-x-1">
                            <Clock className="w-3.5 h-3.5" />
                            <span>Awaiting Approval</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        )}

        {/* Empty State */}
        {filteredPapers.length === 0 && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20 bg-white border border-slate-100 rounded-3xl p-8 max-w-lg mx-auto"
          >
            <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-100">
              <FileText className="w-6 h-6 text-slate-400" />
            </div>
            <h3 className="text-base font-bold text-slate-800 mb-1">No question papers found</h3>
            <p className="text-xs text-slate-500 mb-6 leading-relaxed">
              No matching previous question papers are currently uploaded. Be the first contributor to share notes with your friends!
            </p>
            {(selectedSemester || selectedExamType || selectedCollege) && (
              <Button
                variant="outline"
                className="mb-4 text-xs font-bold border-slate-200 px-4 py-2 mr-2"
                onClick={handleResetFilters}
              >
                Clear Filters
              </Button>
            )}
            <Button
              onClick={handleUploadClick}
              className="bg-indigo-650 hover:bg-indigo-700 text-white font-bold text-xs px-6 py-2 rounded-xl border-0 shadow-md shadow-indigo-150"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Upload Now
            </Button>
          </motion.div>
        )}

        {/* Pagination Buttons */}
        {totalPages > 1 && !loading && (
          <motion.div
            className="flex justify-center items-center space-x-1.5 mt-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Button
              variant="outline"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 border-slate-200 text-slate-700 text-xs rounded-xl"
            >
              Previous
            </Button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? 'primary' : 'outline'}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-2 min-w-[36px] text-xs rounded-xl border-slate-200 font-bold ${
                  currentPage === page ? '' : 'text-slate-600 hover:bg-indigo-50/50 hover:text-indigo-700'
                }`}
              >
                {page}
              </Button>
            ))}

            <Button
              variant="outline"
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-2 border-slate-200 text-slate-700 text-xs rounded-xl"
            >
              Next
            </Button>
          </motion.div>
        )}

      </main>

      {/* Upload Modal Drawer */}
      <AnimatePresence>
        {showUploadModal && (
          <UploadPaperModal
            onClose={() => setShowUploadModal(false)}
            user={user || {}}
            onUploadSuccess={(newPaper) => {
              setPapers((prev) => [newPaper, ...prev]);
              handleResetFilters();
            }}
          />
        )}
      </AnimatePresence>

      {/* Auth Gate Redirect Modal */}
      <LoginRedirectModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        message={loginModalMessage}
      />

    </div>
  );
}