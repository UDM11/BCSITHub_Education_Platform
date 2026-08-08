import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { apiClient } from '../lib/apiClient';
import { UploadCloud, FileText, ArrowLeft, ShieldCheck } from 'lucide-react';
import { Card, CardContent } from '../components/ui/Card';
import { motion } from 'framer-motion';
import { semestersData } from '../data/notesData';
import { specializationData } from '../data/syllabusData';

const colleges = [
  { value: "Pokhara University", label: "Pokhara University" },
  { value: "Ace Institute of Management", label: "Ace Institute of Management" },
  { value: "SAIM College", label: "SAIM College" },
  { value: "Apollo International College", label: "Apollo International College" },
  { value: "Quest International College", label: "Quest International College" },
  { value: "Shubhashree College of Management", label: "Shubhashree College of Management" },
  { value: "Liberty College", label: "Liberty College" },
  { value: "Uniglobe College", label: "Uniglobe College" },
  { value: "Medhavi College", label: "Medhavi College" },
  { value: "Crimson College of Technology", label: "Crimson College of Technology" },
  { value: "Rajdhani Model College", label: "Rajdhani Model College" },
  { value: "Excel Business College", label: "Excel Business College" },
  { value: "Malpi International College", label: "Malpi International College" },
  { value: "Nobel College", label: "Nobel College" },
  { value: "Boston International College", label: "Boston International College" },
  { value: "Pokhara College of Management", label: "Pokhara College of Management" },
  { value: "Apex College", label: "Apex College" },
  { value: "Other", label: "Other College" },
];

const UploadPaper: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    semester: '',
    subject: '',
    customSubject: '',
    examType: '',
    season: '',
    year: '',
    college: '',
    file: null as File | null
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const next = { ...prev, [name]: value };
      if (name === 'semester') {
        next.subject = '';
        next.customSubject = '';
      }
      if (name === 'subject' && value !== 'other') {
        next.customSubject = '';
      }
      return next;
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        file
      }));
    }
  };

  const getSubjectsForSemester = (semId: string) => {
    if (!semId) return [];
    const sem = semestersData.find(s => s.id.toString() === semId);
    if (!sem) return [];

    // Get base subjects
    const baseSubjects = sem.subjects
      .filter(sub => sub.courseName !== "Specialization" && !sub.courseName.startsWith("Concentration"))
      .map(sub => sub.courseName);

    // If semester has specialization/concentration courses, add the respective specialization courses
    const additionalSubjects: string[] = [];
    if (semId === "5" || semId === "6" || semId === "7" || semId === "8") {
      Object.values(specializationData).forEach(spec => {
        spec.courses.forEach(c => {
          if (!additionalSubjects.includes(c.name)) {
            additionalSubjects.push(c.name);
          }
        });
      });
    }

    const allSubjects = [...baseSubjects, ...additionalSubjects].sort();
    return allSubjects;
  };

  const years = Array.from({ length: 10 }, (_, i) => {
    return (new Date().getFullYear() - i).toString();
  });

  const displaySubject = formData.subject === "other" ? formData.customSubject : formData.subject;
  const generatedTitle = displaySubject && formData.examType && formData.year
    ? `${displaySubject} ${formData.season ? formData.season + ' ' : ''}${formData.examType} Exam ${formData.year}`
    : "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Please log in to upload papers');
      return;
    }

    const finalSubject = formData.subject === 'other' ? formData.customSubject.trim() : formData.subject;
    const finalTitle = generatedTitle;

    if (!formData.semester) {
      toast.error('Please select a semester');
      return;
    }
    if (!finalSubject) {
      toast.error('Please select or enter a subject');
      return;
    }
    if (!formData.examType) {
      toast.error('Please select an exam type');
      return;
    }
    if (!formData.year) {
      toast.error('Please select a year');
      return;
    }
    if (!formData.college) {
      toast.error('Please select a college');
      return;
    }
    if (!formData.file) {
      toast.error('Please select a file to upload');
      return;
    }

    setIsUploading(true);

    try {
      const payload = new FormData();
      payload.append('title', finalTitle);
      payload.append('subject', finalSubject);
      payload.append('semester', formData.semester);
      payload.append('exam_type', formData.examType.toLowerCase());
      payload.append('college', formData.college);
      if (formData.season) {
        payload.append('session', formData.season);
      }
      payload.append('file', formData.file);

      await apiClient.postMultipart('/papers/upload', payload);

      toast.success('Paper uploaded successfully! It will be reviewed by admin.');
      navigate('/teacher-dashboard');
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Failed to upload paper');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/30 py-12 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
        <motion.div 
          className="absolute top-20 left-10 w-64 h-64 bg-indigo-200/20 rounded-full blur-3xl animate-pulse"
          animate={{ x: [0, 40, 0], y: [0, -20, 0] }}
          transition={{ duration: 10, repeat: Infinity }}
        />
        <motion.div 
          className="absolute bottom-20 right-10 w-80 h-80 bg-purple-200/20 rounded-full blur-3xl"
          animate={{ x: [0, -30, 0], y: [0, 30, 0] }}
          transition={{ duration: 12, repeat: Infinity }}
        />
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Navigation */}
        <motion.div 
          className="mb-6"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center text-slate-655 hover:text-purple-650 transition-colors text-sm font-semibold bg-transparent border-0 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Back to Dashboard
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card hover={false} className="border border-slate-105 shadow-premium bg-white/90 backdrop-blur-md rounded-2xl overflow-hidden">
            <CardContent className="p-8">
              <div className="text-center mb-8">
                <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-650 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md">
                  <UploadCloud className="w-7 h-7 text-white" />
                </div>
                <h1 className="text-2xl font-extrabold text-slate-805 mb-2 tracking-tight">Upload Past Paper</h1>
                <p className="text-xs font-bold text-slate-455 uppercase tracking-widest">Share exam resources with the student community</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-555 mb-1.5 uppercase tracking-wider">
                      Semester *
                    </label>
                    <select
                      name="semester"
                      value={formData.semester}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs bg-white text-slate-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 font-bold transition-all"
                    >
                      <option value="">Select Semester</option>
                      {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                        <option key={sem} value={sem.toString()}>Semester {sem}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-555 mb-1.5 uppercase tracking-wider">
                      Subject Name *
                    </label>
                    <select
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      required
                      disabled={!formData.semester}
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs bg-white text-slate-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 font-bold transition-all disabled:bg-slate-50 disabled:text-slate-400"
                    >
                      <option value="">{formData.semester ? "Select Subject" : "Select Semester First"}</option>
                      {formData.semester && getSubjectsForSemester(formData.semester).map(sub => (
                        <option key={sub} value={sub}>{sub}</option>
                      ))}
                      {formData.semester && <option value="other">Other / Custom Subject</option>}
                    </select>
                  </div>
                </div>

                {formData.subject === 'other' && (
                  <div>
                    <label className="block text-[10px] font-bold text-slate-550 mb-1.5 uppercase tracking-wider">
                      Custom Subject Name *
                    </label>
                    <input
                      type="text"
                      name="customSubject"
                      value={formData.customSubject}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs bg-white text-slate-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 font-semibold transition-all"
                      placeholder="e.g., Database Management System"
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-555 mb-1.5 uppercase tracking-wider">
                      Exam Type *
                    </label>
                    <select
                      name="examType"
                      value={formData.examType}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs bg-white text-slate-705 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 font-bold transition-all"
                    >
                      <option value="">Select Type</option>
                      <option value="Final">Final Exam</option>
                      <option value="Midterm">Midterm Exam</option>
                      <option value="Quiz">Quiz</option>
                      <option value="Assignment">Assignment</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-555 mb-1.5 uppercase tracking-wider">
                      Session
                    </label>
                    <select
                      name="season"
                      value={formData.season}
                      onChange={handleInputChange}
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs bg-white text-slate-705 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 font-bold transition-all"
                    >
                      <option value="">No Session</option>
                      <option value="Spring">Spring</option>
                      <option value="Fall">Fall</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-555 mb-1.5 uppercase tracking-wider">
                      Year *
                    </label>
                    <select
                      name="year"
                      value={formData.year}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs bg-white text-slate-750 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 font-bold transition-all"
                    >
                      <option value="">Select Year</option>
                      {years.map(y => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-555 mb-1.5 uppercase tracking-wider">
                      Affiliated College *
                    </label>
                    <select
                      name="college"
                      value={formData.college}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs bg-white text-slate-705 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 font-bold transition-all"
                    >
                      <option value="">Select College</option>
                      {colleges.map(c => (
                        <option key={c.value} value={c.value}>{c.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {generatedTitle && (
                  <div className="p-4 rounded-2xl bg-indigo-50/40 border border-indigo-100/50 mt-2 text-left">
                    <span className="block text-[9px] font-bold text-indigo-500 uppercase tracking-wider mb-1">Generated Paper Title Preview</span>
                    <p className="text-sm font-extrabold text-slate-800">{generatedTitle}</p>
                  </div>
                )}

                <div>
                  <label className="block text-[10px] font-bold text-slate-555 mb-1.5 uppercase tracking-wider">
                    Select File Resource *
                  </label>
                  <div className="border-2 border-dashed border-indigo-150 hover:border-indigo-400 bg-indigo-50/5 hover:bg-indigo-50/10 rounded-2xl p-6 text-center transition-colors">
                    <input
                      type="file"
                      onChange={handleFileChange}
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      required
                      className="hidden"
                      id="file-upload"
                    />
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <div className="space-y-2">
                        <UploadCloud className="w-10 h-10 text-slate-400 mx-auto" />
                        <div className="text-xs font-semibold text-slate-600">
                          <span className="text-indigo-650 hover:text-indigo-800 underline">Click to browse file</span> or drag & drop here
                        </div>
                        <p className="text-[10px] font-bold text-slate-455 uppercase tracking-wide">PDF, DOC, DOCX, JPG, PNG (Max 10MB)</p>
                      </div>
                    </label>
                    {formData.file && (
                      <div className="mt-4 p-3 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-center gap-2">
                        <FileText className="w-4 h-4 text-emerald-650" />
                        <span className="text-xs font-bold text-emerald-805">
                          Selected: {formData.file.name}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-4 pt-4 border-t border-slate-50">
                  <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="flex-1 py-3 border border-slate-205 text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-xl font-bold text-xs transition-all duration-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isUploading}
                    className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-650 hover:brightness-110 text-white font-bold py-3 rounded-xl shadow-md border-0 text-xs flex items-center justify-center gap-1.5 transition-all"
                  >
                    {isUploading ? (
                      <>
                        <div className="animate-spin rounded-full h-4.5 w-4.5 border-2 border-white border-t-transparent"></div>
                        <span>Uploading...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4 text-yellow-350" />
                        <span>Upload Paper</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default UploadPaper;