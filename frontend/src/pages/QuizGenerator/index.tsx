import React, { useState, useEffect, useRef } from "react";
import { useSEO } from "../../hooks/useSEO";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Sparkles, Clock, Target, Trophy, Zap } from "lucide-react";
import { toast } from "sonner";
import { apiClient } from "../../lib/apiClient";
import { Subject } from "../../data/notesData";
import QuizSelection, { QuizSettings } from "./QuizSelection";
import QuizActive from "./QuizActive";
import QuizResultView from "./QuizResultView";
import { Question, getSubjectMapping } from "./quizData";

interface QuizStats {
  totalQuizzes: number;
  averageScore: number;
  bestScore: number;
  totalTime: number;
}

export function QuizGenerator() {
  useSEO({
    title: "PU BCSIT Exam Practice Quiz Generator | BCSITHub",
    description: "Generate customized practice exams and multiple-choice quizzes dynamically from Pokhara University BCSIT syllabus topics.",
    keywords: "bcsit exam quiz, pu mock exam, test generator, computer science quiz"
  });

  const [activeStep, setActiveStep] = useState<"selection" | "quiz" | "results">("selection");
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [countdownVal, setCountdownVal] = useState<number | null>(null);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [questionId: string]: number }>({});
  const [markedQuestions, setMarkedQuestions] = useState<Set<string>>(new Set());
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [timeLimit, setTimeLimit] = useState<number>(10);
  const [score, setScore] = useState<number>(0);
  const [correctAnswers, setCorrectAnswers] = useState<number>(0);
  const [percentage, setPercentage] = useState<number>(0);
  const [timeSpent, setTimeSpent] = useState<number>(0);
  const [expandedSavedQ, setExpandedSavedQ] = useState<string | null>(null);

  const [quizStats, setQuizStats] = useState<QuizStats>({ totalQuizzes: 0, averageScore: 0, bestScore: 0, totalTime: 0 });
  const [savedQuestions, setSavedQuestions] = useState<Question[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const savedStats = localStorage.getItem("bcsithub_quiz_stats");
    if (savedStats) { try { setQuizStats(JSON.parse(savedStats)); } catch { } }

    const savedBookmarks = localStorage.getItem("bcsithub_quiz_bookmarks");
    if (savedBookmarks) {
      try { setSavedQuestions(JSON.parse(savedBookmarks)); } catch { }
    }
  }, []);

  const handleToggleSaveQuestion = (q: Question) => {
    setSavedQuestions(prev => {
      let updated;
      if (prev.find(x => x.id === q.id)) {
        updated = prev.filter(x => x.id !== q.id);
        toast.success("Question removed from saved bank.");
      } else {
        updated = [...prev, q];
        toast.success("Question saved to your profile study bank!");
      }
      localStorage.setItem("bcsithub_quiz_bookmarks", JSON.stringify(updated));
      return updated;
    });
  };

  useEffect(() => {
    if (activeStep === "quiz" && timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) { clearInterval(timerRef.current!); handleQuizSubmit(true); return 0; }
          return prev - 1;
        });
      }, 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [activeStep, timeRemaining]);

  const handleStartQuiz = async (subject: Subject, settings: QuizSettings) => {
    setLoading(true);
    setError(null);
    setSelectedSubject(subject);
    setTimeLimit(settings.timeLimit);
    setTimeRemaining(settings.timeLimit * 60);

    const mapping = getSubjectMapping(subject);
    const params = new URLSearchParams();
    params.append("limit", settings.questionCount.toString());
    params.append("category", mapping.category);
    if (settings.difficulty !== "All") params.append("difficulty", settings.difficulty);
    if (subject.courseCode) params.append("subject_code", subject.courseCode);

    let apiQuestions: any[] = [];
    try {
      let fetched = await apiClient.get(`/quiz?${params}`) as any[];
      if (fetched?.length > 0) {
        apiQuestions = fetched;
      } else if (settings.difficulty !== "All") {
        const fb = new URLSearchParams();
        fb.append("limit", settings.questionCount.toString());
        fb.append("category", mapping.category);
        fetched = await apiClient.get(`/quiz?${fb}`) as any[];
        if (fetched?.length > 0) apiQuestions = fetched;
      }
      if (apiQuestions.length === 0 && mapping.category !== "Programming") {
        const fp = new URLSearchParams();
        fp.append("limit", settings.questionCount.toString());
        fp.append("category", "Programming");
        fetched = await apiClient.get(`/quiz?${fp}`) as any[];
        if (fetched?.length > 0) apiQuestions = fetched;
      }
      if (apiQuestions.length === 0) throw new Error("No questions found. Try a different subject or difficulty.");

      const mappedQuestions: Question[] = apiQuestions.map((apiQ: any, idx: number) => {
        const options = (apiQ.answers || []).map((a: any) => a.text || "");
        const correctIndex = (apiQ.answers || []).findIndex((a: any) => a.isCorrect === true);
        const finalIdx = correctIndex >= 0 ? correctIndex : 0;
        let diff: "Easy" | "Medium" | "Hard" = "Medium";
        if (apiQ.difficulty?.toLowerCase() === "easy") diff = "Easy";
        else if (apiQ.difficulty?.toLowerCase() === "hard") diff = "Hard";
        return {
          id: `q-${apiQ.id || idx}-${Date.now()}`,
          question: apiQ.text || apiQ.question || "",
          options,
          correctAnswer: finalIdx,
          explanation: apiQ.explanation || `The correct answer is Option ${String.fromCharCode(65 + finalIdx)}.`,
          difficulty: diff,
          category: apiQ.category || mapping.category,
          points: diff === "Easy" ? 10 : diff === "Medium" ? 20 : 30
        };
      });

      setQuestions(mappedQuestions);
      setSelectedAnswers({});
      setMarkedQuestions(new Set());
      setCurrentQuestionIndex(0);

      setCountdownVal(3);
      let count = 3;
      const interval = setInterval(() => {
        count -= 1;
        if (count < 0) { clearInterval(interval); setCountdownVal(null); setActiveStep("quiz"); }
        else setCountdownVal(count);
      }, 950);

      toast.success("Exam generated! Good luck!");
    } catch (err: any) {
      setError(err.message || "Failed to generate questions. Please check server connection.");
      toast.error(err.message || "Failed to start quiz.");
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (answerIndex: number) => {
    const qId = questions[currentQuestionIndex].id;
    setSelectedAnswers(prev => ({ ...prev, [qId]: answerIndex }));
  };

  const handleNext = () => { if (currentQuestionIndex < questions.length - 1) setCurrentQuestionIndex(p => p + 1); };
  const handlePrev = () => { if (currentQuestionIndex > 0) setCurrentQuestionIndex(p => p - 1); };

  const handleToggleMarkReview = () => {
    const qId = questions[currentQuestionIndex].id;
    setMarkedQuestions(prev => {
      const s = new Set(prev);
      if (s.has(qId)) s.delete(qId); else s.add(qId);
      return s;
    });
  };

  const handleJumpToQuestion = (idx: number) => {
    if (idx >= 0 && idx < questions.length) setCurrentQuestionIndex(idx);
  };

  const handleQuizSubmit = (timeLimitExceeded = false) => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (timeLimitExceeded) toast.warning("Time's up! Auto-submitting...");
    let correctCount = 0, totalScore = 0;
    questions.forEach(q => {
      if (selectedAnswers[q.id] === q.correctAnswer) { correctCount++; totalScore += q.points; }
    });
    const pct = Math.round((correctCount / questions.length) * 100);
    const secs = (timeLimit * 60) - timeRemaining;
    setCorrectAnswers(correctCount);
    setScore(totalScore);
    setPercentage(pct);
    setTimeSpent(secs);
    const newStats: QuizStats = {
      totalQuizzes: quizStats.totalQuizzes + 1,
      averageScore: Math.round(((quizStats.averageScore * quizStats.totalQuizzes) + pct) / (quizStats.totalQuizzes + 1)),
      bestScore: Math.max(quizStats.bestScore, pct),
      totalTime: quizStats.totalTime + secs
    };
    setQuizStats(newStats);
    localStorage.setItem("bcsithub_quiz_stats", JSON.stringify(newStats));
    setActiveStep("results");
    toast.success(timeLimitExceeded ? "Quiz submitted!" : "🎉 Quiz completed!");
  };

  const handleRetake = () => {
    if (selectedSubject) {
      handleStartQuiz(selectedSubject, {
        questionCount: questions.length,
        difficulty: questions[0]?.difficulty as any || "Medium",
        timeLimit
      });
    }
  };

  const handleExit = () => { setActiveStep("selection"); setSelectedSubject(null); setQuestions([]); };

  return (
    <div className="min-h-screen bg-slate-50/40 relative">

      {/* Countdown Overlay */}
      <AnimatePresence>
        {countdownVal !== null && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/96 backdrop-blur-md flex flex-col justify-center items-center text-white"
          >
            <motion.div
              animate={{ scale: [1, 1.15, 1], opacity: [0.2, 0.05, 0.2] }}
              transition={{ duration: 0.95, repeat: Infinity }}
              className="absolute w-64 h-64 rounded-full bg-indigo-500/20 blur-3xl"
            />
            <motion.div
              key={countdownVal}
              initial={{ scale: 0.3, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.8, opacity: 0 }}
              transition={{ type: "spring", stiffness: 160, damping: 14 }}
              className="relative w-44 h-44 rounded-full border-2 border-indigo-400/40 bg-indigo-500/10 flex items-center justify-center"
            >
              <span className="text-7xl font-black select-none">
                {countdownVal > 0 ? countdownVal : "GO!"}
              </span>
            </motion.div>
            <p className="mt-6 text-xs font-bold text-indigo-300 uppercase tracking-[0.25em]">
              {countdownVal > 0 ? "Preparing exam..." : "Begin!"}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero — only on selection page */}
      {activeStep === "selection" && (
        <section className="bg-slate-950 text-white py-16 px-4 relative overflow-hidden">
          <div className="absolute inset-0 z-0 pointer-events-none">
            <div className="absolute -top-32 -right-32 w-96 h-96 bg-indigo-500/15 rounded-full blur-[100px]" />
            <div className="absolute -bottom-32 -left-32 w-[450px] h-[450px] bg-purple-500/10 rounded-full blur-[120px]" />
          </div>
          <div className="max-w-6xl mx-auto text-center space-y-6 relative z-10">
            <motion.h1
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="text-4xl sm:text-5xl font-black leading-tight tracking-tight"
            >
              PU BCSIT Quiz Generator
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
              className="text-sm text-slate-400 max-w-xl mx-auto leading-relaxed"
            >
              Ace your Pokhara University semester exams with dynamic practice quizzes from the official BCSIT syllabus.
            </motion.p>


          </div>
        </section>
      )}

      {/* Main content */}
      <div className={`${activeStep === "selection" ? "max-w-6xl mt-10" : "max-w-7xl py-10"} mx-auto px-4 sm:px-6 lg:px-8 pb-16 relative z-10`}>

        {/* Loading */}
        {loading && (
          <div className="py-24 flex flex-col items-center gap-5">
            <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
            <div className="text-center">
              <p className="text-sm font-bold text-slate-700">Generating questions...</p>
              <p className="text-xs text-slate-400 mt-1">Fetching from BCSIT syllabus database</p>
            </div>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="max-w-md mx-auto mb-8 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm font-semibold text-center">
            ⚠️ {error}
          </div>
        )}

        {!loading && activeStep === "selection" && (
          <div className="space-y-10">
            <QuizSelection onStartQuiz={handleStartQuiz} stats={quizStats} />

            {/* Saved Questions Library */}
            {savedQuestions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200/50 flex items-center justify-center text-amber-500">
                    <Star className="w-4 h-4 fill-amber-400" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-800">Saved Questions Library</h3>
                    <p className="text-xs text-slate-400 font-semibold mt-0.5">Your personalized exam review bank ({savedQuestions.length} questions saved)</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {savedQuestions.map((q, idx) => {
                    const isOpen = expandedSavedQ === q.id;
                    return (
                      <div key={q.id} className="bg-slate-50/50 border border-slate-100 rounded-2xl overflow-hidden hover:border-slate-200 transition-all">
                        {/* Header collapsible */}
                        <button
                          onClick={() => setExpandedSavedQ(isOpen ? null : q.id)}
                          className="w-full flex items-start justify-between gap-4 p-4.5 text-left font-bold text-xs cursor-pointer hover:bg-slate-100/40 transition-colors"
                        >
                          <div className="flex items-start gap-3">
                            <span className="text-[10px] font-extrabold bg-slate-200/60 text-slate-500 px-2 py-0.5 rounded uppercase mt-0.5">Q{idx + 1}</span>
                            <div>
                              <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                                <span className="text-[9px] text-indigo-650 bg-indigo-50 font-bold px-1.5 py-0.5 rounded border border-indigo-100/30 uppercase tracking-wider">{q.category}</span>
                                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider ${
                                  q.difficulty === "Easy" ? "bg-emerald-50 border-emerald-100 text-emerald-600" :
                                  q.difficulty === "Medium" ? "bg-amber-50 border-amber-100 text-amber-600" :
                                  "bg-rose-50 border-rose-100 text-rose-600"
                                }`}>{q.difficulty}</span>
                              </div>
                              <h4 className="font-extrabold text-slate-700 leading-relaxed">{q.question}</h4>
                            </div>
                          </div>
                          <span className="text-slate-400 mt-1 flex-shrink-0">
                            {isOpen ? (
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-chevron-up"><path d="m18 15-6-6-6 6"/></svg>
                            ) : (
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-chevron-down"><path d="m6 9 6 6 6-6"/></svg>
                            )}
                          </span>
                        </button>

                        {/* Collapsible body */}
                        <AnimatePresence initial={false}>
                          {isOpen && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="border-t border-slate-100 overflow-hidden bg-white"
                            >
                              <div className="p-5 space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                  {q.options.map((opt, oIdx) => {
                                    const isCorrect = oIdx === q.correctAnswer;
                                    return (
                                      <div key={oIdx} className={`p-3 rounded-xl border text-[11px] leading-relaxed flex items-center justify-between ${
                                        isCorrect ? "bg-emerald-50 border-emerald-300 text-emerald-800 font-bold" : "bg-slate-50 border-slate-100 text-slate-600"
                                      }`}>
                                        <span>{opt}</span>
                                        {isCorrect && <span className="text-[9px] font-black text-emerald-700 bg-emerald-100/50 px-2 py-0.5 rounded uppercase tracking-wider">Correct</span>}
                                      </div>
                                    );
                                  })}
                                </div>

                                {q.explanation && (
                                  <div className="p-4 rounded-xl bg-indigo-50/40 border border-indigo-100/40 flex items-start gap-3 text-xs leading-relaxed text-indigo-900">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="text-indigo-500 mt-0.5 flex-shrink-0"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>
                                    <div>
                                      <span className="font-extrabold text-[10px] text-indigo-700 uppercase block mb-1">Explanation Summary</span>
                                      <span>{q.explanation}</span>
                                    </div>
                                  </div>
                                )}

                                <div className="flex justify-end pt-1">
                                  <button
                                    onClick={() => handleToggleSaveQuestion(q)}
                                    className="flex items-center gap-1.5 text-[10px] font-extrabold text-rose-500 hover:text-rose-700 transition-colors uppercase tracking-wider cursor-pointer border-0 bg-transparent"
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-trash-2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="10" x2="14" y2="14"/><line x1="14" y1="10" x2="10" y2="14"/></svg>
                                    Remove Bookmark
                                  </button>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </div>
        )}
        {!loading && activeStep === "quiz" && (
          <QuizActive
            subjectName={selectedSubject?.courseName || "Exam"}
            questions={questions}
            currentQuestionIndex={currentQuestionIndex}
            selectedAnswers={selectedAnswers}
            markedQuestions={markedQuestions}
            savedQuestionIds={new Set(savedQuestions.map(q => q.id))}
            timeRemaining={timeRemaining}
            timeLimit={timeLimit}
            onAnswerSelect={handleAnswerSelect}
            onNext={handleNext}
            onPrev={handlePrev}
            onToggleMarkReview={handleToggleMarkReview}
            onToggleSaveQuestion={() => handleToggleSaveQuestion(questions[currentQuestionIndex])}
            onJumpToQuestion={handleJumpToQuestion}
            onSubmit={() => handleQuizSubmit(false)}
          />
        )}
        {!loading && activeStep === "results" && (
          <QuizResultView
            subjectName={selectedSubject?.courseName || "Exam"}
            questions={questions}
            selectedAnswers={selectedAnswers}
            score={score}
            correctAnswers={correctAnswers}
            timeSpent={timeSpent}
            percentage={percentage}
            onRetake={handleRetake}
            onExit={handleExit}
          />
        )}
      </div>
    </div>
  );
}
