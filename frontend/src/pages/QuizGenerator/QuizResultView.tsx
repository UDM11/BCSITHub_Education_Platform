import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Trophy, RotateCcw, Home, CheckCircle2, XCircle, Clock, Award, ChevronDown, ChevronUp, Lightbulb, FileDown 
} from "lucide-react";
import { jsPDF } from "jspdf";
import { Card, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Question } from "./quizData";

interface QuizResultViewProps {
  subjectName: string;
  questions: Question[];
  selectedAnswers: { [questionId: string]: number };
  score: number;
  correctAnswers: number;
  timeSpent: number;
  percentage: number;
  onRetake: () => void;
  onExit: () => void;
}

export default function QuizResultView({
  subjectName,
  questions,
  selectedAnswers,
  score,
  correctAnswers,
  timeSpent,
  percentage,
  onRetake,
  onExit
}: QuizResultViewProps) {
  const [expandedQuestionId, setExpandedQuestionId] = useState<string | null>(null);

  const exportToPDF = () => {
    const doc = new jsPDF();
    
    // Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.setTextColor(30, 41, 59); // slate-800
    doc.text("BCSITHub - Exam Report Card", 15, 20);
    
    // Line separator
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.5);
    doc.line(15, 25, 195, 25);
    
    // Metadata
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(71, 85, 105); // slate-600
    doc.text(`Subject: ${subjectName}`, 15, 33);
    doc.text(`Date taken: ${new Date().toLocaleString()}`, 15, 40);
    
    // Stats Block
    doc.setFont("helvetica", "bold");
    doc.text("Result Summary:", 15, 50);
    
    doc.setFont("helvetica", "normal");
    doc.text(`Accuracy Rate: ${percentage}%`, 15, 57);
    doc.text(`Correct Answers: ${correctAnswers} / ${questions.length}`, 15, 64);
    doc.text(`Total Points: ${score} pts`, 15, 71);
    
    const minutes = Math.floor(timeSpent / 60);
    const seconds = timeSpent % 60;
    doc.text(`Time Spent: ${minutes}m ${seconds}s`, 15, 78);
    
    doc.line(15, 84, 195, 84);
    
    // Questions heading
    doc.setFont("helvetica", "bold");
    doc.text("Detailed Question Review:", 15, 92);
    
    let y = 100;
    questions.forEach((q, idx) => {
      // Check page height limit, add new page if needed
      if (y > 260) {
        doc.addPage();
        y = 20;
      }
      
      const userAns = selectedAnswers[q.id];
      const isCorrect = userAns === q.correctAnswer;
      const statusText = isCorrect ? "CORRECT" : "INCORRECT";
      
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(30, 41, 59);
      
      // Wrap question text
      const lines = doc.splitTextToSize(`Q${idx + 1}. ${q.question}`, 175);
      doc.text(lines, 15, y);
      y += (lines.length * 4.5) + 2;
      
      // User Answer & Correct Answer
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 116, 139);
      const userChoiceText = userAns !== undefined ? q.options[userAns] : "No answer selected";
      const correctChoiceText = q.options[q.correctAnswer];
      
      doc.text(`Your answer: ${userChoiceText} (${statusText})`, 20, y);
      y += 4.5;
      doc.text(`Correct answer: ${correctChoiceText}`, 20, y);
      y += 7;
    });
    
    doc.save(`BCSITHub_${subjectName.replace(/\s+/g, "_")}_Quiz_Report.pdf`);
  };

  const formatTimeSpent = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins > 0) {
      return `${mins}m ${secs}s`;
    }
    return `${secs}s`;
  };

  const toggleExpand = (qId: string) => {
    setExpandedQuestionId(expandedQuestionId === qId ? null : qId);
  };

  // Gamified performance message
  const getPerformanceMessage = (pct: number) => {
    if (pct >= 90) return { title: "Outstanding! 🏆", msg: "You have mastered this subject content!", color: "text-emerald-600 bg-emerald-50 border-emerald-100" };
    if (pct >= 75) return { title: "Great Job! 🌟", msg: "Excellent understanding of the course syllabus.", color: "text-indigo-600 bg-indigo-50 border-indigo-100" };
    if (pct >= 50) return { title: "Good Effort! 👍", msg: "Keep studying to sharpen your accuracy.", color: "text-amber-600 bg-amber-50 border-amber-100" };
    return { title: "Keep Practicing! 📚", msg: "Review the answers below to learn the core concepts.", color: "text-rose-600 bg-rose-50 border-rose-100" };
  };

  const perf = getPerformanceMessage(percentage);

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Premium Result Summary Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-3xl border border-slate-200 shadow-premium overflow-hidden bg-white"
      >
        <div className="bg-slate-900 text-white p-8 text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-300 via-slate-900 to-black" />
          
          <div className="relative z-10 space-y-4">
            <div className="w-16 h-16 bg-white/10 border border-white/20 rounded-2xl flex items-center justify-center mx-auto text-amber-400">
              <Trophy className="w-8 h-8" />
            </div>
            
            <div className="space-y-1">
              <span className="text-[10px] font-extrabold tracking-widest text-indigo-300 uppercase">Mock Exam Complete</span>
              <h2 className="text-xl font-black">{subjectName}</h2>
            </div>

            <div className="flex justify-center items-baseline space-x-2">
              <span className="text-5xl font-black">{percentage}%</span>
              <span className="text-xs font-extrabold text-slate-400">Accuracy</span>
            </div>

            <div className={`inline-block px-5 py-2.5 rounded-2xl border text-xs font-bold leading-relaxed ${perf.color}`}>
              <div className="font-extrabold text-sm">{perf.title}</div>
              <div className="text-[10px] opacity-90 mt-0.5">{perf.msg}</div>
            </div>
          </div>
        </div>

        <div className="p-6 grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50 border-t border-slate-100">
          <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm text-center">
            <div className="text-[10px] font-extrabold text-slate-400 uppercase mb-1">Score</div>
            <div className="text-lg font-black text-slate-800">{score} pts</div>
          </div>
          <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm text-center">
            <div className="text-[10px] font-extrabold text-slate-400 uppercase mb-1">Correct</div>
            <div className="text-lg font-black text-emerald-600 flex items-center justify-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>{correctAnswers}/{questions.length}</span>
            </div>
          </div>
          <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm text-center">
            <div className="text-[10px] font-extrabold text-slate-400 uppercase mb-1">Incorrect</div>
            <div className="text-lg font-black text-rose-600 flex items-center justify-center space-x-1.5">
              <XCircle className="w-4 h-4" />
              <span>{questions.length - correctAnswers}</span>
            </div>
          </div>
          <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm text-center">
            <div className="text-[10px] font-extrabold text-slate-400 uppercase mb-1">Time Spent</div>
            <div className="text-lg font-black text-slate-800 flex items-center justify-center space-x-1.5">
              <Clock className="w-4 h-4 text-slate-400" />
              <span>{formatTimeSpent(timeSpent)}</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Review Section */}
      <div className="space-y-4">
        <h3 className="font-extrabold text-sm text-slate-800">Detailed Answer Review</h3>
        
        <div className="space-y-3">
          {questions.map((q, idx) => {
            const userAns = selectedAnswers[q.id];
            const isCorrect = userAns === q.correctAnswer;
            const isOpen = expandedQuestionId === q.id;

            return (
              <div 
                key={q.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
              >
                {/* Header Collapsible Trigger */}
                <button
                  onClick={() => toggleExpand(q.id)}
                  className="w-full p-5 text-left flex items-start justify-between gap-4 font-bold text-xs hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-start space-x-3">
                    <span className="mt-0.5 flex-shrink-0">
                      {isCorrect ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <XCircle className="w-5 h-5 text-rose-600" />
                      )}
                    </span>
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-extrabold text-[10px] text-slate-400">Question {idx + 1}</span>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-extrabold uppercase ${
                          q.difficulty === "Easy"
                            ? "bg-emerald-50 text-emerald-600"
                            : q.difficulty === "Medium"
                            ? "bg-amber-50 text-amber-600"
                            : "bg-rose-50 text-rose-600"
                        }`}>
                          {q.difficulty}
                        </span>
                      </div>
                      <h4 className="font-extrabold text-slate-800 leading-relaxed pr-2">{q.question}</h4>
                    </div>
                  </div>
                  <span className="text-slate-400 mt-1 flex-shrink-0">
                    {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </span>
                </button>

                {/* Expanded content */}
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: "auto" }}
                      exit={{ height: 0 }}
                      className="overflow-hidden border-t border-slate-100 bg-slate-50/50"
                    >
                      <div className="p-5 space-y-4">
                        {/* Options mapping */}
                        <div className="space-y-2">
                          {q.options.map((option, oIdx) => {
                            const isUserSelected = userAns === oIdx;
                            const isCorrectOption = q.correctAnswer === oIdx;

                            let optStyle = "bg-white border-slate-200 text-slate-600";
                            if (isCorrectOption) {
                              optStyle = "bg-emerald-50 border-emerald-400 text-emerald-800 font-bold";
                            } else if (isUserSelected && !isCorrect) {
                              optStyle = "bg-rose-50 border-rose-400 text-rose-800 font-bold";
                            }

                            return (
                              <div
                                key={oIdx}
                                className={`p-3 rounded-xl border text-[11px] leading-relaxed flex items-center justify-between ${optStyle}`}
                              >
                                <span>{option}</span>
                                {isCorrectOption && (
                                  <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-100/50 px-2 py-0.5 rounded">
                                    Correct Answer
                                  </span>
                                )}
                                {isUserSelected && !isCorrect && (
                                  <span className="text-[10px] font-extrabold text-rose-700 bg-rose-100/50 px-2 py-0.5 rounded">
                                    Your Answer
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        {/* Explanation block */}
                        {q.explanation && (
                          <div className="p-4 rounded-xl bg-indigo-50/40 border border-indigo-100/40 flex items-start space-x-3 text-xs leading-relaxed text-indigo-900">
                            <Lightbulb className="w-4 h-4 text-indigo-500 mt-0.5 flex-shrink-0" />
                            <div>
                              <span className="font-extrabold text-[10px] text-indigo-700 uppercase block mb-1">Explanation</span>
                              <span>{q.explanation}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
        <Button
          onClick={onRetake}
          icon={RotateCcw}
          className="w-full sm:w-auto px-8 py-5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-xs font-bold font-black animate-pulse"
        >
          Retake Exam
        </Button>
        <Button
          onClick={exportToPDF}
          icon={FileDown}
          variant="outline"
          className="w-full sm:w-auto px-8 py-5 rounded-2xl border-indigo-200 text-indigo-600 hover:bg-indigo-50/20 text-xs font-bold shadow-sm"
        >
          Export PDF Report
        </Button>
        <Button
          onClick={onExit}
          icon={Home}
          variant="outline"
          className="w-full sm:w-auto px-8 py-5 rounded-2xl border-slate-200 hover:bg-slate-50 text-xs font-bold"
        >
          Back to Course Selection
        </Button>
      </div>
    </div>
  );
}
