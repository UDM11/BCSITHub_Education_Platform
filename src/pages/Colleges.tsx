import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Globe,
  Search,
  MapPin,
  Users,
  Award,
  Star,
  ExternalLink,
  Filter,
  Grid,
  List,
  Phone,
  Mail,
  Calendar,
  Building,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { College, collegesData } from '../data/collegesData';

export function Colleges() {
  const [searchTerm, setSearchTerm] = useState('');
  const [colleges] = useState<College[]>(collegesData);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'name' | 'rating' | 'students'>('name');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState('');

  const locations = [
    ...new Set(
      collegesData.map((college) => college.address.split(',').pop()?.trim()).filter(Boolean)
    ),
  ];

  const filteredColleges = colleges
    .filter((college) => {
      const matchesSearch =
        college.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        college.address.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesLocation = !selectedLocation || college.address.includes(selectedLocation);
      return matchesSearch && matchesLocation;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'students':
          return parseInt(b.students || '0', 10) - parseInt(a.students || '0', 10);
        default:
          return a.name.localeCompare(b.name);
      }
    });

  const handleCollegeClick = (website: string) => {
    window.open(website, '_blank');
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
            BCSIT Colleges in Nepal
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed"
          >
            Explore Pokhara University affiliated colleges offering the Bachelor of Computer Science & Information Technology program. Filter by location and view ratings to find your fit.
          </motion.p>

          {/* Quick Statistics Banner */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto pt-6"
          >
            {[
              { icon: Building, label: 'Total Colleges', value: colleges.length },
              { icon: Users, label: 'Students Enrolled', value: '4,000+' },
              { icon: MapPin, label: 'Cities', value: locations.length },
              { icon: Award, label: 'PU Programs', value: '50+' },
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
      </section>

      {/* Sticky Interactive Dashboard Controls */}
      <section className="sticky top-16 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200/60 py-4 px-4 shadow-sm">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          
          {/* Search bar */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by college name or location..."
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

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'name' | 'rating' | 'students')}
              className="px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-semibold text-slate-700"
            >
              <option value="name">Sort by: Name</option>
              <option value="rating">Sort by: Rating</option>
              <option value="students">Sort by: Students</option>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 mt-4 border-t border-slate-100">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Location / Region</label>
                  <select
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-slate-800"
                  >
                    <option value="">All Locations</option>
                    {locations.map((loc) => (
                      <option key={loc} value={loc}>
                        {loc}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {selectedLocation && (
                <div className="flex justify-end pt-3">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedLocation('')}
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

      {/* Main Directory List Grid */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        
        {filteredColleges.length > 0 ? (
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
            {filteredColleges.map((college) => (
              <motion.div
                key={college.id}
                variants={itemVariants}
                onClick={() => handleCollegeClick(college.website)}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-indigo-150 transition-all duration-300 overflow-hidden flex flex-col h-full text-left cursor-pointer group"
              >
                {/* Card Header area */}
                <div className="p-6 border-b border-slate-100/50 bg-gradient-to-b from-slate-50/50 to-transparent flex-1">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-14 h-14 rounded-2xl bg-white p-2 flex items-center justify-center shadow-sm border border-slate-100">
                      <img
                        src={college.logo}
                        alt={college.name}
                        className="max-w-full max-h-full object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://via.placeholder.com/64';
                        }}
                      />
                    </div>
                    {college.rating && (
                      <div className="flex items-center gap-1 bg-amber-50 text-amber-600 px-2.5 py-0.5 rounded-full text-[10px] font-bold border border-amber-100/50 shadow-sm">
                        <Star className="w-3 h-3 fill-current" />
                        <span>{college.rating}</span>
                      </div>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-slate-800 mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                    {college.name}
                  </h3>

                  <div className="flex items-center text-slate-400 text-[11px] font-semibold">
                    <MapPin className="w-3.5 h-3.5 mr-1.5 text-indigo-500 flex-shrink-0" />
                    <span className="truncate">{college.address}</span>
                  </div>
                </div>

                {/* Card Info Details */}
                <div className="p-6 space-y-3.5 bg-transparent border-t border-slate-100/60">
                  <div className="space-y-2.5 text-xs text-slate-500 font-medium">
                    {college.established && (
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2.5 text-indigo-500" />
                        <span>Established {college.established}</span>
                      </div>
                    )}

                    {college.students && (
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-2.5 text-indigo-500" />
                        <span>{college.students} Students</span>
                      </div>
                    )}
                  </div>

                  {college.programs && (
                    <div className="flex flex-wrap gap-1 mt-1 border-t border-slate-100/60 pt-3">
                      {college.programs.slice(0, 2).map((prog, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-0.5 bg-indigo-50 border border-indigo-100/40 text-indigo-600 text-[9px] font-bold rounded-full"
                        >
                          {prog}
                        </span>
                      ))}
                      {college.programs.length > 2 && (
                        <span className="px-2 py-0.5 bg-slate-50 border border-slate-100 text-slate-400 text-[8px] font-bold rounded-full">
                          +{college.programs.length - 2} More
                        </span>
                      )}
                    </div>
                  )}

                  {college.contact && (
                    <div className="space-y-2 border-t border-slate-100/60 pt-3.5 text-[10px] text-slate-400 font-semibold">
                      {college.contact.phone && (
                        <div className="flex items-center">
                          <Phone className="w-3.5 h-3.5 mr-2 text-slate-400" />
                          <span>{college.contact.phone}</span>
                        </div>
                      )}
                      {college.contact.email && (
                        <div className="flex items-center">
                          <Mail className="w-3.5 h-3.5 mr-2 text-slate-400" />
                          <span className="truncate">{college.contact.email}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Visit button */}
                <div className="p-5 border-t border-slate-100/60 bg-slate-50/40 mt-auto">
                  <div className="flex items-center justify-center text-indigo-600 group-hover:text-indigo-700 font-bold text-xs transition-colors">
                    <Globe className="w-3.5 h-3.5 mr-1.5" />
                    <span>Visit College Website</span>
                    <ExternalLink className="w-3 h-3 ml-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20 bg-white border border-slate-100 rounded-3xl p-8 max-w-lg mx-auto"
          >
            <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-100">
              <Building className="w-6 h-6 text-slate-400" />
            </div>
            <h3 className="text-base font-bold text-slate-800 mb-1">No colleges found</h3>
            <p className="text-xs text-slate-500 mb-6 leading-relaxed">
              We couldn't find any Pokhara University affiliated colleges matching your search criteria.
            </p>
            {(searchTerm || selectedLocation) && (
              <Button
                variant="outline"
                className="text-xs font-bold border-slate-200 px-4 py-2"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedLocation('');
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
