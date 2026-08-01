import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Clock, Target, Play, ChevronDown,
  Sparkles, BookOpen, AlertCircle, CheckCircle, Lock
} from "lucide-react";
import { semestersData, Subject, Semester } from "../../data/notesData";

interface QuizSelectionProps {
  onStartQuiz: (subject: Subject, settings: QuizSettings) => void;
  stats: { totalQuizzes: number; averageScore: number; bestScore: number; };
}

export interface QuizSettings {
  questionCount: number;
  difficulty: "Easy" | "Medium" | "Hard" | "All";
  timeLimit: number;
}

export default function QuizSelection({ onStartQuiz }: QuizSelectionProps) {
  const [expandedSemesterId, setExpandedSemesterId] = useState<number | null>(1);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [difficulty, setDifficulty] = useState<"Easy" | "Medium" | "Hard" | "All">("Medium");
  const [timeLimit, setTimeLimit] = useState<number>(10);

  const allSubjects = useMemo(() => {
    const list: { subject: Subject; semester: Semester }[] = [];
    semestersData.forEach(sem => sem.subjects.forEach(subj => list.push({ subject: subj, semester: sem })));
    return list;
  }, []);

  const searchResults = useMemo(() => {
    if (!searchTerm) return [];
    return allSubjects.filter(({ subject }) =>
      subject.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subject.courseCode.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, allSubjects]);

  const handleStart = () => {
    if (!selectedSubject) return;
    onStartQuiz(selectedSubject, { questionCount, difficulty, timeLimit });
  };

  const difficultyConfig = {
    Easy: { active: "bg-emerald-600 border-emerald-600 text-white", normal: "bg-white border-slate-200 text-slate-600 hover:border-emerald-300 hover:text-emerald-600" },
    Medium: { active: "bg-amber-500 border-amber-500 text-white", normal: "bg-white border-slate-200 text-slate-600 hover:border-amber-300 hover:text-amber-600" },
    Hard: { active: "bg-rose-600 border-rose-600 text-white", normal: "bg-white border-slate-200 text-slate-600 hover:border-rose-300 hover:text-rose-600" },
    All: { active: "bg-indigo-600 border-indigo-600 text-white", normal: "bg-white border-slate-200 text-slate-600 hover:border-indigo-300 hover:text-indigo-600" },
  };

  const qCountOptions = [5, 10, 15, 20, 25, 30];
  const timeLimitOptions = [5, 10, 15, 20, 30];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

      {/* LEFT: Subject picker */}
      <div className="lg:col-span-2 space-y-5">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800">Select Course Subject</h2>
          <p className="text-xs font-semibold text-slate-500 mt-1">Choose from the PU BCSIT syllabus below</p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search by subject name or course code..."
            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm text-slate-700 placeholder:text-slate-400 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all shadow-sm"
          />
        </div>

        {/* Search results dropdown */}
        <AnimatePresence>
          {searchTerm && (
            <motion.div
              initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
              className="bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden"
            >
              {searchResults.length === 0 ? (
                <div className="flex items-center gap-3 px-5 py-4 text-slate-500 text-sm">
                  <AlertCircle className="w-4 h-4" />No subjects found for "{searchTerm}"
                </div>
              ) : (
                searchResults.slice(0, 6).map(({ subject, semester }) => (
                  <button
                    key={subject.courseCode}
                    onClick={() => { setSelectedSubject(subject); setSearchTerm(""); }}
                    className={`w-full flex items-center justify-between px-5 py-3 hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0 ${selectedSubject?.courseCode === subject.courseCode ? "bg-indigo-50" : ""}`}
                  >
                    <div className="text-left">
                      <p className="text-sm font-bold text-slate-800">{subject.courseName}</p>
                      <p className="text-xs text-slate-500">{subject.courseCode} · {semester.name}</p>
                    </div>
                    {selectedSubject?.courseCode === subject.courseCode && <CheckCircle className="w-4 h-4 text-indigo-500 flex-shrink-0" />}
                  </button>
                ))
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Semester Accordion */}
        <div className="space-y-3">
          {semestersData.map((sem, semIdx) => (
            <motion.div
              key={sem.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: semIdx * 0.04 }}
              className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm"
            >
              <button
                onClick={() => setExpandedSemesterId(expandedSemesterId === sem.id ? null : sem.id)}
                className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black transition-colors ${expandedSemesterId === sem.id ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-500"}`}>
                    {sem.id}
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold text-slate-800">{sem.name}</p>
                    <p className="text-xs text-slate-500">{sem.subjects.length} subjects available</p>
                  </div>
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${expandedSemesterId === sem.id ? "rotate-180" : ""}`} />
              </button>

              <AnimatePresence>
                {expandedSemesterId === sem.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden border-t border-slate-100"
                  >
                    <div className="p-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {sem.subjects.map(subj => {
                        const isSelected = selectedSubject?.courseCode === subj.courseCode;
                        return (
                          <button
                            key={subj.courseCode}
                            onClick={() => setSelectedSubject(isSelected ? null : subj)}
                            className={`flex items-center gap-3 p-3 rounded-xl text-left transition-all border ${
                              isSelected
                                ? "bg-indigo-50 border-indigo-300 text-indigo-700"
                                : "border-slate-100 hover:border-slate-200 hover:bg-slate-50 text-slate-700"
                            }`}
                          >
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${isSelected ? "bg-indigo-100" : "bg-slate-100"}`}>
                              {isSelected
                                ? <CheckCircle className="w-4 h-4 text-indigo-600" />
                                : <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                              }
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold truncate leading-tight text-slate-800">{subj.courseName}</p>
                              <p className="text-[10px] text-slate-400 mt-0.5 font-semibold">{subj.courseCode}</p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>

      {/* RIGHT: Settings Panel */}
      <div className="space-y-4 lg:sticky lg:top-24">

        {/* Selected subject */}
        <AnimatePresence mode="wait">
          {selectedSubject ? (
            <motion.div
              key="selected"
              initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              className="bg-indigo-50 border border-indigo-200 rounded-2xl p-4"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-[10px] text-indigo-500 font-bold uppercase tracking-wider mb-1">Selected Subject</p>
                  <p className="text-sm font-extrabold text-indigo-900 leading-snug">{selectedSubject.courseName}</p>
                  <p className="text-xs text-indigo-400 mt-0.5 font-semibold">{selectedSubject.courseCode}</p>
                </div>
                <CheckCircle className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5" />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="bg-slate-50 border border-slate-200 border-dashed rounded-2xl p-4 text-center"
            >
              <BookOpen className="w-6 h-6 text-slate-300 mx-auto mb-2" />
              <p className="text-xs text-slate-400 font-semibold">Select a subject from the list</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Config card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-5 shadow-sm">
          <p className="text-xs font-extrabold text-slate-700 uppercase tracking-widest flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />Exam Settings
          </p>

          {/* Question count */}
          <div>
            <label className="text-xs text-slate-500 font-semibold mb-2 block">Number of Questions</label>
            <div className="grid grid-cols-3 gap-1.5">
              {qCountOptions.map(n => (
                <button key={n} onClick={() => setQuestionCount(n)}
                  className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                    questionCount === n
                      ? "bg-indigo-600 border-indigo-600 text-white shadow-sm"
                      : "bg-white border-slate-200 text-slate-600 hover:border-indigo-300"
                  }`}>
                  {n}
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty */}
          <div>
            <label className="text-xs text-slate-500 font-semibold mb-2 block">Difficulty Level</label>
            <div className="grid grid-cols-2 gap-1.5">
              {(["Easy", "Medium", "Hard", "All"] as const).map(d => (
                <button key={d} onClick={() => setDifficulty(d)}
                  className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                    difficulty === d ? difficultyConfig[d].active : difficultyConfig[d].normal
                  }`}>
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Time limit */}
          <div>
            <label className="text-xs text-slate-500 font-semibold mb-2 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />Time Limit
            </label>
            <div className="flex gap-1.5">
              {timeLimitOptions.map(t => (
                <button key={t} onClick={() => setTimeLimit(t)}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                    timeLimit === t
                      ? "bg-indigo-600 border-indigo-600 text-white"
                      : "bg-white border-slate-200 text-slate-600 hover:border-indigo-300"
                  }`}>
                  {t}m
                </button>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="bg-slate-50 rounded-xl p-3 space-y-1.5 border border-slate-100">
            {[
              { label: "Questions", value: `${questionCount} MCQs` },
              { label: "Difficulty", value: difficulty },
              { label: "Time", value: `${timeLimit} min` },
              { label: "Max Points", value: `${questionCount * 30} pts` },
            ].map(row => (
              <div key={row.label} className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-semibold">{row.label}</span>
                <span className="text-slate-700 font-bold">{row.value}</span>
              </div>
            ))}
          </div>

          {/* Start button */}
          <button
            onClick={handleStart}
            disabled={!selectedSubject}
            className={`w-full py-4 rounded-2xl text-sm font-black tracking-wide transition-all flex items-center justify-center gap-2.5 ${
              selectedSubject
                ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200"
                : "bg-slate-100 text-slate-400 cursor-not-allowed"
            }`}
          >
            {selectedSubject ? (
              <><Play className="w-4 h-4" />Start Exam</>
            ) : (
              <><Lock className="w-4 h-4" />Select a Subject First</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
