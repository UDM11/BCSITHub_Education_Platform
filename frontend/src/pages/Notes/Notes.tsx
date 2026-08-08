import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Download,
  Star,
  Users,
  Search,
  Grid,
  List,
  ChevronRight,
  Clock,
  FileText,
} from 'lucide-react';
import { useSEO } from '../../hooks/useSEO';
import { semestersData } from '../../data/notesData';

const semesterColors = [
  'from-blue-600 to-cyan-600',       // 1st
  'from-emerald-600 to-teal-600',    // 2nd
  'from-purple-600 to-indigo-600',   // 3rd
  'from-pink-600 to-rose-600',       // 4th
  'from-orange-600 to-red-600',      // 5th
  'from-yellow-600 to-orange-600',   // 6th
  'from-green-600 to-emerald-600',   // 7th
  'from-violet-600 to-purple-600',   // 8th
];

const semesterNotesCount = [41, 40, 40, 41, 35, 33, 28, 22];

const semesters = semestersData.map((sem, index) => ({
  value: sem.id.toString(),
  label: sem.name,
  subjects: sem.subjects.length,
  notes: semesterNotesCount[index] || 20,
  available: sem.id <= 4,
  color: semesterColors[index] || 'from-indigo-600 to-violet-600',
  subjectList: sem.subjects.map(sub => sub.courseName),
}));




export function Notes() {
  useSEO({
    title: "Pokhara University BCSIT Lecture Notes & Study Materials",
    description: "Access official Pokhara University BCSIT lecture notes, chapter study guides, course syllabus indices, and solved past questions for semesters 1st to 8th.",
    keywords: "bcsit notes, pokhara university bcsit notes, pu computer science lecture notes, bcsithub study resources, bcsit 1st sem notes, bcsit 3rd sem notes, bcsit subject guides, download bcsit chapter notes",
    image: "https://bcsithub.lovestoblog.com/logo.png"
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeFilter, setActiveFilter] = useState<'all' | 'available' | 'coming-soon'>('all');
  const [expandedSemester, setExpandedSemester] = useState<string | null>(null);

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

  const filteredSemesters = semesters.filter((sem) => {
    const matchesFilter =
      activeFilter === 'all' ||
      (activeFilter === 'available' && sem.available) ||
      (activeFilter === 'coming-soon' && !sem.available);

    const matchesSearch =
      !searchTerm ||
      sem.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sem.value.includes(searchTerm);

    return matchesFilter && matchesSearch;
  });

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
            BCSIT Chapter Notes
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed"
          >
            Access comprehensive, study-ready notes prepared specifically for Pokhara University's BCSIT courses. Download resources, track subjects, and study offline.
          </motion.p>

        </div>
      </section>

      {/* Sticky Interactive Dashboard Controls */}
      <section className="sticky top-16 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200/60 py-4 px-4 shadow-sm">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          
          {/* Advanced Tab Pill Selector */}
          <div className="flex bg-slate-100 rounded-xl p-1 border border-slate-200/40 relative">
            {[
              { key: 'all', label: 'All Semesters' },
              { key: 'available', label: 'Available' },
              { key: 'coming-soon', label: 'Coming Soon' },
            ].map((filter) => {
              const isActive = activeFilter === filter.key;
              return (
                <button
                  key={filter.key}
                  onClick={() => {
                    setActiveFilter(filter.key as any);
                    setExpandedSemester(null);
                  }}
                  className={`relative px-4 py-2.5 rounded-lg text-xs font-bold transition-colors z-10 uppercase tracking-wider ${
                    isActive ? 'text-indigo-600' : 'text-slate-505 hover:text-slate-800'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeFilterBackground"
                      className="absolute inset-0 bg-white shadow-sm rounded-lg border border-slate-200/20"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                  <span className="relative z-20">{filter.label}</span>
                </button>
              );
            })}
          </div>

          {/* Search Inputs & View Mode Layout Toggles */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-80">
              <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search subjects, codes, or semesters..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2.5 w-full border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all bg-white text-slate-800 placeholder:text-slate-400"
              />

              {/* Autocomplete Dropdown Search Box */}
              {searchTerm && (
                (() => {
                  const matchedSubjects = semestersData.flatMap(sem => 
                    sem.subjects.map(sub => ({ ...sub, semesterId: sem.id }))
                  ).filter(sub => 
                    sub.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    sub.courseCode.toLowerCase().includes(searchTerm.toLowerCase())
                  ).slice(0, 5);

                  if (matchedSubjects.length === 0) return null;

                  return (
                    <div className="absolute top-full left-0 w-full mt-2 bg-white border border-slate-200 rounded-2xl shadow-xl max-h-60 overflow-y-auto z-[100] p-1.5 divide-y divide-slate-100 text-left">
                      {matchedSubjects.map((sub) => (
                        <Link
                          key={sub.courseCode || sub.courseName}
                          to={`/notes/semester/${sub.semesterId}/subject/${encodeURIComponent(sub.courseCode || sub.courseName)}`}
                          className="flex items-center justify-between px-3 py-2 hover:bg-indigo-50/50 rounded-xl transition-all cursor-pointer group"
                        >
                          <div className="flex flex-col min-w-0">
                            <span className="text-xs font-semibold text-slate-700 group-hover:text-indigo-600 transition-colors truncate">
                              {sub.courseName}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {sub.courseCode || 'Core'} • Semester {sub.semesterId}
                            </span>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 text-slate-450 group-hover:text-indigo-500 transition-all transform group-hover:translate-x-0.5" />
                        </Link>
                      ))}
                    </div>
                  );
                })()
              )}
            </div>

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
      </section>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        
        {/* Search Results Filter Banner */}
        {searchTerm && (
          <motion.div
            className="mb-8 p-4 bg-indigo-50/50 border border-indigo-100/50 rounded-2xl flex items-center space-x-3 text-left"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 flex-shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <p className="text-indigo-800 text-xs font-semibold">
              Filter results for "{searchTerm}": Found{' '}
              <span className="text-indigo-600 underline">
                {filteredSemesters.length}
              </span>{' '}
              semester(s) matching your request.
            </p>
          </motion.div>
        )}

        {/* Semester Cards List/Grid Wrapper */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start'
              : 'space-y-4 max-w-4xl mx-auto'
          }
        >
          {filteredSemesters.map((sem) => {
            const isExpanded = expandedSemester === sem.value;
            return (
              <motion.div
                key={sem.value}
                variants={itemVariants}
                className="bg-white rounded-2xl border border-slate-100/80 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
              >
                {/* Visual Accent Bar */}
                <div className={`h-1.5 bg-gradient-to-r ${sem.color}`} />

                {sem.available ? (
                  /* Available Semester Card */
                  <Link to={`/notes/semester/${sem.value}`} className="block p-6 text-left group">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-11 h-11 bg-gradient-to-tr ${sem.color} rounded-xl flex items-center justify-center text-white font-bold text-base shadow-md`}>
                        {sem.value}
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <span className="px-2.5 py-0.5 bg-emerald-50 border border-emerald-100 text-emerald-600 text-[10px] font-bold rounded-full">
                          Available
                        </span>
                        <div className="w-7 h-7 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400 group-hover:text-indigo-600 group-hover:bg-indigo-50/50 transition-all">
                          <ChevronRight className="w-4 h-4" />
                        </div>
                      </div>
                    </div>

                    <h3 className="text-base font-bold text-slate-800 mb-1 group-hover:text-indigo-600 transition-colors">
                      {sem.label}
                    </h3>
                    <p className="text-[11px] text-slate-500 font-medium leading-relaxed mb-4">
                      Comprehensive lecture notes, reference PDFs, and solved papers.
                    </p>

                    <div className="flex items-center space-x-3.5 pt-3 border-t border-slate-100/60 text-slate-500 text-[10px] font-bold">
                      <div className="flex items-center space-x-1">
                        <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                        <span>{sem.subjects} Subjects</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <FileText className="w-3.5 h-3.5 text-slate-400" />
                        <span>{sem.notes} Lecture Notes</span>
                      </div>
                    </div>
                  </Link>
                ) : (
                  /* Coming Soon Semester Card */
                  <div className="text-left">
                    <div
                      onClick={() => setExpandedSemester(isExpanded ? null : sem.value)}
                      className="p-6 cursor-pointer group"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className={`w-11 h-11 bg-gradient-to-tr ${sem.color} rounded-xl flex items-center justify-center text-white font-bold text-base opacity-75 shadow-sm`}>
                          {sem.value}
                        </div>
                        <div className="flex items-center space-x-1.5">
                          <span className="px-2.5 py-0.5 bg-amber-50 border border-amber-100 text-amber-600 text-[10px] font-bold rounded-full">
                            Coming Soon
                          </span>
                          <div className={`w-7 h-7 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400 transition-transform duration-300 ${
                            isExpanded ? 'rotate-90 text-indigo-600 bg-indigo-50/50' : ''
                          }`}>
                            <ChevronRight className="w-4 h-4" />
                          </div>
                        </div>
                      </div>

                      <h3 className="text-base font-bold text-slate-700 mb-1">{sem.label}</h3>
                      <p className="text-[11px] text-slate-500 font-medium leading-relaxed mb-4">
                        Curriculum structure is mapped. Lecture notes are being prepared.
                      </p>

                      <div className="flex items-center space-x-3.5 pt-3 border-t border-slate-100/60 text-slate-500 text-[10px] font-semibold">
                        <div className="flex items-center space-x-1">
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>{sem.subjects} Subjects Mapped</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span>In Preparation</span>
                        </div>
                      </div>
                    </div>

                    {/* Expandable Coming Soon Subjects Accordion */}
                    <AnimatePresence initial={false}>
                      {isExpanded && sem.subjectList && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.25, ease: 'easeInOut' }}
                          className="overflow-hidden border-t border-slate-100/60 bg-slate-50/30"
                        >
                          <div className="p-5 space-y-2">
                            <h4 className="text-[10px] font-bold uppercase text-slate-500 tracking-wider mb-2">
                              Mapped Semester Course List:
                            </h4>
                            {sem.subjectList.map((subject, idx) => (
                              <motion.div
                                key={idx}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.03 }}
                                className="flex items-center p-2.5 bg-white rounded-xl border border-slate-100 shadow-sm hover:border-indigo-100/50 transition-colors"
                              >
                                <div className="w-6 h-6 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500 text-[10px] font-bold mr-2.5">
                                  {idx + 1}
                                </div>
                                <span className="text-xs font-semibold text-slate-700">{subject}</span>
                                <span className="ml-auto px-2 py-0.5 bg-amber-50 border border-amber-100/60 text-amber-600 text-[8px] font-bold rounded-md">
                                  Drafting
                                </span>
                              </motion.div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </motion.div>
            );
          })}
        </motion.div>
      </main>

    </div>
  );
}
