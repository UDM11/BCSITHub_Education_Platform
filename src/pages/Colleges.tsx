import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Search, MapPin, Users, Award, Star, ExternalLink, Filter, Grid, List, Phone, Mail, Calendar, Building, GraduationCap, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { College, collegesData } from '../data/collegesData';

export function Colleges() {
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [colleges, setColleges] = useState<College[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'name' | 'rating' | 'students'>('name');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setColleges(collegesData);
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const locations = [...new Set(collegesData.map(college => college.address.split(',').pop()?.trim()))];

  const filteredColleges = colleges
    .filter(college => {
      const matchesSearch = college.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          college.address.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesLocation = !selectedLocation || college.address.includes(selectedLocation);
      return matchesSearch && matchesLocation;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'students':
          return parseInt(b.students || '0') - parseInt(a.students || '0');
        default:
          return a.name.localeCompare(b.name);
      }
    });

  const handleCollegeClick = (website: string) => {
    window.open(website, '_blank');
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
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Loading Colleges</h3>
            <p className="text-gray-500">Discovering educational institutions...</p>
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
              <GraduationCap className="w-5 h-5 text-yellow-300 mr-2" />
              <span className="text-sm font-semibold text-yellow-50">Pokhara University Affiliations</span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 leading-tight bg-gradient-to-r from-white via-slate-100 to-indigo-100 bg-clip-text text-transparent">
              BCSIT Colleges in Nepal
            </h1>
            <p className="text-lg sm:text-xl text-indigo-100 mb-10 max-w-3xl mx-auto px-4 sm:px-0">
              Discover top-tier educational institutions offering the Bachelor of Computer Science & Information Technology program across Nepal.
            </p>
          </motion.div>
          
          {/* Stats */}
          <motion.div 
            className="grid grid-cols-2 sm:grid-cols-4 gap-4 lg:gap-6 max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            {[
              { icon: Building, label: 'Total Colleges', value: colleges.length },
              { icon: Users, label: 'Students', value: '4,000+' },
              { icon: MapPin, label: 'Cities', value: locations.length },
              { icon: Award, label: 'Programs', value: '50+' }
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
        </div>
      </motion.section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 mt-12">
        {/* Controls Section */}
        <motion.section 
          className="py-5 px-6 bg-white/70 backdrop-blur-md border border-slate-100/80 rounded-2xl shadow-premium mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4">
            {/* Search */}
            <div className="flex-1 max-w-md">
              <Input
                placeholder="Search colleges by name or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                icon={Search}
              />
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
                <option value="name">Sort by: Name</option>
                <option value="rating">Sort by: Rating</option>
                <option value="students">Sort by: Students</option>
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Location</label>
                    <select
                      value={selectedLocation}
                      onChange={(e) => setSelectedLocation(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all duration-300 text-slate-800"
                    >
                      <option value="">All Locations</option>
                      {locations.map((location) => (
                        <option key={location} value={location}>
                          {location}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                {selectedLocation && (
                  <div className="mt-4 flex justify-end">
                    <Button 
                      variant="outline" 
                      onClick={() => setSelectedLocation('')}
                      className="text-xs border-slate-200 font-semibold"
                    >
                      Clear Filters
                    </Button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.section>

        {/* Colleges Grid/List */}
        {filteredColleges.length > 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}
          >
            <AnimatePresence>
              {filteredColleges.map((college, index) => (
                <motion.div
                  key={college.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4, delay: 0.05 * index }}
                  whileHover={{ y: -8 }}
                  onClick={() => handleCollegeClick(college.website)}
                  className="cursor-pointer group h-full"
                >
                  <Card hover={false} className="h-full bg-white rounded-2xl border border-slate-100 shadow-premium group-hover:shadow-premium-hover hover:border-indigo-500/10 transition-all duration-300 overflow-hidden flex flex-col justify-between">
                    {/* College Logo & Header */}
                    <div>
                      <div className="relative p-6 bg-gradient-to-br from-slate-50 to-indigo-50/20 border-b border-slate-100/50">
                        <div className="flex items-center justify-between mb-4">
                          <div className="w-16 h-16 rounded-2xl bg-white p-2.5 flex items-center justify-center shadow-sm border border-slate-100/80">
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
                            <div className="flex items-center gap-1 bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full text-xs font-semibold border border-amber-200/55 shadow-sm">
                              <Star className="w-3.5 h-3.5 fill-current" />
                              <span>{college.rating}</span>
                            </div>
                          )}
                        </div>
                        
                        <h3 className="text-lg font-bold text-slate-800 mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                          {college.name}
                        </h3>
                        
                        <div className="flex items-center text-slate-500 text-xs font-semibold mb-1">
                          <MapPin className="w-3.5 h-3.5 mr-1.5 text-indigo-500 flex-shrink-0" />
                          <span className="truncate">{college.address}</span>
                        </div>
                      </div>

                      {/* College Details */}
                      <CardContent className="p-6">
                        <div className="space-y-3 mb-4">
                          {college.established && (
                            <div className="flex items-center text-sm text-slate-600">
                              <Calendar className="w-4 h-4 mr-2.5 text-indigo-500" />
                              <span>Established {college.established}</span>
                            </div>
                          )}
                          
                          {college.students && (
                            <div className="flex items-center text-sm text-slate-600">
                              <Users className="w-4 h-4 mr-2.5 text-indigo-500" />
                              <span>{college.students} Students</span>
                            </div>
                          )}

                          {college.programs && (
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              {college.programs.slice(0, 2).map((program, idx) => (
                                <span key={idx} className="px-2.5 py-1 bg-indigo-50 text-indigo-600 text-xs font-semibold rounded-full border border-indigo-100/40">
                                  {program}
                                </span>
                              ))}
                              {college.programs.length > 2 && (
                                <span className="px-2.5 py-1 bg-slate-50 text-slate-500 text-xs font-semibold rounded-full border border-slate-100">
                                  +{college.programs.length - 2} more
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Contact Info */}
                        {college.contact && (
                          <div className="space-y-2 mb-4 text-xs font-medium border-t border-slate-100/80 pt-4">
                            {college.contact.phone && (
                              <div className="flex items-center text-slate-500">
                                <Phone className="w-3.5 h-3.5 mr-2 text-slate-400" />
                                <span>{college.contact.phone}</span>
                              </div>
                            )}
                            {college.contact.email && (
                              <div className="flex items-center text-slate-500">
                                <Mail className="w-3.5 h-3.5 mr-2 text-slate-400" />
                                <span className="truncate">{college.contact.email}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </div>

                    {/* Visit Website Button */}
                    <div className="px-6 pb-6 mt-auto">
                      <div className="pt-4 border-t border-slate-100">
                        <div className="flex items-center justify-center text-indigo-600 group-hover:text-indigo-700 font-semibold text-sm transition-all duration-300 group-hover:translate-x-1">
                          <Globe className="w-4 h-4 mr-2" />
                          <span>Visit Website</span>
                          <ExternalLink className="w-3 h-3 ml-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Building className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">No colleges found</h3>
            <p className="text-slate-600 mb-6 text-sm">
              {searchTerm || selectedLocation 
                ? "Try adjusting your search or filter criteria" 
                : "No colleges available at the moment"}
            </p>
            {(searchTerm || selectedLocation) && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedLocation('');
                }}
              >
                Clear Search & Filters
              </Button>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}

