import React, { useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { semestersData } from '../../data/notesData';
import { motion } from 'framer-motion';
import {
  BookOpen,
  ChevronLeft,
  Search,
  Grid,
  List,
  Star,
  Award,
  TrendingUp,
  ChevronRight,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';

export default function SemesterSubjects() {
  const { semesterId } = useParams();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterType, setFilterType] = useState<'all' | 'available' | 'coming-soon'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'credits' | 'popularity'>('name');

  const semester = useMemo(() => {
    const foundSemester = semestersData.find((sem) => sem.id === Number(semesterId));
    if (!foundSemester) return null;

    // Enhance subjects with statistics
    const enhancedSubjects = foundSemester.subjects.map((subject, index) => ({
      ...subject,
      popularity: 350 + ((index * 45) % 300),
      downloads: 120 + ((index * 23) % 200),
      rating: (4.2 + ((index * 0.17) % 0.8)).toFixed(1),
      lastUpdated: ((index * 3) % 28) + 1,
      estimatedHours: 25 + ((index * 4) % 15),
    }));

    return { ...foundSemester, subjects: enhancedSubjects };
  }, [semesterId]);

  const getCourseCategory = (code?: string) => {
    if (!code) return { label: 'Elective', bg: 'bg-teal-50 text-teal-600 border-teal-100/50' };
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

  const filteredSubjects = useMemo(() => {
    if (!semester) return [];

    const filtered = semester.subjects.filter((subject) => {
      const matchesSearch =
        !searchTerm ||
        subject.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        subject.courseCode.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesFilter =
        filterType === 'all' ||
        (filterType === 'available' && subject.available !== false) ||
        (filterType === 'coming-soon' && subject.available === false);

      return matchesSearch && matchesFilter;
    });

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'credits':
          return b.credits - a.credits;
        case 'popularity':
          return b.popularity - a.popularity;
        default:
          return a.courseName.localeCompare(b.courseName);
      }
    });
  }, [semester, searchTerm, filterType, sortBy]);

  const stats = useMemo(() => {
    if (!semester) return { total: 0, available: 0, totalCredits: 0, avgRating: '0.0' };

    const total = semester.subjects.length;
    const available = semester.subjects.filter((s) => s.available !== false).length;
    const totalCredits = semester.subjects.reduce((sum, s) => sum + s.credits, 0);
    const avgRating =
      semester.subjects.reduce((sum, s) => sum + parseFloat(s.rating || '0'), 0) / total;

    return { total, available, totalCredits, avgRating: avgRating.toFixed(1) };
  }, [semester]);

  if (!semester) {
    return (
      <div className="min-h-screen bg-slate-50/50 flex items-center justify-center">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="w-16 h-16 bg-rose-50 border border-rose-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-rose-600">
            <BookOpen className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Semester Not Found</h2>
          <p className="text-slate-500 mb-6">The requested semester could not be found.</p>
          <Button onClick={() => navigate('/notes')} className="bg-indigo-650 hover:bg-indigo-700 text-white font-bold border-0 px-6 py-2.5 rounded-xl shadow-md">
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back to Semesters
          </Button>
        </motion.div>
      </div>
    );
  }

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
      <section className="relative bg-slate-950 text-white py-20 px-4 overflow-hidden">
        {/* Soft Glowing Background Orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-1/4 w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 right-1/4 w-[350px] h-[350px] bg-purple-600/10 rounded-full blur-[120px]" />
        </div>

        <div className="relative max-w-6xl mx-auto z-10 space-y-6">
          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="flex justify-start mb-4"
          >
            <Button
              variant="outline"
              onClick={() => navigate('/notes')}
              className="text-slate-300 hover:text-white border-slate-800 hover:bg-slate-900 bg-slate-900/60 backdrop-blur-md text-xs font-bold px-4 py-2 rounded-xl"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back to Semesters
            </Button>
          </motion.div>

          <div className="text-center space-y-4">
            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent"
            >
              {semester.name}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed"
            >
              Explore and access high-quality study notes, course details, and practice resources mapped for {semester.name} subjects.
            </motion.p>

            {/* Quick Statistics Banner */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto pt-6"
            >
              {[
                { icon: BookOpen, label: 'Total Subjects', value: stats.total },
                { icon: Award, label: 'Available Notes', value: stats.available },
                { icon: Star, label: 'Total Credits', value: stats.totalCredits },
                { icon: TrendingUp, label: 'Avg Rating', value: stats.avgRating },
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
          </div>
        </div>
      </section>

      {/* Sticky Interactive Dashboard Controls */}
      <section className="sticky top-16 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200/60 py-4 px-4 shadow-sm">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          
          {/* Advanced Tab Pill Selector */}
          <div className="flex bg-slate-100 rounded-xl p-1 border border-slate-200/40 relative w-full md:w-auto">
            {[
              { key: 'all', label: 'All Subjects' },
              { key: 'available', label: 'Available' },
              { key: 'coming-soon', label: 'Coming Soon' },
            ].map((filter) => {
              const isActive = filterType === filter.key;
              return (
                <button
                  key={filter.key}
                  onClick={() => setFilterType(filter.key as 'all' | 'available' | 'coming-soon')}
                  className={`flex-1 md:flex-none relative px-4 py-2.5 rounded-lg text-xs font-bold transition-colors z-10 uppercase tracking-wider ${
                    isActive ? 'text-indigo-650' : 'text-slate-505 hover:text-slate-800'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeSubjectFilterBackground"
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
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search subject or code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2.5 w-full border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all bg-white text-slate-800 placeholder:text-slate-400"
              />
            </div>

            <div className="flex bg-slate-100 rounded-xl p-1 border border-slate-200/40">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'name' | 'credits' | 'popularity')}
                className="px-2 py-1.5 border-0 rounded-lg text-xs bg-transparent focus:outline-none font-semibold text-slate-700 mr-1"
              >
                <option value="name">Sort: Name</option>
                <option value="credits">Sort: Credits</option>
                <option value="popularity">Sort: Popular</option>
              </select>

              <div className="h-4.5 w-[1px] bg-slate-200 self-center mx-1" />

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

      {/* Main Grid List */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        
        {searchTerm && (
          <motion.div
            className="mb-8 p-4 bg-indigo-50/50 border border-indigo-100/50 rounded-2xl flex items-center space-x-3 text-left"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 flex-shrink-0">
              <BookOpen className="w-4 h-4" />
            </div>
            <p className="text-indigo-800 text-xs font-semibold">
              Filter results for "{searchTerm}": Found{' '}
              <span className="text-indigo-600 underline">
                {filteredSubjects.length}
              </span>{' '}
              subject(s) matching your request.
            </p>
          </motion.div>
        )}

        {filteredSubjects.length > 0 ? (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-start'
                : 'space-y-4 max-w-4xl mx-auto'
            }
          >
            {filteredSubjects.map((subject) => {
              const available = subject.available !== false;
              const category = getCourseCategory(subject.courseCode);

              const cardContent = (
                <motion.div
                  variants={itemVariants}
                  className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all duration-300 overflow-hidden flex flex-col h-full text-left"
                >
                  <div className="p-6 border-b border-slate-100/50 bg-gradient-to-b from-slate-50/50 to-transparent flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-11 h-11 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shadow-sm">
                        <BookOpen className="w-5 h-5" />
                      </div>
                      
                      <div className="flex flex-col items-end gap-1.5">
                        {!available ? (
                          <span className="px-2.5 py-0.5 bg-amber-50 border border-amber-100 text-amber-600 text-[10px] font-bold rounded-full">
                            Soon
                          </span>
                        ) : (
                          <span className={`px-2.5 py-0.5 border text-[10px] font-bold rounded-full ${category.bg}`}>
                            {category.label}
                          </span>
                        )}
                      </div>
                    </div>

                    <h3 className="text-sm font-bold text-slate-800 mb-1 group-hover:text-indigo-600 transition-colors">
                      {subject.courseName}
                    </h3>
                    <p className="text-[11px] text-slate-500 font-semibold">
                      {subject.courseCode} • {subject.credits} Credits
                    </p>
                  </div>

                  <div className="p-4 bg-slate-50/40 border-t border-slate-100/60 mt-auto flex items-center justify-between text-[10px] font-bold text-slate-400">
                    {available ? (
                      <div className="flex items-center justify-center text-indigo-650 group-hover:text-indigo-700 w-full">
                        <span>View Notes</span>
                        <ChevronRight className="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-1" />
                      </div>
                    ) : (
                      <span className="text-slate-400 text-center w-full">No Materials Drafted</span>
                    )}
                  </div>
                </motion.div>
              );

              return (
                <motion.div
                  key={subject.courseCode}
                  layout
                  className="group"
                >
                  {available ? (
                    <Link
                      to={`/notes/semester/${semesterId}/subject/${encodeURIComponent(subject.courseCode)}`}
                      className="block h-full cursor-pointer"
                    >
                      {cardContent}
                    </Link>
                  ) : (
                    <div className="h-full opacity-75">{cardContent}</div>
                  )}
                </motion.div>
              );
            })}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20 bg-white border border-slate-100 rounded-3xl p-8 max-w-lg mx-auto"
          >
            <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-100">
              <BookOpen className="w-6 h-6 text-slate-400" />
            </div>
            <h3 className="text-base font-bold text-slate-800 mb-1">No subjects found</h3>
            <p className="text-xs text-slate-500 mb-6 leading-relaxed">
              We couldn't find any subjects matching your search or filters.
            </p>
            {(searchTerm || filterType !== 'all') && (
              <Button
                variant="outline"
                className="text-xs font-bold border-slate-200 px-4 py-2"
                onClick={() => {
                  setSearchTerm('');
                  setFilterType('all');
                }}
              >
                Clear Search Filters
              </Button>
            )}
          </motion.div>
        )}
      </main>

    </div>
  );
}
