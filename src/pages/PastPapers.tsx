import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, Download, Calendar, School, FileText,
  Filter, Plus, Search, Eye, Star, TrendingUp, Users, Clock, BookOpen, Award, ChevronRight, Grid, List, SortAsc, X
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { UploadPaperModal } from '../components/Notes/UploadPaperModal';
import Backendless from 'backendless';
import LoginRedirectModal from '../components/common/LoginRedirectModal';

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
  { value: 'Other', label: 'Other College' }
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

        let queryBuilder = Backendless.DataQueryBuilder.create();
        queryBuilder.setSortBy(['uploadedAt DESC']);
        queryBuilder.setPageSize(50);

        if (selectedSemester) {
          queryBuilder.setWhereClause(`semester = ${selectedSemester}`);
        }

        if (selectedExamType) {
          const existingWhere = queryBuilder.getWhereClause();
          queryBuilder.setWhereClause(
            existingWhere
              ? `${existingWhere} AND examType = '${selectedExamType}'`
              : `examType = '${selectedExamType}'`
          );
        }

        if (selectedCollege) {
          const existingWhere = queryBuilder.getWhereClause();
          queryBuilder.setWhereClause(
            existingWhere
              ? `${existingWhere} AND college = '${selectedCollege}'`
              : `college = '${selectedCollege}'`
          );
        }

        const result = await Backendless.Data.of('PastPapers').find<Paper>(queryBuilder);
        setPapers(result);
      } catch (error) {
        console.error("Error fetching papers:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPapers();
  }, [selectedSemester, selectedExamType, selectedCollege]);

  const filteredPapers = papers.filter(paper => {
    if (searchQuery && !paper.subject.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return paper.approved || (user?.role === 'admin') || (user?.objectId === paper.ownerId);
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredPapers.length / papersPerPage);
  const startIndex = (currentPage - 1) * papersPerPage;
  const endIndex = startIndex + papersPerPage;
  const currentPapers = filteredPapers.slice(startIndex, endIndex);

  // Reset to first page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [selectedSemester, selectedExamType, selectedCollege, searchQuery]);

  const getExamTypeColor = (type: string) => {
    switch (type) {
      case 'midterm': return 'text-blue-600 bg-blue-100';
      case 'pre-board': return 'text-yellow-600 bg-yellow-100';
      case 'final': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const handleDownload = async (paper: Paper) => {
    if (!user) {
      setLoginModalMessage("Please login or signup to download papers.");
      setShowLoginModal(true);
      return;
    }
    
    try {
      window.open(paper.fileUrl, '_blank');
      
      await Backendless.Data.of('PastPapers').save<Paper>({
        objectId: paper.objectId,
        downloads: (paper.downloads || 0) + 1
      });
      
      setPapers(prev => prev.map(p => 
        p.objectId === paper.objectId 
          ? { ...p, downloads: (p.downloads || 0) + 1 } 
          : p
      ));
    } catch (error) {
      console.error("Error updating download count:", error);
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
      setLoginModalMessage("Please login or signup to upload papers.");
      setShowLoginModal(true);
      return;
    }
    setShowUploadModal(true);
  };

  const handleApprove = async (paperId: string) => {
    try {
      await Backendless.Data.of('PastPapers').save<Paper>({
        objectId: paperId,
        approved: true
      });
      setPapers((prev) => prev.map(p => p.objectId === paperId ? { ...p, approved: true } : p));
    } catch (error) {
      alert('Failed to approve paper.');
    }
  };

  const handleReject = async (paperId: string) => {
    if (!window.confirm('Are you sure you want to reject and delete this paper?')) return;
    try {
      await Backendless.Data.of('PastPapers').remove(`objectId = '${paperId}'`);
      setPapers((prev) => prev.filter(p => p.objectId !== paperId));
    } catch (error) {
      alert('Failed to reject paper.');
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
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Loading Past Papers</h3>
            <p className="text-gray-500">Preparing your study resources...</p>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
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
              <FileText className="w-5 h-5 text-yellow-300 mr-2" />
              <span className="text-sm font-semibold text-yellow-50">Resource Library</span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 leading-tight bg-gradient-to-r from-white via-slate-100 to-indigo-100 bg-clip-text text-transparent">
              Past Question Papers
            </h1>
            <p className="text-lg sm:text-xl text-indigo-100 mb-10 max-w-3xl mx-auto px-4 sm:px-0">
              Access and share previous exam papers from different semesters and colleges, tailored to PU.
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
              { icon: FileText, label: 'Total Papers', value: papers.length },
              { icon: School, label: 'Colleges', value: colleges.length },
              { icon: Users, label: 'Contributors', value: '50+' },
              { icon: Download, label: 'Downloads', value: papers.reduce((sum, p) => sum + (p.downloads || 0), 0) }
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

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="flex justify-center"
          >
            <Button 
              onClick={handleUploadClick} 
              className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 hover:brightness-110 text-white font-bold px-10 py-3.5 rounded-xl shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30 transition-all duration-300 border-0 w-full sm:w-auto flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Upload Paper
            </Button>
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
                  placeholder="Search by subject..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
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
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all duration-300 font-semibold text-slate-700"
              >
                <option value="date">Latest</option>
                <option value="downloads">Most Downloaded</option>
                <option value="name">Name</option>
              </select>
              
              <div className="flex bg-slate-100 rounded-xl p-1 border border-slate-200/40">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-all duration-200 ${viewMode === 'grid' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-all duration-200 ${viewMode === 'list' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  <List className="w-4 h-4" />
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Semester</label>
                    <select
                      value={selectedSemester}
                      onChange={(e) => setSelectedSemester(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all duration-300 text-slate-800"
                    >
                      <option value="">All Semesters</option>
                      {semesters.map((semester) => (
                        <option key={semester.value} value={semester.value}>
                          {semester.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Exam Type</label>
                    <select
                      value={selectedExamType}
                      onChange={(e) => setSelectedExamType(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all duration-300 text-slate-800"
                    >
                      <option value="">All Types</option>
                      {examTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">College</label>
                    <select
                      value={selectedCollege}
                      onChange={(e) => setSelectedCollege(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all duration-300 text-slate-800"
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
                  <div className="mt-4 flex justify-end">
                    <Button variant="outline" onClick={handleResetFilters} className="text-xs border-slate-200 font-semibold">
                      Clear Filters
                    </Button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.section>

        {/* Papers Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}
        >
          <AnimatePresence>
            {currentPapers.map((paper, index) => (
              <motion.div
                key={paper.objectId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4, delay: 0.05 * index }}
                whileHover={{ y: -5 }}
                className="cursor-pointer group h-full"
              >
                <Card hover={false} className="h-full bg-white rounded-2xl border border-slate-100 shadow-premium group-hover:shadow-premium-hover hover:border-indigo-500/10 transition-all duration-300 flex flex-col justify-between overflow-hidden">
                  <CardHeader className="pb-4 border-b border-slate-100/50 bg-gradient-to-br from-slate-50 to-indigo-50/20">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-slate-800 mb-2 line-clamp-2">{paper.title}</h3>
                        <div className="flex items-center space-x-2 text-xs text-slate-500 font-semibold mb-2">
                          <School className="w-3.5 h-3.5 text-slate-400" />
                          <span className="truncate">{paper.college}</span>
                        </div>
                        <div className="text-xs font-bold text-indigo-600">Subject: {paper.subject}</div>
                      </div>
                      <div className="flex flex-col items-end space-y-1.5 ml-4 flex-shrink-0">
                        <div className="bg-indigo-50 text-indigo-600 border border-indigo-100/50 px-2.5 py-1 rounded-full text-xs font-bold">
                          Sem {paper.semester}
                        </div>
                        <div className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getExamTypeColor(paper.examType)}`}>
                          {paper.examType ? paper.examType.charAt(0).toUpperCase() + paper.examType.slice(1) : 'Unknown'}
                        </div>
                        {!paper.approved && (
                          <div className="bg-amber-50 text-amber-600 border border-amber-200/50 px-2.5 py-1 rounded-full text-xs font-semibold">
                            {user?.objectId === paper.ownerId ? 'Your Upload' : 'Pending'}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="p-6 flex-1 flex flex-col justify-between">
                    <div className="space-y-3 text-xs font-semibold text-slate-500 mb-6">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span>Uploaded {new Date(paper.uploadedAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center justify-between border-t border-slate-50 pt-3">
                        <span className="font-semibold text-slate-600">By: {paper.uploadedBy}</span>
                        <div className="flex items-center space-x-1">
                          <Download className="w-3.5 h-3.5 text-slate-400" />
                          <span>{paper.downloads || 0}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      {paper.approved ? (
                        <Button 
                          variant="primary"
                          className="w-full text-sm font-semibold" 
                          onClick={() => handleDownload(paper)}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download Paper
                        </Button>
                      ) : user?.role === 'admin' ? (
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 font-semibold border-slate-200 rounded-xl" 
                            onClick={() => paper.objectId && handleApprove(paper.objectId)}
                          >
                            Approve
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 font-semibold border-slate-200 rounded-xl" 
                            onClick={() => paper.objectId && handleReject(paper.objectId)}
                          >
                            Reject
                          </Button>
                        </div>
                      ) : user?.objectId === paper.ownerId ? (
                        <Button variant="ghost" className="w-full text-xs font-bold text-slate-400" disabled>
                          <Clock className="w-4 h-4 mr-2" />
                          Waiting for Approval
                        </Button>
                      ) : (
                        <Button variant="ghost" className="w-full text-xs font-bold text-slate-400" disabled>
                          <Clock className="w-4 h-4 mr-2" />
                          Pending Approval
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Pagination */}
        {totalPages > 1 && (
          <motion.div 
            className="flex justify-center items-center space-x-2 mt-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <Button
              variant="outline"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3.5 py-2 border-slate-200 text-slate-700"
            >
              Previous
            </Button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? "primary" : "outline"}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-2 min-w-[40px] rounded-xl border-slate-200 font-semibold ${
                  currentPage === page 
                    ? '' 
                    : 'text-slate-600 hover:bg-indigo-50/50 hover:text-indigo-700'
                }`}
              >
                {page}
              </Button>
            ))}
            
            <Button
              variant="outline"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3.5 py-2 border-slate-200 text-slate-700"
            >
              Next
            </Button>
          </motion.div>
        )}

        {/* Empty State */}
        {filteredPapers.length === 0 && !loading && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            transition={{ duration: 0.4 }} 
            className="text-center py-16"
          >
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">No papers found</h3>
            <p className="text-slate-600 mb-6 text-sm">Try adjusting your filters or be the first to upload a paper!</p>
            {(selectedSemester || selectedExamType || selectedCollege) && (
              <Button
                variant="outline"
                className="mb-4 text-xs font-semibold border-slate-200"
                onClick={handleResetFilters}
              >
                Clear Filters
              </Button>
            )}
            <Button
              onClick={handleUploadClick}
              className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 hover:brightness-110 text-white font-semibold"
            >
              <Plus className="w-4 h-4 mr-2" />
              Upload Paper
            </Button>
          </motion.div>
        )}

        {/* Upload Modal */}
        <AnimatePresence>
          {showUploadModal && (
            <UploadPaperModal
              onClose={() => setShowUploadModal(false)}
              user={user || {}}
              onUploadSuccess={(newPaper) => {
                setPapers(prev => [newPaper, ...prev]);
                setSelectedSemester('');
                setSelectedExamType('');
                setSelectedCollege('');
                setSearchQuery('');
              }}
            />
          )}
        </AnimatePresence>

        {/* Login Redirect Modal */}
        <LoginRedirectModal
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
          message={loginModalMessage}
        />
      </div>
    </div>
  );
}