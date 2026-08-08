import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GraduationCap,
  Clock,
  Award,
  ChevronDown,
  Search,
  Grid,
  List,
  Layers,
  BookMarked,
  Info,
  Download,
  BookOpen,
  X,
} from 'lucide-react';
import { semesterData, specializationData } from '../data/syllabusData';
import { useSEO } from '../hooks/useSEO';
import { PDFViewer } from '../components/common/PDFViewer';
import { Document, Page, pdfjs } from 'react-pdf';
// @ts-ignore
import syllabusPdf from './BCSITsyllabus.pdf';

const isV4 = pdfjs.version && pdfjs.version.split('.')[0] !== '3';
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.${isV4 ? 'mjs' : 'js'}`;

export function Syllabus() {
  useSEO({
    title: "Official Pokhara University BCSIT Syllabus & Credits",
    description: "Explore the complete 4-year Pokhara University BCSIT syllabus roadmap. View credit hours, core and elective subjects for all 8 semesters, browse specialization tracks, and download the official syllabus PDF.",
    keywords: "bcsit syllabus, pokhara university bcsit syllabus, pu bcsit syllabus, bcsit course structure, bcsit credit hours, pu syllabus pdf download, bcsit semesters, bcsit subjects list",
    image: "https://bcsithub.lovestoblog.com/logo.png"
  });

  const [expandedSemester, setExpandedSemester] = useState<string | null>(null);
  const [expandedSpecialization, setExpandedSpecialization] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeTab, setActiveTab] = useState<'semesters' | 'specializations'>('semesters');

  const [numPages, setNumPages] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setCurrentPage(1);
  }

  const [containerWidth, setContainerWidth] = useState<number>(800);
  const containerRef = useRef<HTMLDivElement>(null);

  // Measure container width for responsive page sizing
  useEffect(() => {
    if (!containerRef.current) return;
    
    const resizeObserver = new ResizeObserver((entries) => {
      if (entries.length > 0) {
        const width = entries[0].contentRect.width;
        setContainerWidth(width > 48 ? width - 32 : width);
      }
    });

    resizeObserver.observe(containerRef.current);
    
    // Set initial width
    const rect = containerRef.current.getBoundingClientRect();
    if (rect.width > 48) {
      setContainerWidth(rect.width - 32);
    }

    return () => resizeObserver.disconnect();
  }, []);

  const toggleItem = (id: string, type: 'semester' | 'specialization') => {
    if (type === 'semester') {
      setExpandedSemester((prev) => (prev === id ? null : id));
    } else {
      setExpandedSpecialization((prev) => (prev === id ? null : id));
    }
  };

  const getFilteredData = () => {
    if (!searchTerm) return { semesters: semesterData, specializations: specializationData };

    const filteredSemesters = Object.fromEntries(
      Object.entries(semesterData).filter(([, semester]) =>
        semester.courses.some(
          (course) =>
            course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            course.code?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    );

    const filteredSpecializations = Object.fromEntries(
      Object.entries(specializationData).filter(([, spec]) =>
        spec.courses.some((course) =>
          course.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    );

    return { semesters: filteredSemesters, specializations: filteredSpecializations };
  };

  const highlightText = (text: string, search: string) => {
    if (!search) return text;
    const regex = new RegExp(`(${search})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, index) =>
      regex.test(part) ? (
        <span key={index} className="bg-indigo-100 text-indigo-700 px-1 rounded font-semibold">
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  // Dynamically tags courses by their codes for extra styling context
  const getCourseCategory = (code?: string) => {
    if (!code) return { label: 'Specialization', bg: 'bg-teal-50 text-teal-600 border-teal-100/50' };
    const prefix = code.split(' ')[0];
    switch (prefix) {
      case 'ENG':
        return { label: 'Communication', bg: 'bg-sky-50 text-sky-600 border-sky-100/50' };
      case 'MTH':
      case 'STT':
      case 'RCH':
        return { label: 'Mathematics', bg: 'bg-rose-50 text-rose-600 border-rose-100/50' };
      case 'CMP':
      case 'PRJ':
      case 'PRI':
      case 'INT':
        return { label: 'Computer Science', bg: 'bg-indigo-50 text-indigo-600 border-indigo-100/50' };
      case 'MGT':
      case 'MKT':
      case 'ECO':
      case 'FIN':
      case 'LAW':
        return { label: 'Management & Law', bg: 'bg-amber-50 text-amber-600 border-amber-100/50' };
      default:
        return { label: 'Curriculum Core', bg: 'bg-slate-50 text-slate-600 border-slate-100/50' };
    }
  };

  const filtered = getFilteredData();

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
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent"
          >
            BCSIT Course Syllabus
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed"
          >
            Explore the complete 4-year curriculum roadmap. Choose semesters to view credit distributions or select specialized tracks to prepare for your tech career.
          </motion.p>

          {/* Quick Statistics Banner */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto pt-6"
          >
            {[
              { icon: Clock, label: '8 Semesters', sub: '4-Year Roadmap' },
              { icon: Award, label: '127+ Credits', sub: 'Academic Weight' },
              { icon: Layers, label: '5 Specializations', sub: 'Industry Tracks' },
            ].map((stat, idx) => (
              <div
                key={idx}
                className="flex items-center space-x-3.5 bg-slate-900/60 backdrop-blur-md border border-slate-800/80 rounded-2xl p-4 text-left"
              >
                <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-indigo-400">
                  <stat.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{stat.label}</p>
                  <p className="text-[10px] text-slate-500 font-medium">{stat.sub}</p>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Sticky Interactive Dashboard Controls */}
      <section className="sticky top-16 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200/60 py-4 px-4 shadow-sm">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">

          {/* Advanced Tab Pill Selector */}
          <div className="flex bg-slate-100 rounded-xl p-1 border border-slate-200/40 relative">
            {(['semesters', 'specializations'] as const).map((tab) => {
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveTab(tab);
                    setExpandedSemester(null);
                    setExpandedSpecialization(null);
                  }}
                  className={`relative px-5 py-2.5 rounded-lg text-xs font-bold transition-colors z-10 uppercase tracking-wider ${isActive ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-800'
                    }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTabBackground"
                      className="absolute inset-0 bg-white shadow-sm rounded-lg border border-slate-200/20"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                  <span className="relative z-20">{tab}</span>
                </button>
              );
            })}
          </div>

          {/* Search Inputs & View Mode Layout Toggles */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-72">
              <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search courses or codes (e.g. Java, CMP)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2.5 w-full border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all bg-white text-slate-800 placeholder:text-slate-400"
              />
            </div>

            <div className="flex bg-slate-100 rounded-xl p-1 border border-slate-200/40">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'
                  }`}
                aria-label="Grid View"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'
                  }`}
                aria-label="List View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Syllabus Content Area */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">

        {/* Search Results Filter Banner */}
        {searchTerm && (
          <motion.div
            className="mb-8 p-4 bg-indigo-50/50 border border-indigo-100/50 rounded-2xl flex items-center space-x-3.5 text-left"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 flex-shrink-0">
              <Info className="w-4 h-4" />
            </div>
            <p className="text-indigo-800 text-xs font-semibold">
              Filter results for "{searchTerm}": Found{' '}
              <span className="text-indigo-600 underline">
                {Object.keys(filtered.semesters).length}
              </span>{' '}
              semester(s) and{' '}
              <span className="text-indigo-600 underline">
                {Object.keys(filtered.specializations).length}
              </span>{' '}
              specialization tracks.
            </p>
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {activeTab === 'semesters' ? (

            /* Semester Block */
            <motion.div
              key="semesters"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, y: 10 }}
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start'
                  : 'space-y-4 max-w-4xl mx-auto'
              }
            >
              {Object.entries(filtered.semesters).map(([id, semester]) => {
                const isExpanded = expandedSemester === id;
                return (
                  <motion.div
                    key={id}
                    variants={itemVariants}
                    className={`bg-white rounded-2xl border transition-all duration-300 ${isExpanded
                        ? 'border-indigo-200 shadow-lg shadow-indigo-100/20'
                        : 'border-slate-100 hover:border-slate-200/80 shadow-sm'
                      }`}
                  >
                    {/* Semester Header Toggle Trigger */}
                    <div
                      onClick={() => toggleItem(id, 'semester')}
                      className={`cursor-pointer p-5 flex items-center justify-between rounded-t-2xl transition-colors ${isExpanded ? 'bg-indigo-50/20' : 'bg-transparent hover:bg-slate-50/50'
                        }`}
                    >
                      <div className="flex items-center space-x-3.5">
                        <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-md shadow-indigo-100">
                          {id}
                        </div>
                        <div className="text-left">
                          <h3 className="text-sm font-bold text-slate-800">{semester.title}</h3>
                          <p className="text-[10px] text-slate-400 font-semibold">
                            {semester.courses.length} Courses Required
                          </p>
                        </div>
                      </div>
                      <motion.div
                        animate={{ rotate: isExpanded ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${isExpanded ? 'bg-indigo-100/50 text-indigo-600' : 'text-slate-400'
                          }`}
                      >
                        <ChevronDown className="w-4 h-4" />
                      </motion.div>
                    </div>

                    {/* Expandable Course List Accoridon */}
                    <AnimatePresence initial={false}>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.25, ease: 'easeInOut' }}
                          className="overflow-hidden border-t border-slate-100/60"
                        >
                          <div className="p-5 space-y-2.5 bg-slate-50/30 text-left">
                            {semester.courses
                              .filter(
                                (course) =>
                                  !searchTerm ||
                                  course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                  course.code?.toLowerCase().includes(searchTerm.toLowerCase())
                              )
                              .map((course, idx) => {
                                const category = getCourseCategory(course.code);
                                return (
                                  <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.03 }}
                                    className="p-3 bg-white rounded-xl border border-slate-100 flex items-center justify-between gap-4 hover:border-indigo-100 transition-colors shadow-sm"
                                  >
                                    <div className="space-y-1">
                                      <span
                                        className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded-full border ${category.bg}`}
                                      >
                                        {category.label}
                                      </span>
                                      <p className="font-bold text-xs text-slate-800">
                                        {highlightText(course.name, searchTerm)}
                                      </p>
                                      {course.code && (
                                        <p className="text-[10px] text-slate-400 font-semibold flex items-center">
                                          <BookMarked className="w-3 h-3 mr-1" />
                                          {highlightText(course.code, searchTerm)}
                                        </p>
                                      )}
                                    </div>
                                    <span className="flex-shrink-0 text-[10px] font-bold px-2 py-1 rounded-lg bg-slate-100 text-slate-600 border border-slate-200/40">
                                      {course.credits} Credits
                                    </span>
                                  </motion.div>
                                );
                              })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </motion.div>
          ) : (

            /* Specializations Block */
            <motion.div
              key="specializations"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, y: 10 }}
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 md:grid-cols-2 gap-6 items-start'
                  : 'space-y-4 max-w-4xl mx-auto'
              }
            >
              {Object.entries(filtered.specializations).map(([id, spec]) => {
                const isExpanded = expandedSpecialization === id;
                return (
                  <motion.div
                    key={id}
                    variants={itemVariants}
                    className={`bg-white rounded-2xl border transition-all duration-300 ${isExpanded
                        ? 'border-emerald-200 shadow-lg shadow-emerald-100/10'
                        : 'border-slate-100 hover:border-slate-200/80 shadow-sm'
                      }`}
                  >
                    {/* Header Trigger */}
                    <div
                      onClick={() => toggleItem(id, 'specialization')}
                      className={`cursor-pointer p-5 flex items-center justify-between rounded-t-2xl transition-colors ${isExpanded ? 'bg-emerald-50/20' : 'bg-transparent hover:bg-slate-50/50'
                        }`}
                    >
                      <div className="flex items-center space-x-3.5">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-100">
                          <GraduationCap className="w-5 h-5" />
                        </div>
                        <div className="text-left">
                          <h3 className="text-sm font-bold text-slate-800">{spec.title}</h3>
                          <p className="text-[10px] text-slate-400 font-semibold">
                            {spec.courses.length} Specialized Electives
                          </p>
                        </div>
                      </div>
                      <motion.div
                        animate={{ rotate: isExpanded ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${isExpanded ? 'bg-emerald-100/50 text-emerald-600' : 'text-slate-400'
                          }`}
                      >
                        <ChevronDown className="w-4 h-4" />
                      </motion.div>
                    </div>

                    {/* Expandable accordion list */}
                    <AnimatePresence initial={false}>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.25, ease: 'easeInOut' }}
                          className="overflow-hidden border-t border-slate-100/60"
                        >
                          <div className="p-5 space-y-2.5 bg-slate-50/30 text-left">
                            {spec.courses
                              .filter(
                                (course) =>
                                  !searchTerm ||
                                  course.name.toLowerCase().includes(searchTerm.toLowerCase())
                              )
                              .map((course, idx) => (
                                <motion.div
                                  key={idx}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: idx * 0.03 }}
                                  className="p-3 bg-white rounded-xl border border-slate-100 flex items-center justify-between gap-4 hover:border-emerald-100 transition-colors shadow-sm"
                                >
                                  <div>
                                    <p className="font-bold text-xs text-slate-800">
                                      {highlightText(course.name, searchTerm)}
                                    </p>
                                    <span className="inline-block text-[9px] font-bold px-2 py-0.5 rounded-full border bg-emerald-50 text-emerald-600 border-emerald-100/50 mt-1">
                                      Elective Track
                                    </span>
                                  </div>
                                  <span className="flex-shrink-0 text-[10px] font-bold px-2 py-1 rounded-lg bg-slate-100 text-slate-600 border border-slate-200/40">
                                    {course.credits} Credits
                                  </span>
                                </motion.div>
                              ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Inline PDF Viewer Section below semesters/specializations */}
        <div className="mt-16 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-t border-slate-200 pt-8 gap-4">
            <div className="text-left">
              <h2 className="text-lg sm:text-xl font-bold text-slate-800 flex items-center">
                <BookMarked className="w-5 h-5 mr-2 text-indigo-600" />
                Official Pokhara University Syllabus Document
              </h2>
              <p className="text-xs text-slate-400 mt-1">Browse through the full official syllabus pages below.</p>
            </div>
            
            <a
              href="/BCSITsyllabus.pdf"
              download="PU-BCSIT-Syllabus.pdf"
              className="inline-flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-5 py-2.5 rounded-xl shadow-lg shadow-indigo-600/20 transition-all cursor-pointer flex-shrink-0"
            >
              <Download className="w-4 h-4" />
              <span>Download Full PDF</span>
            </a>
          </div>

          <div 
            ref={containerRef}
            className="bg-white border border-slate-200/80 shadow-md rounded-3xl p-4 md:p-8 flex flex-col items-center justify-center"
          >
            <Document
              file={syllabusPdf}
              onLoadSuccess={onDocumentLoadSuccess}
              loading={
                <div className="flex items-center justify-center py-12">
                  <span className="text-xs text-slate-500 font-semibold">Loading syllabus pages...</span>
                </div>
              }
            >
              <div className="border border-slate-100 shadow-sm rounded-2xl overflow-hidden flex justify-center max-w-full">
                <Page 
                  pageNumber={currentPage} 
                  width={containerWidth} 
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                />
              </div>
            </Document>

            {/* Pagination Controls directly on page */}
            {numPages && (
              <div className="flex items-center justify-center space-x-6 pt-6 w-full">
                <button
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 disabled:opacity-50 text-xs font-bold transition-all shadow-sm flex items-center space-x-1"
                >
                  <span>Previous Page</span>
                </button>
                <span className="text-xs font-semibold text-slate-600">
                  Page {currentPage} of {numPages}
                </span>
                <button
                  disabled={currentPage >= numPages}
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, numPages))}
                  className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 disabled:opacity-50 text-xs font-bold transition-all shadow-sm flex items-center space-x-1"
                >
                  <span>Next Page</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

    </div>
  );
}