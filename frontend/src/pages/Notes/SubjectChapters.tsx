import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../../components/ui/Button';
import { useSEO } from '../../hooks/useSEO';
import {
  ChevronLeft,
  BookOpen,
  Search,
  Grid,
  List,
  FileText,
  ChevronRight,
  Award,
  Clock,
  TrendingUp,
} from 'lucide-react';
import { chapterData, SubjectChapters as SubjectChaptersType } from '../../data/chapterData';
import { semestersData } from '../../data/notesData';

export default function SubjectChapters() {
  const { semesterId, subjectId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [subjectChapters, setSubjectChapters] = useState<SubjectChaptersType | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'order' | 'name' | 'popularity'>('order');
  const [filterType, setFilterType] = useState<'all' | 'available' | 'coming-soon'>('all');

  const decodedSubjectId = decodeURIComponent(subjectId || '');

  const currentSemesterSubjects = useMemo(() => {
    const sem = semestersData.find((s) => s.id === Number(semesterId));
    return sem ? sem.subjects : [];
  }, [semesterId]);

  const chapterTitlesString = useMemo(() => {
    return subjectChapters?.chapters.map(c => c.title).join(", ");
  }, [subjectChapters]);

  const seoTitle = useMemo(() => {
    return subjectChapters 
      ? `${subjectChapters.courseName} Lecture Notes & Chapter Guides | PU BCSIT` 
      : "Subject Chapters & Lecture Notes | BCSITHub";
  }, [subjectChapters]);

  const seoDescription = useMemo(() => {
    return subjectChapters 
      ? `Download Pokhara University BCSIT ${subjectChapters.courseName} (${subjectChapters.courseCode || 'Core'}) chapter notes. Includes units: ${chapterTitlesString}.` 
      : "Browse chapter-wise course lecture notes, downloads, and academic reference syllabus guidelines for Pokhara University BCSIT.";
  }, [subjectChapters, chapterTitlesString]);

  const seoKeywords = useMemo(() => {
    return subjectChapters 
      ? `${subjectChapters.courseName} notes, ${subjectChapters.courseCode || 'core'} chapter guides, ${chapterTitlesString}` 
      : "bcsit course chapters, lecture reference handouts";
  }, [subjectChapters, chapterTitlesString]);

  useSEO({
    title: seoTitle,
    description: seoDescription,
    keywords: seoKeywords,
    image: "https://bcsithub.umeshdarlami.com.np/logo.jpg"
  });

  useEffect(() => {
    // Function to check if a note file exists
    const checkNoteExists = async (chapterId: string): Promise<boolean> => {
      try {
        const encodedSemester = encodeURIComponent(`Semester ${semesterId}`);
        const encodedSubject = encodeURIComponent(decodedSubjectId);
        const filePath = `/notes/${encodedSemester}/${encodedSubject}/${chapterId}.html`;
        const response = await fetch(filePath);
        if (!response.ok) return false;
        const text = await response.text();
        return !text.includes('id="root"') && !text.includes("id='root'");
      } catch {
        return false;
      }
    };

    const loadChaptersWithAvailability = async () => {
      try {
        setLoading(true);
        const data = chapterData.find(
          (subject) => 
            subject.courseCode === decodedSubjectId || 
            subject.courseName === decodedSubjectId
        );

        if (data) {
          // Check availability for each chapter
          const enhancedChapters = await Promise.all(
            data.chapters.map(async (chapter, index) => {
              const available = await checkNoteExists(chapter.id);
              return {
                ...chapter,
                views: Math.floor(Math.random() * 500) + 50,
                downloads: Math.floor(Math.random() * 200) + 20,
                rating: (Math.random() * 2 + 3).toFixed(1),
                duration: Math.floor(Math.random() * 30) + 10,
                lastUpdated: ((index * 3) % 28) + 1,
                available,
              };
            })
          );
          setSubjectChapters({ ...data, chapters: enhancedChapters });
        } else {
          setSubjectChapters(null);
        }
      } catch (err) {
        console.error('Error loading chapters:', err);
      } finally {
        setLoading(false);
      }
    };

    loadChaptersWithAvailability();
  }, [decodedSubjectId, semesterId]);

  // Filter and sort chapters
  const filteredChapters = useMemo(() => {
    if (!subjectChapters) return [];

    const filtered = subjectChapters.chapters.filter((chapter) => {
      const matchesSearch = chapter.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter =
        filterType === 'all' ||
        (filterType === 'available' && chapter.available !== false) ||
        (filterType === 'coming-soon' && chapter.available === false);
      return matchesSearch && matchesFilter;
    });

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.title.localeCompare(b.title);
        case 'popularity':
          return (b.views || 0) - (a.views || 0);
        default:
          return Number(a.id) - Number(b.id);
      }
    });
  }, [searchQuery, subjectChapters, sortBy, filterType]);

  const stats = useMemo(() => {
    if (!subjectChapters) return { total: 0, available: 0, avgRating: '0.0', totalViews: 0 };

    const total = subjectChapters.chapters.length;
    const available = subjectChapters.chapters.filter((c) => c.available !== false).length;
    const avgRating =
      subjectChapters.chapters.reduce((sum, c) => sum + parseFloat(c.rating || '0'), 0) / total;
    const totalViews = subjectChapters.chapters.reduce((sum, c) => sum + (c.views || 0), 0);

    return { total, available, avgRating: avgRating.toFixed(1), totalViews };
  }, [subjectChapters]);

  if (!subjectChapters && !loading) {
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
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Subject Not Found</h2>
          <p className="text-slate-500 mb-6">No chapters found for "{decodedSubjectId}"</p>
          <Button
            onClick={() => navigate(`/notes/semester/${semesterId}`)}
            className="bg-indigo-650 hover:bg-indigo-700 text-white font-bold border-0 px-6 py-2.5 rounded-xl shadow-md"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back to Subjects
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
              onClick={() => navigate(`/notes/semester/${semesterId}`)}
              className="text-slate-300 hover:text-white border-slate-800 hover:bg-slate-900 bg-slate-900/60 backdrop-blur-md text-xs font-bold px-4 py-2 rounded-xl"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back to Subjects
            </Button>
          </motion.div>

          <div className="text-center space-y-4">
            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent"
            >
              {decodedSubjectId}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed"
            >
              Study units, download lecture reference handouts, and view online resources mapped specifically for this course.
            </motion.p>

          </div>
        </div>
      </section>

      {/* Sticky Interactive Dashboard Controls */}
      <section className="sticky top-16 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200/60 py-4 px-4 shadow-sm">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          
          {/* Advanced Tab Pill Selector */}
          <div className="flex bg-slate-100 rounded-xl p-1 border border-slate-200/40 relative w-full md:w-auto">
            {[
              { key: 'all', label: 'All Units' },
              { key: 'available', label: 'Available' },
              { key: 'coming-soon', label: 'Coming Soon' },
            ].map((filter) => {
              const isActive = filterType === filter.key;
              return (
                <button
                  key={filter.key}
                  onClick={() => setFilterType(filter.key as 'all' | 'available' | 'coming-soon')}
                  className={`flex-1 md:flex-none relative px-4 py-2.5 rounded-lg text-xs font-bold transition-colors z-10 uppercase tracking-wider ${
                    isActive ? 'text-indigo-650' : 'text-slate-550 hover:text-slate-850'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeChapterFilterBackground"
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
                placeholder="Search unit title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2.5 w-full border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all bg-white text-slate-800 placeholder:text-slate-400"
              />
            </div>

            <div className="flex bg-slate-100 rounded-xl p-1 border border-slate-200/40">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'order' | 'name' | 'popularity')}
                className="px-2 py-1.5 border-0 rounded-lg text-xs bg-transparent focus:outline-none font-semibold text-slate-700 mr-1"
              >
                <option value="order">Sort: Unit Order</option>
                <option value="name">Sort: Name</option>
                <option value="popularity">Sort: Views</option>
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

      {/* Main Directory List Grid */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* Left Sidebar: Subject Selection */}
          <aside className="w-full lg:w-56 flex-shrink-0">
            <div className="bg-white border border-slate-100 shadow-sm rounded-2xl p-4 lg:sticky lg:top-36 text-left">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block px-1.5 mb-2.5">
                Semester Subjects
              </span>
              <div className="flex flex-row lg:flex-col gap-1.5 overflow-x-auto lg:overflow-x-visible pb-2.5 lg:pb-0 scrollbar-none">
                {currentSemesterSubjects.map((sub) => {
                  const subId = sub.courseCode || sub.courseName;
                  const isCurrent = subId.toLowerCase() === decodedSubjectId.toLowerCase();
                  return (
                    <button
                      key={subId}
                      onClick={() => {
                        window.location.href = `/notes/semester/${semesterId}/subject/${encodeURIComponent(subId)}`;
                      }}
                      className={`w-auto lg:w-full text-center lg:text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 whitespace-nowrap lg:whitespace-normal ${
                        isCurrent
                          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                          : 'bg-transparent hover:bg-slate-50 text-slate-655 hover:text-slate-800 border border-transparent'
                      }`}
                    >
                      {sub.courseName}
                    </button>
                  );
                })}
              </div>
            </div>
          </aside>

          {/* Right Column: Chapters catalog list */}
          <div className="flex-1">
            {searchQuery && (
              <motion.div
                className="mb-8 p-4 bg-indigo-50/50 border border-indigo-100/50 rounded-2xl flex items-center space-x-3 text-left"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 flex-shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <p className="text-indigo-800 text-xs font-semibold">
                  Filter results for "{searchQuery}": Found{' '}
                  <span className="text-indigo-600 underline">
                    {filteredChapters.length}
                  </span>{' '}
                  unit(s) matching your request.
                </p>
              </motion.div>
            )}

            {loading ? (
              /* Localized skeletons */
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
            ) : filteredChapters.length > 0 ? (
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
                <AnimatePresence>
                  {filteredChapters.map((chapter) => {
                    const available = chapter.available !== false;
                    
                    const cardContent = (
                      <motion.div
                        variants={itemVariants}
                        className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all duration-300 overflow-hidden flex flex-col h-full text-left"
                      >
                        <div className="p-6 border-b border-slate-100/50 bg-gradient-to-b from-slate-50/50 to-transparent flex-1">
                          <div className="flex items-start justify-between mb-4">
                            <div className="w-11 h-11 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shadow-sm">
                              <FileText className="w-5 h-5" />
                            </div>
                            
                            <div className="flex flex-col items-end gap-1.5">
                              {!available ? (
                                <span className="px-2.5 py-0.5 bg-amber-50 border border-amber-100 text-amber-600 text-[10px] font-bold rounded-full">
                                  Soon
                                </span>
                              ) : (
                                <span className="px-2.5 py-0.5 bg-emerald-50 border border-emerald-100 text-emerald-600 text-[10px] font-bold rounded-full">
                                  Unit {chapter.id}
                                </span>
                              )}
                            </div>
                          </div>

                          <h3 className="text-sm font-bold text-slate-800 mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                            {chapter.title}
                          </h3>
                          
                          {chapter.description && (
                            <p className="text-[11px] text-slate-500 font-medium leading-relaxed line-clamp-3">
                              {chapter.description}
                            </p>
                          )}
                        </div>

                        <div className="p-4 bg-slate-50/40 border-t border-slate-100/60 mt-auto flex items-center justify-between text-[10px] font-bold text-slate-400">
                          {available ? (
                            <div className="flex items-center justify-center text-indigo-650 group-hover:text-indigo-700 w-full">
                              <span>Open Document</span>
                              <ChevronRight className="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-1" />
                            </div>
                          ) : (
                            <span className="text-slate-400 text-center w-full">No Handouts Mapped</span>
                          )}
                        </div>
                      </motion.div>
                    );

                    return (
                      <motion.div
                        key={chapter.id}
                        layout
                        className="group"
                        onClick={() =>
                          available &&
                          navigate(
                            `/notes/semester/${semesterId}/subject/${encodeURIComponent(
                              decodedSubjectId
                            )}/chapter/${chapter.id}`
                          )
                        }
                      >
                        {available ? (
                          <div className="h-full cursor-pointer">{cardContent}</div>
                        ) : (
                          <div className="h-full opacity-75">{cardContent}</div>
                        )}
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
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
                <h3 className="text-base font-bold text-slate-800 mb-1">No chapters found</h3>
                <p className="text-xs text-slate-500 mb-6 leading-relaxed">
                  We couldn't find any chapters matching your search or filters.
                </p>
                {(searchQuery || filterType !== 'all') && (
                  <Button
                    variant="outline"
                    className="text-xs font-bold border-slate-200 px-4 py-2"
                    onClick={() => {
                      setSearchQuery('');
                      setFilterType('all');
                    }}
                  >
                    Clear Search Filters
                  </Button>
                )}
              </motion.div>
            )}
          </div>
        </div>
      </main>

    </div>
  );
}
