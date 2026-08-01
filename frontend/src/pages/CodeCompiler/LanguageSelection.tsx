import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { LANGUAGES_LIST, LanguageDef } from "./compilerData";
import { LanguageLogo } from "./LanguageLogo";

interface LanguageSelectionProps {
  onSelectLanguage: (lang: LanguageDef) => void;
}

export default function LanguageSelection({ onSelectLanguage }: LanguageSelectionProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"popular" | "programming" | "web" | "database">("popular");

  // Filtering based on tab & search
  const filteredLanguages = useMemo(() => {
    return LANGUAGES_LIST.filter((lang) => {
      const matchesSearch = 
        lang.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lang.extension.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (!matchesSearch) return false;
      
      // If searching, show all matches. If not, filter by category tab.
      if (searchTerm) return true;
      
      if (activeTab === "popular") {
        return ["html", "python", "javascript", "java", "mysql", "c", "cpp", "php", "nodejs", "react"].includes(lang.id);
      }
      return lang.category === activeTab;
    });
  }, [searchTerm, activeTab]);

  return (
    <div className="min-h-screen bg-[#f8fafc] relative">
      {/* 1. Header Section (Matching Syllabus and Notes design) */}
      <section className="bg-slate-950 text-white py-16 px-4 relative overflow-hidden">
        {/* Background glow effects */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-500/15 rounded-full blur-[100px]" />
          <div className="absolute -bottom-40 -left-40 w-[450px] h-[450px] bg-purple-500/10 rounded-full blur-[120px]" />
        </div>

        <div className="max-w-6xl mx-auto text-center space-y-5 relative z-10">
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-5xl font-black leading-tight tracking-tight"
          >
            Online Sandboxed Code Compiler
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto leading-relaxed"
          >
            Write, compile, and run code instantly in 18+ programming languages. Practice college lab programs and test your algorithms with real-time feedback.
          </motion.p>
        </div>
      </section>

      {/* 2. Main content area (Matching Syllabus design) */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 pb-16 space-y-8 relative z-10">
        
        {/* Controls: Category Selector & Search Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Tab Selector */}
          <div className="flex bg-slate-150/80 bg-slate-100 rounded-xl p-1 border border-slate-200/40 relative gap-1">
            {(["popular", "programming", "web", "database"] as const).map((tab) => {
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveTab(tab);
                    setSearchTerm("");
                  }}
                  className={`relative px-5 py-2.5 rounded-lg text-xs font-bold transition-all uppercase tracking-wider ${
                    isActive 
                      ? "text-indigo-600 bg-white shadow-sm border border-slate-200/20" 
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {tab === "database" ? "Databases" : tab}
                </button>
              );
            })}
          </div>

          {/* Search Bar */}
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by Language/ DB/ Template etc.,"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all bg-white text-slate-800"
            />
          </div>
        </div>

        {/* Grid of Cards */}
        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 text-left"
        >
          {filteredLanguages.map((lang) => (
            <motion.div
              layoutId={lang.id}
              key={lang.id}
              whileHover={{ y: -3, scale: 1.01 }}
              onClick={() => onSelectLanguage(lang)}
              className="group cursor-pointer bg-white border border-slate-200/80 hover:border-indigo-300 hover:shadow-md rounded-2xl p-5 flex items-center justify-between transition-all"
            >
              <div className="space-y-1">
                <h3 className="font-extrabold text-sm text-slate-800 group-hover:text-indigo-600 transition-colors">
                  {lang.name}
                </h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  .{lang.extension.toUpperCase()}
                </p>
              </div>
              <div className="w-10 h-10 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center p-2 shadow-inner">
                <LanguageLogo type={lang.logo} className="w-6 h-6" />
              </div>
            </motion.div>
          ))}
        </motion.div>

        {filteredLanguages.length === 0 && (
          <div className="py-12 text-center text-slate-500 font-bold text-xs">
            No sandboxes match "{searchTerm}"
          </div>
        )}
      </main>
    </div>
  );
}
