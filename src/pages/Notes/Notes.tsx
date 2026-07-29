import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Download, Star, Clock, Users, TrendingUp, Search, Filter, Grid, List, Play, FileText, Award, Zap, ChevronRight, Eye, Heart } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import { Link } from 'react-router-dom';

const semesters = [
  { value: '1', label: '1st Semester', subjects: 5, notes: 41, available: true, color: 'from-blue-500 to-cyan-500' },
  { value: '2', label: '2nd Semester', subjects: 6, notes: 40, available: true, color: 'from-emerald-500 to-teal-500' },
  { 
    value: '3', 
    label: '3rd Semester', 
    subjects: 5, 
    notes: 40, 
    available: true, 
    color: 'from-purple-500 to-indigo-500',
    subjectList: [
      'Linear Algebra and Probability',
      'Database Management System',
      'Object-Oriented Analysis and Design',
      'Internet Technology II (Programming)',
      'Principles of Management'
    ]
  },
  { 
    value: '4', 
    label: '4th Semester', 
    subjects: 6, 
    notes: 41, 
    available: true, 
    color: 'from-pink-500 to-rose-500',
    subjectList: [
      'Computer Architecture and Microprocessor',
      'Numerical Methods',
      'Software Engineering and Project Management',
      'Data Communication and Networks',
      'Fundamentals of Financial Management',
      'Project II'
    ]
  },
  { 
    value: '5', 
    label: '5th Semester', 
    subjects: 5, 
    notes: 35, 
    available: false, 
    color: 'from-orange-500 to-red-500',
    subjectList: [
      'Digital Marketing',
      'Operating Systems',
      'Organizational Behavior',
      'Artificial Intelligence',
      'Specialization Course'
    ]
  },
  { 
    value: '6', 
    label: '6th Semester', 
    subjects: 5, 
    notes: 33, 
    available: false, 
    color: 'from-yellow-500 to-orange-500',
    subjectList: [
      'Computer Graphics',
      'Research Methods',
      'Cloud Computing',
      'Applied Economics',
      'Concentration II'
    ]
  },
  { 
    value: '7', 
    label: '7th Semester', 
    subjects: 6, 
    notes: 28, 
    available: false, 
    color: 'from-green-500 to-emerald-500',
    subjectList: [
      'Strategic Management',
      'Management of Human Resources',
      'Digital Economy',
      'Information System Security',
      'Major Project',
      'Concentration III'
    ]
  },
  { 
    value: '8', 
    label: '8th Semester', 
    subjects: 4, 
    notes: 22, 
    available: false, 
    color: 'from-violet-500 to-purple-500',
    subjectList: [
      'Legal Aspects of Business and Technology',
      'Innovation and Entrepreneurship',
      'Internship',
      'Concentration IV'
    ]
  },
];



const stats = [
  { icon: FileText, label: 'Total Notes', value: '350+', color: 'text-blue-600' },
  { icon: Download, label: 'Downloads', value: '15K+', color: 'text-green-600' },
  { icon: Users, label: 'Active Users', value: '2.5K+', color: 'text-purple-600' },
  { icon: Star, label: 'Avg Rating', value: '4.8', color: 'text-yellow-600' },
];

export function Notes() {
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeFilter, setActiveFilter] = useState<'all' | 'available' | 'coming-soon'>('all');
  const [expandedSemester, setExpandedSemester] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  };

  const filteredSemesters = semesters.filter(sem => {
    const matchesFilter = activeFilter === 'all' || 
      (activeFilter === 'available' && sem.available) || 
      (activeFilter === 'coming-soon' && !sem.available);
    
    const matchesSearch = !searchTerm || 
      sem.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sem.value.includes(searchTerm);
    
    return matchesFilter && matchesSearch;
  });

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
          <motion.h3 
            className="text-xl font-semibold text-gray-700 mb-2"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            Loading Study Materials
          </motion.h3>
          <p className="text-gray-500">Preparing your learning resources...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Hero Section */}
      <motion.section 
        className="relative py-20 px-4 overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-90"></div>
        <motion.div 
          className="absolute inset-0"
          animate={{
            background: [
              'radial-gradient(circle at 20% 50%, rgba(120, 119, 198, 0.3) 0%, transparent 50%)',
              'radial-gradient(circle at 80% 20%, rgba(159, 122, 234, 0.3) 0%, transparent 50%)',
              'radial-gradient(circle at 40% 80%, rgba(99, 102, 241, 0.3) 0%, transparent 50%)'
            ]
          }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        
        <div className="relative max-w-6xl mx-auto text-center text-white">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <BookOpen className="w-16 h-16 mx-auto mb-6 text-yellow-300" />
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-yellow-200 bg-clip-text text-transparent">
              Study Materials
            </h1>
            <p className="text-xl md:text-2xl text-indigo-100 mb-8 max-w-3xl mx-auto">
              Comprehensive notes and resources for every semester of your BCSIT journey
            </p>
          </motion.div>
          
          <motion.div 
            className="flex flex-wrap justify-center gap-8 text-indigo-100"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            {stats.map((stat, index) => (
              <motion.div 
                key={stat.label}
                className="flex items-center gap-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
              >
                <stat.icon className="w-5 h-5" />
                <span className="font-semibold">{stat.value}</span>
                <span className="text-sm">{stat.label}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Controls Section */}
      <motion.section 
        className="py-8 px-4 bg-white/80 backdrop-blur-sm border-b"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            {/* Filter Tabs */}
            <div className="flex bg-gray-100 rounded-xl p-1">
              {[{ key: 'all', label: 'All Semesters' }, { key: 'available', label: 'Available' }, { key: 'coming-soon', label: 'Coming Soon' }].map((filter) => (
                <button
                  key={filter.key}
                  onClick={() => setActiveFilter(filter.key as any)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                    activeFilter === filter.key
                      ? 'bg-white text-indigo-600 shadow-md'
                      : 'text-gray-600 hover:text-indigo-600'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            {/* Search and View Controls */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search semesters..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white shadow-sm' : ''}`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded ${viewMode === 'list' ? 'bg-white shadow-sm' : ''}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Main Content */}
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Search Results Info */}
          {searchTerm && (
            <motion.div 
              className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <p className="text-blue-800">
                <span className="font-semibold">Search results for "{searchTerm}":</span>
                {' '}
                {filteredSemesters.length > 0 ? (
                  `Found ${filteredSemesters.length} semester(s)`
                ) : (
                  'No matching semesters found'
                )}
              </p>
            </motion.div>
          )}

          {/* Semester Grid */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}
          >
            {filteredSemesters.map((sem, index) => (
              <motion.div
                key={sem.value}
                variants={itemVariants}
                whileHover={{ y: -8, scale: 1.02 }}
                className="group"
              >
                {sem.available ? (
                  <Link to={`/notes/semester/${sem.value}`}>
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300">
                      <div className={`h-2 bg-gradient-to-r ${sem.color}`}></div>
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className={`w-12 h-12 bg-gradient-to-r ${sem.color} rounded-xl flex items-center justify-center text-white font-bold text-lg`}>
                            {sem.value}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                              Available
                            </span>
                            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-indigo-600 transition-colors" />
                          </div>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{sem.label}</h3>
                        <div className="flex items-center justify-between text-sm text-gray-600">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1">
                              <BookOpen className="w-4 h-4" />
                              <span>{sem.subjects} Subjects</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <FileText className="w-4 h-4" />
                              <span>{sem.notes} Notes</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ) : (
                  <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                    <div className={`h-2 bg-gradient-to-r ${sem.color}`}></div>
                    <div 
                      className="p-6 cursor-pointer"
                      onClick={() => setExpandedSemester(expandedSemester === sem.value ? null : sem.value)}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className={`w-12 h-12 bg-gradient-to-r ${sem.color} rounded-xl flex items-center justify-center text-white font-bold text-lg`}>
                          {sem.value}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                            Coming Soon
                          </span>
                          <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${
                            expandedSemester === sem.value ? 'rotate-90' : ''
                          }`} />
                        </div>
                      </div>
                      <h3 className="text-xl font-bold text-gray-700 mb-2">{sem.label}</h3>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <BookOpen className="w-4 h-4" />
                            <span>{sem.subjects} Subjects</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>In Progress</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <AnimatePresence>
                      {expandedSemester === sem.value && sem.subjectList && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3, ease: "easeInOut" }}
                          className="overflow-hidden border-t border-gray-100"
                        >
                          <div className="p-6 bg-gray-50">
                            <h4 className="font-semibold text-gray-900 mb-3">Subjects in this semester:</h4>
                            <div className="space-y-2">
                              {sem.subjectList.map((subject, idx) => (
                                <motion.div
                                  key={idx}
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: idx * 0.1 }}
                                  className="flex items-center p-3 bg-white rounded-lg border border-gray-200"
                                >
                                  <div className="w-8 h-8 bg-gradient-to-r from-gray-400 to-gray-500 rounded-lg flex items-center justify-center text-white text-sm font-medium mr-3">
                                    {idx + 1}
                                  </div>
                                  <span className="text-gray-700 font-medium">{subject}</span>
                                  <span className="ml-auto px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">
                                    Coming Soon
                                  </span>
                                </motion.div>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>


        </div>
      </section>
    </div>
  );
}
