import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calculator, Download, BookOpen, Award, TrendingUp, GraduationCap, FileText, BarChart3, Target, Sparkles, ChevronDown, ChevronUp, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { semesterData, specializationData } from '../data/syllabusData';
import { useAuth } from '../context/AuthContext';
import { useProfile } from '../context/ProfileContext';
import jsPDF from 'jspdf';



interface SubjectGrade {
  courseCode: string;
  courseName: string;
  credits: number;
  marks: number;
  grade: string;
  gradePoints: number;
}

interface SemesterResult {
  semesterId: number;
  semesterName: string;
  subjects: SubjectGrade[];
  sgpa: number;
  totalCredits: number;
}

// Convert syllabusData to match the expected format
const convertSyllabusData = () => {
  return Object.entries(semesterData).map(([id, data]) => ({
    id: parseInt(id),
    name: data.title,
    subjects: data.courses.map(course => ({
      courseCode: course.code || '',
      courseName: course.name,
      credits: course.credits
    }))
  }));
};

const semestersData = convertSyllabusData();

// Get specialization options
const getSpecializationOptions = () => {
  return Object.entries(specializationData).map(([key, data]) => ({
    value: key,
    label: data.title,
    courses: data.courses
  }));
};

export function CGPACalculator() {
  const { user } = useAuth();
  const { profile } = useProfile();
  const [selectedSemesters, setSelectedSemesters] = useState<number[]>([]);
  const [semesterResults, setSemesterResults] = useState<SemesterResult[]>([]);
  const [cgpa, setCgpa] = useState<number | null>(null);
  const [totalCredits, setTotalCredits] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [expandedSemester, setExpandedSemester] = useState<number | null>(null);
  const [concentrationChoices, setConcentrationChoices] = useState<{ [key: string]: string }>({});
  const [guestName, setGuestName] = useState('');
  const [guestCollege, setGuestCollege] = useState('');

  const getGradeFromMarks = (marks: number): { grade: string; gradePoints: number } => {
    if (marks >= 90) return { grade: 'A', gradePoints: 4.0 };
    if (marks >= 85) return { grade: 'A-', gradePoints: 3.7 };
    if (marks >= 80) return { grade: 'B+', gradePoints: 3.3 };
    if (marks >= 75) return { grade: 'B', gradePoints: 3.0 };
    if (marks >= 70) return { grade: 'B-', gradePoints: 2.7 };
    if (marks >= 65) return { grade: 'C+', gradePoints: 2.3 };
    if (marks >= 60) return { grade: 'C', gradePoints: 2.0 };
    if (marks >= 55) return { grade: 'C-', gradePoints: 1.7 };
    if (marks >= 50) return { grade: 'D+', gradePoints: 1.3 };
    if (marks >= 45) return { grade: 'D', gradePoints: 1.0 };
    return { grade: 'F', gradePoints: 0.0 };
  };

  const initializeSemesterGrades = (semesterId: number) => {
    const semester = semestersData.find(s => s.id === semesterId);
    if (!semester) return [];

    return semester.subjects.map(subject => ({
      courseCode: subject.courseCode,
      courseName: subject.courseName === 'Specialization Course' || subject.courseName.includes('Concentration') 
        ? concentrationChoices[`${semesterId}-${subject.courseName}`] || subject.courseName
        : subject.courseName,
      credits: subject.credits,
      marks: 0,
      grade: 'F',
      gradePoints: 0.0
    }));
  };

  const handleSemesterToggle = (semesterId: number) => {
    if (selectedSemesters.includes(semesterId)) {
      setSelectedSemesters(selectedSemesters.filter(id => id !== semesterId));
      setSemesterResults(semesterResults.filter(result => result.semesterId !== semesterId));
    } else {
      setSelectedSemesters([...selectedSemesters, semesterId]);
      const semester = semestersData.find(s => s.id === semesterId);
      if (semester) {
        const newResult: SemesterResult = {
          semesterId,
          semesterName: semester.name,
          subjects: initializeSemesterGrades(semesterId),
          sgpa: 0,
          totalCredits: semester.subjects.reduce((sum, s) => sum + s.credits, 0)
        };
        setSemesterResults([...semesterResults, newResult]);
      }
    }
  };

  const updateSubjectMarks = (semesterId: number, subjectIndex: number, marks: number) => {
    const { grade, gradePoints: points } = getGradeFromMarks(marks);
    
    setSemesterResults(semesterResults.map(result => {
      if (result.semesterId === semesterId) {
        const updatedSubjects = result.subjects.map((subject, index) => 
          index === subjectIndex 
            ? { ...subject, marks, grade, gradePoints: points }
            : subject
        );
        return { ...result, subjects: updatedSubjects };
      }
      return result;
    }));
  };

  const updateConcentrationSubject = (key: string, value: string) => {
    setConcentrationChoices({ ...concentrationChoices, [key]: value });
    
    // Update existing semester results if they contain this concentration
    setSemesterResults(semesterResults.map(result => {
      const updatedSubjects = result.subjects.map(subject => {
        if (subject.courseName.includes('Concentration') || subject.courseName === 'Specialization') {
          const subjectKey = `${result.semesterId}-${subject.courseName}`;
          if (key === subjectKey) {
            return { ...subject, courseName: value };
          }
        }
        return subject;
      });
      return { ...result, subjects: updatedSubjects };
    }));
  };

  const calculateResults = () => {
    let totalGradePoints = 0;
    let totalCreditHours = 0;

    const updatedResults = semesterResults.map(result => {
      let semesterGradePoints = 0;
      let semesterCredits = 0;

      result.subjects.forEach(subject => {
        const points = subject.gradePoints * subject.credits;
        semesterGradePoints += points;
        semesterCredits += subject.credits;
        totalGradePoints += points;
        totalCreditHours += subject.credits;
      });

      const sgpa = semesterCredits > 0 ? semesterGradePoints / semesterCredits : 0;
      return { ...result, sgpa: Math.round(sgpa * 100) / 100 };
    });

    setSemesterResults(updatedResults);
    const calculatedCGPA = totalCreditHours > 0 ? totalGradePoints / totalCreditHours : 0;
    setCgpa(Math.round(calculatedCGPA * 100) / 100);
    setTotalCredits(totalCreditHours);
    setShowResults(true);
  };

  const downloadResults = () => {
    try {
      generatePDFReport();
    } catch (error) {
      console.error('Error generating PDF:', error);
      // Fallback to text download
      downloadTextReport();
    }
  };

  const downloadTextReport = () => {
    const content = generateResultsContent();
    if (content) {
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `BCSIT_Report_${user?.name?.replace(/\s+/g, '_') || 'Student'}_${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const generatePDFReport = () => {
    if (!cgpa || semesterResults.length === 0) {
      alert('Please calculate CGPA first before downloading the report.');
      return;
    }
    
    try {
      const doc = new jsPDF();
      let yPos = 20;

      // Header
      doc.setFontSize(18);
      doc.text('BCSIT ACADEMIC TRANSCRIPT', 105, yPos, { align: 'center' });
      yPos += 10;
      doc.setFontSize(12);
      doc.text('Pokhara University', 105, yPos, { align: 'center' });
      yPos += 20;

      // Student Information
      doc.setFontSize(12);
      doc.text('Student Information:', 20, yPos);
      yPos += 10;
      doc.setFontSize(10);
      doc.text(`Name: ${user?.name || guestName || 'N/A'}`, 20, yPos);
      yPos += 8;
      doc.text(`College: ${profile?.college || guestCollege || 'N/A'}`, 20, yPos);
      yPos += 8;
      doc.text(`Program: Bachelor of Computer Science and Information Technology (BCSIT)`, 20, yPos);
      yPos += 8;
      doc.text(`Overall CGPA: ${cgpa?.toFixed(2) || '0.00'}`, 20, yPos);
      yPos += 8;
      doc.text(`Total Credits: ${totalCredits}`, 20, yPos);
      yPos += 20;

      // Semester Results
      semesterResults.forEach((result) => {
        if (yPos > 250) {
          doc.addPage();
          yPos = 20;
        }

        doc.setFontSize(14);
        doc.text(`${result.semesterName} - SGPA: ${result.sgpa.toFixed(2)}`, 20, yPos);
        yPos += 15;

        // Table headers
        doc.setFontSize(8);
        doc.text('S.N.', 20, yPos);
        doc.text('Code', 35, yPos);
        doc.text('Subject Name', 60, yPos);
        doc.text('Credits', 130, yPos);
        doc.text('Marks', 150, yPos);
        doc.text('Grade', 170, yPos);
        doc.text('Points', 185, yPos);
        yPos += 8;

        // Draw line
        doc.line(20, yPos - 2, 200, yPos - 2);

        // Subject data
        result.subjects.forEach((subject, idx) => {
          if (yPos > 270) {
            doc.addPage();
            yPos = 20;
          }
          
          doc.text((idx + 1).toString(), 20, yPos);
          doc.text(subject.courseCode || 'N/A', 35, yPos);
          doc.text(subject.courseName.substring(0, 25), 60, yPos);
          doc.text(subject.credits.toString(), 130, yPos);
          doc.text(subject.marks.toString(), 150, yPos);
          doc.text(subject.grade, 170, yPos);
          doc.text(subject.gradePoints.toFixed(1), 185, yPos);
          yPos += 6;
        });

        yPos += 10;
      });

      // Footer
      doc.setFontSize(8);
      doc.text('Generated by BCSITHub CGPA Calculator', 105, 280, { align: 'center' });

      // Save PDF
      const fileName = `BCSIT_Report_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
    } catch (error) {
      console.error('PDF Error:', error);
      alert('PDF generation failed. Please try again.');
    }
  };

  const getGradeFromGPA = (gpa: number): string => {
    if (gpa >= 3.7) return 'A';
    if (gpa >= 3.3) return 'B+';
    if (gpa >= 3.0) return 'B';
    if (gpa >= 2.7) return 'B-';
    if (gpa >= 2.3) return 'C+';
    if (gpa >= 2.0) return 'C';
    if (gpa >= 1.7) return 'C-';
    if (gpa >= 1.3) return 'D+';
    if (gpa >= 1.0) return 'D';
    return 'F';
  };

  const getRemarks = (gradePoints: number): string => {
    if (gradePoints >= 3.7) return 'Excellent';
    if (gradePoints >= 3.0) return 'Good';
    if (gradePoints >= 2.0) return 'Satisfactory';
    if (gradePoints >= 1.0) return 'Pass';
    return 'Fail';
  };

  const generateResultsContent = () => {
    if (!cgpa || semesterResults.length === 0) {
      alert('Please calculate CGPA first before downloading the report.');
      return '';
    }
    
    let content = `BCSIT CGPA CALCULATION REPORT\n`;
    content += `Generated on: ${new Date().toLocaleDateString()}\n`;
    content += `===========================================\n\n`;
    
    semesterResults.forEach(result => {
      content += `${result.semesterName}\n`;
      content += `SGPA: ${result.sgpa}\n`;
      content += `Credits: ${result.totalCredits}\n`;
      content += `Subjects:\n`;
      result.subjects.forEach(subject => {
        content += `  ${subject.courseCode} - ${subject.courseName}: ${subject.marks}% (${subject.grade}) - ${subject.credits} credits\n`;
      });
      content += `\n`;
    });
    
    content += `===========================================\n`;
    content += `OVERALL CGPA: ${cgpa}\n`;
    content += `Total Credits: ${totalCredits}\n`;
    content += `Total Subjects: ${semesterResults.reduce((sum, result) => sum + result.subjects.length, 0)}\n`;
    content += `Performance: ${getPerformanceText(cgpa || 0)}\n`;
    
    return content;
  };

  const getGradeColor = (gpa: number) => {
    if (gpa >= 3.7) return 'text-emerald-600';
    if (gpa >= 3.0) return 'text-blue-600';
    if (gpa >= 2.0) return 'text-amber-600';
    return 'text-red-600';
  };

  const getPerformanceText = (gpa: number) => {
    if (gpa >= 3.7) return 'Excellent Performance';
    if (gpa >= 3.0) return 'Good Performance';
    if (gpa >= 2.0) return 'Satisfactory Performance';
    return 'Needs Improvement';
  };

  const getGradientColor = (gpa: number) => {
    if (gpa >= 3.7) return 'from-emerald-500 to-green-600';
    if (gpa >= 3.0) return 'from-blue-500 to-indigo-600';
    if (gpa >= 2.0) return 'from-amber-500 to-orange-600';
    return 'from-red-500 to-pink-600';
  };

  return (
    <div className="min-h-screen bg-slate-50/30">
      {/* Header */}
      <div className="bg-white/85 backdrop-blur-md border-b border-slate-100 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4.5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <Link to="/" className="flex items-center text-slate-600 hover:text-indigo-600 transition-colors text-sm font-semibold">
                <ArrowLeft className="w-4 h-4 mr-1.5" />
                Back to Home
              </Link>
              <div className="h-4 w-px bg-slate-200" />
              <div className="flex items-center">
                <Calculator className="w-5 h-5 mr-2 text-indigo-600" />
                <h1 className="text-lg font-bold text-slate-800">CGPA Calculator</h1>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-900 text-white overflow-hidden">
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
        
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center bg-white/10 backdrop-blur-sm rounded-full px-5 py-1.5 mb-6 border border-white/10">
              <Calculator className="w-5 h-5 text-yellow-300 mr-2" />
              <span className="text-sm font-semibold text-yellow-50">Academic Tools</span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 leading-tight bg-gradient-to-r from-white via-slate-100 to-indigo-100 bg-clip-text text-transparent">
              Advanced CGPA Calculator
            </h1>
            <p className="text-lg sm:text-xl text-indigo-100 mb-10 max-w-3xl mx-auto px-4 sm:px-0">
              Professional Pokhara University grade calculation with semester analysis and custom PDF reports.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* User Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <Card hover={false} className="border border-slate-100 shadow-premium bg-gradient-to-r from-slate-50 to-indigo-50/20">
            <CardContent className="p-8">
              <div className="flex items-center mb-6">
                <GraduationCap className="w-6 h-6 mr-3 text-indigo-600" />
                <h2 className="text-xl font-bold text-slate-800">Student Profile Information</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Student Name
                  </label>
                  {user ? (
                    <div className="px-4 py-3 bg-white rounded-xl border border-slate-150 text-slate-800 font-semibold shadow-sm text-sm">
                      {user.name}
                    </div>
                  ) : (
                    <input
                      type="text"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      placeholder="Enter your name"
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all duration-300 bg-white text-slate-800 placeholder:text-slate-400"
                    />
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    College Name
                  </label>
                  {user ? (
                    <div className="px-4 py-3 bg-white rounded-xl border border-slate-150 text-slate-800 font-semibold shadow-sm text-sm">
                      {profile?.college || 'Please update your profile'}
                    </div>
                  ) : (
                    <input
                      type="text"
                      value={guestCollege}
                      onChange={(e) => setGuestCollege(e.target.value)}
                      placeholder="Enter your college name"
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all duration-300 bg-white text-slate-800 placeholder:text-slate-400"
                    />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Semester Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-8"
        >
          <Card hover={false} className="border border-slate-100 shadow-premium bg-white">
            <CardContent className="p-8">
              <div className="flex items-center mb-6">
                <BookOpen className="w-6 h-6 mr-3 text-indigo-600" />
                <h2 className="text-xl font-bold text-slate-800">Select Semesters to Calculate</h2>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {semestersData.map((semester) => (
                  <motion.div
                    key={semester.id}
                    whileHover={{ y: -3 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <label className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                      selectedSemesters.includes(semester.id)
                        ? 'bg-indigo-50/50 border-indigo-500 text-indigo-700 font-bold'
                        : 'bg-slate-50/50 border-slate-100 hover:border-slate-250 text-slate-700 font-medium'
                    }`}>
                      <input
                        type="checkbox"
                        checked={selectedSemesters.includes(semester.id)}
                        onChange={() => handleSemesterToggle(semester.id)}
                        className="w-4 h-4 text-indigo-600 border-slate-350 rounded focus:ring-indigo-500"
                      />
                      <span className="ml-3 text-sm">{semester.name}</span>
                    </label>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Specialization Subjects Selection */}
        {selectedSemesters.some(id => {
          const semester = semestersData.find(s => s.id === id);
          return semester?.subjects.some(s => s.courseName === 'Specialization Course' || s.courseName.includes('Concentration'));
        }) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <Card hover={false} className="border border-slate-100 shadow-premium bg-gradient-to-r from-purple-50 to-pink-50/20">
              <CardContent className="p-8">
                <div className="flex items-center mb-6">
                  <Target className="w-6 h-6 mr-3 text-purple-600" />
                  <h2 className="text-xl font-bold text-slate-800">Choose Specialization Subjects</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {selectedSemesters.map(semesterId => {
                    const semester = semestersData.find(s => s.id === semesterId);
                    return semester?.subjects.filter(s => s.courseName === 'Specialization Course' || s.courseName.includes('Concentration')).map((subject, index) => {
                      const key = `${semesterId}-${subject.courseName}`;
                      const isSpecialization = subject.courseName === 'Specialization Course';
                      
                      return (
                        <div key={key} className="space-y-2">
                          <label className="block text-sm font-semibold text-slate-700">
                            {semester.name} - {subject.courseName}
                          </label>
                          
                          {isSpecialization ? (
                            <select
                              value={concentrationChoices[key] || ''}
                              onChange={(e) => updateConcentrationSubject(key, e.target.value)}
                              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 transition-all duration-300 text-slate-800"
                            >
                              <option value="">Select a specialization</option>
                              {getSpecializationOptions().map(spec => (
                                <option key={spec.value} value={spec.label}>{spec.label}</option>
                              ))}
                            </select>
                          ) : (
                            <select
                              value={concentrationChoices[key] || ''}
                              onChange={(e) => updateConcentrationSubject(key, e.target.value)}
                              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 transition-all duration-300 text-slate-800"
                            >
                              <option value="">Select a concentration course</option>
                              {getSpecializationOptions().map(spec => 
                                spec.courses.map(course => (
                                  <option key={course.name} value={course.name}>{course.name}</option>
                                ))
                              )}
                            </select>
                          )}
                        </div>
                      );
                    });
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Grade Input for Selected Semesters */}
        <AnimatePresence>
          {semesterResults.map((result, index) => (
            <motion.div
              key={result.semesterId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.6, delay: index * 0.05 }}
              className="mb-6"
            >
              <Card hover={false} className="border border-slate-100 shadow-premium bg-white">
                <CardContent className="p-8">
                  <div 
                    className="flex items-center justify-between cursor-pointer mb-6 border-b border-slate-50 pb-4"
                    onClick={() => setExpandedSemester(expandedSemester === result.semesterId ? null : result.semesterId)}
                  >
                    <div className="flex items-center">
                      <BookOpen className="w-5 h-5 mr-3 text-indigo-600 animate-pulse" />
                      <h3 className="text-lg font-bold text-slate-850">{result.semesterName}</h3>
                      <span className="ml-4 px-3 py-1 bg-indigo-50 border border-indigo-100/50 text-indigo-600 rounded-full text-xs font-bold">
                        {result.totalCredits} Credits
                      </span>
                    </div>
                    {expandedSemester === result.semesterId ? 
                      <ChevronUp className="w-5 h-5 text-slate-400" /> : 
                      <ChevronDown className="w-5 h-5 text-slate-400" />
                    }
                  </div>
                  
                  <AnimatePresence>
                    {expandedSemester === block_result_semester_id(result.semesterId) && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-4"
                      >
                        {result.subjects.map((subject, subjectIndex) => (
                          <motion.div
                            key={subjectIndex}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: subjectIndex * 0.03 }}
                            className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 bg-slate-50/40 hover:bg-slate-50 rounded-xl border border-slate-150 transition-all duration-300"
                          >
                            <div className="md:col-span-2">
                              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                                Subject
                              </label>
                              <div className="text-sm font-bold text-slate-750">
                                {subject.courseCode && <span className="text-slate-400 text-xs font-semibold mr-1">[{subject.courseCode}]</span>}{subject.courseName}
                              </div>
                            </div>
                            
                            <div>
                              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                                Credits
                              </label>
                              <div className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-center font-bold text-xs inline-block">
                                {subject.credits} Credits
                              </div>
                            </div>
                            
                            <div>
                              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                                Marks (0-100)
                              </label>
                              <input
                                type="number"
                                min="0"
                                max="100"
                                value={subject.marks || ''}
                                onChange={(e) => updateSubjectMarks(result.semesterId, subjectIndex, parseInt(e.target.value) || 0)}
                                placeholder="Enter marks"
                                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all duration-300 text-slate-800"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                                Grade
                              </label>
                              <div className={`px-3 py-1.5 rounded-lg text-center font-bold text-white text-xs ${
                                subject.gradePoints >= 3.7 ? 'bg-emerald-500 shadow-sm shadow-emerald-500/10' :
                                subject.gradePoints >= 3.0 ? 'bg-indigo-500 shadow-sm shadow-indigo-500/10' :
                                subject.gradePoints >= 2.0 ? 'bg-amber-500 shadow-sm shadow-amber-500/10' :
                                subject.gradePoints >= 1.0 ? 'bg-orange-500 shadow-sm shadow-orange-500/10' : 'bg-rose-500 shadow-sm shadow-rose-500/10'
                              }`}>
                                {subject.grade}
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Calculate Button */}
        {semesterResults.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-10"
          >
            <Button
              onClick={calculateResults}
              className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-900 text-white hover:brightness-110 font-bold px-12 py-4 rounded-xl shadow-lg shadow-indigo-500/20 transition-all duration-300 border-0 flex items-center justify-center gap-2.5 mx-auto"
            >
              <Sparkles className="w-5 h-5 text-yellow-300" />
              Calculate CGPA
            </Button>
          </motion.div>
        )}

        {/* Results Display */}
        <AnimatePresence>
          {showResults && cgpa !== null && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.6 }}
              className="mb-8"
            >
              <Card hover={false} className={`shadow-2xl border-0 bg-gradient-to-br ${getGradientColor(block_cgpa(cgpa))} text-white overflow-hidden rounded-2xl`}>
                <CardContent className="p-8 relative">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16" />
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12" />
                  
                  <div className="relative z-10 text-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.6, delay: 0.2 }}
                    >
                      <Award className="w-16 h-16 mx-auto mb-6 text-yellow-300" />
                    </motion.div>
                    
                    <h3 className="text-2xl font-bold mb-3 text-white">Your Cumulative GPA Results</h3>
                    
                    <motion.div
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.8, delay: 0.4 }}
                      className="text-8xl font-bold mb-3 text-yellow-300 tracking-tight"
                    >
                      {cgpa.toFixed(2)}
                    </motion.div>
                    
                    <p className="text-xl font-bold mb-8 text-yellow-100 bg-white/10 border border-white/10 rounded-full px-5 py-1.5 inline-block">
                      {getPerformanceText(cgpa)}
                    </p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 max-w-3xl mx-auto">
                      <div className="bg-white/5 border border-white/5 p-4 rounded-xl backdrop-blur-sm">
                        <div className="text-2xl font-bold text-yellow-300">{totalCredits}</div>
                        <div className="text-xs text-white/80 font-semibold uppercase tracking-wider mt-1">Credits Earned</div>
                      </div>
                      <div className="bg-white/5 border border-white/5 p-4 rounded-xl backdrop-blur-sm">
                        <div className="text-2xl font-bold text-yellow-300">{semesterResults.length}</div>
                        <div className="text-xs text-white/80 font-semibold uppercase tracking-wider mt-1">Semesters</div>
                      </div>
                      <div className="bg-white/5 border border-white/5 p-4 rounded-xl backdrop-blur-sm">
                        <div className="text-2xl font-bold text-yellow-300">
                          {semesterResults.reduce((sum, result) => sum + result.subjects.length, 0)}
                        </div>
                        <div className="text-xs text-white/80 font-semibold uppercase tracking-wider mt-1">Total Subjects</div>
                      </div>
                      <div className="bg-white/5 border border-white/5 p-4 rounded-xl backdrop-blur-sm">
                        <div className="text-2xl font-bold text-yellow-300">
                          {semesterResults.reduce((sum, result) => 
                            sum + result.subjects.filter(subject => subject.gradePoints >= 1.0).length, 0
                          )}
                        </div>
                        <div className="text-xs text-white/80 font-semibold uppercase tracking-wider mt-1">Passed Courses</div>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap justify-center gap-4">
                      <button
                        onClick={downloadResults}
                        disabled={!cgpa || semesterResults.length === 0}
                        className="bg-white text-indigo-700 border border-white hover:bg-slate-100 backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-sm px-6 py-3 rounded-xl transition-all duration-350 hover:translate-y-[-2px] flex items-center gap-2"
                      >
                        <Download className="w-4 h-4" />
                        Download PDF Report
                      </button>
                      
                      <button
                        onClick={downloadTextReport}
                        disabled={!cgpa || semesterResults.length === 0}
                        className="bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-sm px-6 py-3 rounded-xl transition-all duration-350 hover:translate-y-[-2px] flex items-center gap-2"
                      >
                        <FileText className="w-4 h-4" />
                        Text Report
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Semester-wise Results */}
        <AnimatePresence>
          {showResults && semesterResults.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mb-8"
            >
              <Card hover={false} className="border border-slate-100 shadow-premium bg-white">
                <CardContent className="p-8">
                  <div className="flex items-center mb-6">
                    <BarChart3 className="w-6 h-6 mr-3 text-indigo-600 animate-bounce" />
                    <h3 className="text-xl font-bold text-slate-800">Semester-wise Performance Breakdown</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {semesterResults.map((result, index) => (
                      <motion.div
                        key={result.semesterId}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.05 }}
                        className="p-5 bg-gradient-to-br from-slate-50 to-indigo-50/20 rounded-xl border border-slate-100 shadow-sm"
                      >
                        <h4 className="font-bold text-slate-800 text-sm mb-2">{result.semesterName}</h4>
                        <div className={`text-3xl font-extrabold mb-1.5 ${getGradeColor(result.sgpa)}`}>
                          {result.sgpa.toFixed(2)}
                        </div>
                        <div className="text-xs text-slate-500 font-semibold">
                          Semester SGPA • {result.totalCredits} Credits
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Official BCSIT Grading System */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-8"
        >
          <Card hover={false} className="border border-slate-100 shadow-premium bg-white">
            <CardContent className="p-8">
              <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-indigo-600" />
                Pokhara University BCSIT Grading System
              </h3>
              
              <div className="overflow-x-auto rounded-xl border border-slate-100">
                <table className="w-full border-collapse border border-slate-100 text-xs">
                  <thead>
                    <tr className="bg-indigo-600 text-white font-bold">
                      <th className="border border-slate-100 px-4 py-3.5 text-left">Letter Grade</th>
                      <th className="border border-slate-100 px-4 py-3.5 text-left">Percentage Range</th>
                      <th className="border border-slate-100 px-4 py-3.5 text-left">Honor Point</th>
                      <th className="border border-slate-100 px-4 py-3.5 text-left">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="bg-emerald-50/40">
                      <td className="border border-slate-100 px-4 py-3 font-bold text-emerald-700">A</td>
                      <td className="border border-slate-100 px-4 py-3 font-medium">90 and above</td>
                      <td className="border border-slate-100 px-4 py-3 font-bold">4.0</td>
                      <td className="border border-slate-100 px-4 py-3 font-semibold text-emerald-700">Excellent</td>
                    </tr>
                    <tr className="bg-emerald-50/20">
                      <td className="border border-slate-100 px-4 py-3 font-bold text-emerald-600">A-</td>
                      <td className="border border-slate-100 px-4 py-3 font-medium">85 to below 90</td>
                      <td className="border border-slate-100 px-4 py-3 font-bold">3.7</td>
                      <td className="border border-slate-100 px-4 py-3 text-slate-500 font-medium">Very Good</td>
                    </tr>
                    <tr className="bg-indigo-50/40">
                      <td className="border border-slate-100 px-4 py-3 font-bold text-indigo-700">B+</td>
                      <td className="border border-slate-100 px-4 py-3 font-medium">80 to below 85</td>
                      <td className="border border-slate-100 px-4 py-3 font-bold">3.3</td>
                      <td className="border border-slate-100 px-4 py-3 text-slate-500 font-medium">Good</td>
                    </tr>
                    <tr className="bg-indigo-50/20">
                      <td className="border border-slate-100 px-4 py-3 font-bold text-indigo-650">B</td>
                      <td className="border border-slate-100 px-4 py-3 font-medium">75 to below 80</td>
                      <td className="border border-slate-100 px-4 py-3 font-bold">3.0</td>
                      <td className="border border-slate-100 px-4 py-3 font-semibold text-indigo-700">Satisfactory</td>
                    </tr>
                    <tr className="bg-indigo-50/10">
                      <td className="border border-slate-100 px-4 py-3 font-bold text-indigo-500">B-</td>
                      <td className="border border-slate-100 px-4 py-3 font-medium">70 to below 75</td>
                      <td className="border border-slate-100 px-4 py-3 font-bold">2.7</td>
                      <td className="border border-slate-100 px-4 py-3 text-slate-500 font-medium">Fair</td>
                    </tr>
                    <tr className="bg-amber-50/40">
                      <td className="border border-slate-100 px-4 py-3 font-bold text-amber-700">C+</td>
                      <td className="border border-slate-100 px-4 py-3 font-medium">65 to below 70</td>
                      <td className="border border-slate-100 px-4 py-3 font-bold">2.3</td>
                      <td className="border border-slate-100 px-4 py-3 text-slate-500 font-medium">Satisfactory</td>
                    </tr>
                    <tr className="bg-amber-50/20">
                      <td className="border border-slate-100 px-4 py-3 font-bold text-amber-600">C</td>
                      <td className="border border-slate-100 px-4 py-3 font-medium">60 to below 65</td>
                      <td className="border border-slate-100 px-4 py-3 font-bold">2.0</td>
                      <td className="border border-slate-100 px-4 py-3 font-bold text-amber-700">Average / Min requirement for credit</td>
                    </tr>
                    <tr className="bg-amber-50/10">
                      <td className="border border-slate-100 px-4 py-3 font-bold text-amber-500">C-</td>
                      <td className="border border-slate-100 px-4 py-3 font-medium">55 to below 60</td>
                      <td className="border border-slate-100 px-4 py-3 font-bold">1.7</td>
                      <td className="border border-slate-100 px-4 py-3 text-slate-500 font-medium">Poor</td>
                    </tr>
                    <tr className="bg-orange-50/40">
                      <td className="border border-slate-100 px-4 py-3 font-bold text-orange-600">D+</td>
                      <td className="border border-slate-100 px-4 py-3 font-medium">50 to below 55</td>
                      <td className="border border-slate-100 px-4 py-3 font-bold">1.3</td>
                      <td className="border border-slate-100 px-4 py-3 text-slate-500 font-medium">Poor</td>
                    </tr>
                    <tr className="bg-orange-50/20">
                      <td className="border border-slate-100 px-4 py-3 font-bold text-orange-500">D</td>
                      <td className="border border-slate-100 px-4 py-3 font-medium">45 to below 50</td>
                      <td className="border border-slate-100 px-4 py-3 font-bold">1.0</td>
                      <td className="border border-slate-100 px-4 py-3 font-bold text-orange-700">Pass / Min passing grade</td>
                    </tr>
                    <tr className="bg-rose-50/40">
                      <td className="border border-slate-100 px-4 py-3 font-bold text-rose-600">F</td>
                      <td className="border border-slate-100 px-4 py-3 font-medium">Below 45</td>
                      <td className="border border-slate-100 px-4 py-3 font-bold">0.0</td>
                      <td className="border border-slate-100 px-4 py-3 font-bold text-rose-700">Fail</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <div className="mt-6 p-4 bg-amber-50 border border-amber-200/50 rounded-xl">
                <div className="flex items-start">
                  <Award className="w-5 h-5 text-amber-600 mr-2.5 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-bold text-amber-850 text-sm mb-1.5">Graduation Requirements</h4>
                    <p className="text-amber-700 text-xs leading-relaxed font-medium">
                      Students must obtain a minimum of a 'D' grade in each course and maintain a minimum CGPA of 2.0 (out of 4.0) for successful graduation from Pokhara University.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

// Inline helper functions to bypass duplicate block name issues in compilation scope
function block_cgpa(val: number) { return val; }
function block_result_semester_id(id: string) { return id; }