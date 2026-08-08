import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calculator, Download, BookOpen, Award, TrendingUp, GraduationCap, 
  FileText, BarChart3, Target, Sparkles, ChevronDown, ChevronUp, ArrowLeft,
  Percent, Sliders
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { semesterData, specializationData } from '../data/syllabusData';
import { useAuth } from '../context/AuthContext';
import { useProfile } from '../context/ProfileContext';
import { useSEO } from '../hooks/useSEO';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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

// Grading mapping system
const gradePointsMap: Record<string, number> = {
  'A': 4.0,
  'A-': 3.7,
  'B+': 3.3,
  'B': 3.0,
  'B-': 2.7,
  'C+': 2.3,
  'C': 2.0,
  'C-': 1.7,
  'D+': 1.3,
  'D': 1.0,
  'F': 0.0
};

const defaultMarksForGrade: Record<string, number> = {
  'A': 95,
  'A-': 87,
  'B+': 82,
  'B': 77,
  'B-': 72,
  'C+': 67,
  'C': 62,
  'C-': 57,
  'D+': 52,
  'D': 47,
  'F': 30
};

export function CGPACalculator() {


  const { user } = useAuth();
  const { profile } = useProfile();
  
  // Tab states
  const [activeTab, setActiveTab] = useState<'calculator' | 'analytics' | 'grading'>('calculator');
  
  // Mode states
  const [calculationMode, setCalculationMode] = useState<'marks' | 'grades'>('marks');
  
  // Selection states
  const [selectedSemesters, setSelectedSemesters] = useState<number[]>([]);
  const [semesterResults, setSemesterResults] = useState<SemesterResult[]>([]);
  const [cgpa, setCgpa] = useState<number | null>(null);
  const [totalCredits, setTotalCredits] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [expandedSemester, setExpandedSemester] = useState<number | null>(null);
  const [concentrationChoices, setConcentrationChoices] = useState<{ [key: string]: string }>({});
  
  // User info states
  const [guestName, setGuestName] = useState('');
  const [guestCollege, setGuestCollege] = useState('');
  
  // Goal planner states
  const [targetCGPA, setTargetCGPA] = useState<number>(3.0);
  const [targetAnalysis, setTargetAnalysis] = useState<{
    status: 'impossible' | 'achieved' | 'possible';
    requiredSGPA?: number;
    remainingCredits?: number;
    completedCredits?: number;
    earnedPoints?: number;
    totalCreditsPossible?: number;
  } | null>(null);

  const seoTitle = useMemo(() => {
    switch (activeTab) {
      case 'analytics':
        return "PU BCSIT CGPA Analytics & Projections";
      case 'grading':
        return "PU BCSIT Grading System & Conversions";
      default:
        return "PU SGPA & CGPA Calculator";
    }
  }, [activeTab]);

  const seoDescription = useMemo(() => {
    switch (activeTab) {
      case 'analytics':
        return "View visual academic analytics, GPA performance chart projections, and credits distribution maps for your Pokhara University BCSIT degree.";
      case 'grading':
        return "Learn about the official Pokhara University grading scheme, letter grades (A to F), GPA points translation tables, and pass marks for BCSIT.";
      default:
        return "Calculate, analyze, and project your Pokhara University BCSIT SGPA and overall CGPA using automated syllabus credit structures.";
    }
  }, [activeTab]);

  const seoKeywords = useMemo(() => {
    switch (activeTab) {
      case 'analytics':
        return "pu cgpa graphs, bcsit grade analytics, gpa projections, pu credits breakdown";
      case 'grading':
        return "pu grading system, letter grade point average, pokhara university passing marks, bcsit gpa scale";
      default:
        return "bcsit cgpa calculator, sgpa calculator, pokhara university cgpa, pu grade calculator";
    }
  }, [activeTab]);

  useSEO({
    title: seoTitle,
    description: seoDescription,
    keywords: seoKeywords,
    image: "https://bcsithub.lovestoblog.com/logo.png"
  });

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
      marks: calculationMode === 'marks' ? 0 : defaultMarksForGrade['F'],
      grade: 'F',
      gradePoints: 0.0
    }));
  };

  const handleSemesterToggle = (semesterId: number) => {
    if (selectedSemesters.includes(semesterId)) {
      setSelectedSemesters(selectedSemesters.filter(id => id !== semesterId));
      setSemesterResults(semesterResults.filter(result => result.semesterId !== semesterId));
      if (expandedSemester === semesterId) {
        setExpandedSemester(null);
      }
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
        setExpandedSemester(semesterId); // Expand the newly added semester automatically
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

  const updateSubjectGrade = (semesterId: number, subjectIndex: number, grade: string) => {
    const points = gradePointsMap[grade] || 0.0;
    const defaultMarks = defaultMarksForGrade[grade] || 0;
    
    setSemesterResults(semesterResults.map(result => {
      if (result.semesterId === semesterId) {
        const updatedSubjects = result.subjects.map((subject, index) => 
          index === subjectIndex 
            ? { ...subject, grade, gradePoints: points, marks: defaultMarks }
            : subject
        );
        return { ...result, subjects: updatedSubjects };
      }
      return result;
    }));
  };

  // Quick fill grades for a semester
  const handleBulkFillGrades = (semesterId: number, grade: string) => {
    if (!grade) return;
    const points = gradePointsMap[grade] || 0.0;
    const defaultMarks = defaultMarksForGrade[grade] || 0;
    
    setSemesterResults(semesterResults.map(result => {
      if (result.semesterId === semesterId) {
        const updatedSubjects = result.subjects.map(subject => ({
          ...subject,
          grade,
          gradePoints: points,
          marks: defaultMarks
        }));
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
    
    // Switch to analytics tab to show the gorgeous circular gauge and target planner
    setActiveTab('analytics');
  };

  // Goal Planner Logic
  useEffect(() => {
    if (cgpa === null || semesterResults.length === 0) {
      setTargetAnalysis(null);
      return;
    }
    
    // Total credits in standard Pokhara University BCSIT program
    const totalProgramCredits = 126;
    const completedCreditsCount = semesterResults.reduce((sum, res) => sum + res.totalCredits, 0);
    const remainingCreditsCount = totalProgramCredits - completedCreditsCount;
    
    let earnedGradePoints = 0;
    semesterResults.forEach(res => {
      res.subjects.forEach(sub => {
        earnedGradePoints += sub.gradePoints * sub.credits;
      });
    });
    
    if (remainingCreditsCount <= 0) {
      if (cgpa >= targetCGPA) {
        setTargetAnalysis({ status: 'achieved', completedCredits: completedCreditsCount });
      } else {
        setTargetAnalysis({ status: 'impossible', completedCredits: completedCreditsCount });
      }
      return;
    }
    
    const requiredTotalPoints = targetCGPA * totalProgramCredits;
    const neededPoints = requiredTotalPoints - earnedGradePoints;
    const requiredAvgSGPA = neededPoints / remainingCreditsCount;
    
    if (requiredAvgSGPA > 4.001) {
      setTargetAnalysis({
        status: 'impossible',
        requiredSGPA: requiredAvgSGPA,
        remainingCredits: remainingCreditsCount,
        completedCredits: completedCreditsCount,
        earnedPoints: earnedGradePoints,
        totalCreditsPossible: totalProgramCredits
      });
    } else if (requiredAvgSGPA <= 0.0) {
      setTargetAnalysis({
        status: 'achieved',
        requiredSGPA: 0.0,
        remainingCredits: remainingCreditsCount,
        completedCredits: completedCreditsCount,
        earnedPoints: earnedGradePoints,
        totalCreditsPossible: totalProgramCredits
      });
    } else {
      setTargetAnalysis({
        status: 'possible',
        requiredSGPA: Math.round(requiredAvgSGPA * 100) / 100,
        remainingCredits: remainingCreditsCount,
        completedCredits: completedCreditsCount,
        earnedPoints: earnedGradePoints,
        totalCreditsPossible: totalProgramCredits
      });
    }
  }, [cgpa, targetCGPA, semesterResults]);

  const downloadResults = () => {
    try {
      generatePDFReport();
    } catch (error) {
      console.error('Error generating PDF:', error);
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
      a.download = `BCSIT_Report_${user?.name?.replace(/\s+/g, '_') || guestName.replace(/\s+/g, '_') || 'Student'}_${new Date().toISOString().split('T')[0]}.txt`;
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
      
      // Top header band (Indigo)
      doc.setFillColor(79, 70, 229);
      doc.rect(0, 0, 210, 40, 'F');
      
      // Header Text
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(22);
      doc.text('BCSIT ACADEMIC TRANSCRIPT', 15, 22);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text('POKHARA UNIVERSITY CURRICULUM • GRADE EVALUATION DOCUMENT', 15, 30);
      
      // Metadata Panel
      doc.setTextColor(51, 65, 85);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('STUDENT INFORMATION', 15, 52);
      doc.line(15, 54, 195, 54);
      
      doc.setFont('helvetica', 'normal');
      doc.text('Student Name:', 15, 62);
      doc.setFont('helvetica', 'bold');
      doc.text(user?.name || guestName || 'N/A', 45, 62);
      
      doc.setFont('helvetica', 'normal');
      doc.text('Affiliated College:', 15, 69);
      doc.setFont('helvetica', 'bold');
      doc.text(profile?.college || guestCollege || 'N/A', 45, 69);
      
      doc.setFont('helvetica', 'normal');
      doc.text('Program:', 15, 76);
      doc.setFont('helvetica', 'bold');
      doc.text('Bachelor of Computer Science & Information Technology (BCSIT)', 45, 76);
      
      // Summary cards in PDF
      doc.setFillColor(243, 244, 246);
      doc.roundedRect(145, 56, 50, 24, 3, 3, 'F');
      
      doc.setTextColor(79, 70, 229);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      doc.text(cgpa.toFixed(2), 150, 68);
      
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text('OVERALL CGPA', 150, 74);
      
      // Total Credits Summary Card
      doc.setFillColor(243, 244, 246);
      doc.roundedRect(145, 84, 50, 24, 3, 3, 'F');
      
      doc.setTextColor(79, 70, 229);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      doc.text(`${totalCredits} Credits`, 150, 96);
      
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text('COMPLETED CREDIT HOURS', 150, 102);
      
      let currentY = 92;
      
      // Print semester results
      semesterResults.forEach((result) => {
        if (currentY > 230) {
          doc.addPage();
          currentY = 20;
        } else {
          currentY += 10;
        }
        
        doc.setFontSize(11);
        doc.setTextColor(51, 65, 85);
        doc.setFont('helvetica', 'bold');
        doc.text(`${result.semesterName.toUpperCase()} — SGPA: ${result.sgpa.toFixed(2)}`, 15, currentY);
        currentY += 3;
        
        const tableData = result.subjects.map((sub, index) => [
          (index + 1).toString(),
          sub.courseCode || 'N/A',
          sub.courseName,
          sub.credits.toString(),
          calculationMode === 'marks' ? sub.marks.toString() : '-',
          sub.grade,
          sub.gradePoints.toFixed(1)
        ]);
        
        autoTable(doc, {
          startY: currentY,
          head: [['S.N.', 'Course Code', 'Course Title', 'Credits', 'Marks', 'Grade', 'Points']],
          body: tableData,
          theme: 'striped',
          headStyles: { fillColor: [79, 70, 229], fontSize: 8 },
          bodyStyles: { fontSize: 8 },
          columnStyles: {
            0: { cellWidth: 10 },
            1: { cellWidth: 25 },
            2: { cellWidth: 75 },
            3: { cellWidth: 15 },
            4: { cellWidth: 15 },
            5: { cellWidth: 15 },
            6: { cellWidth: 15 },
          },
          margin: { left: 15, right: 15 },
          didDrawPage: (data) => {
            currentY = data.cursor ? data.cursor.y : currentY;
          }
        });
      });
      
      // Footer text for pages
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184);
        doc.text(`Page ${i} of ${pageCount}`, 105, 287, { align: 'center' });
        doc.text('BCSITHub Academic Evaluation Utility', 15, 287);
        doc.text('Generative Student Document', 160, 287);
      }
      
      const fileName = `BCSIT_Transcript_${user?.name?.replace(/\s+/g, '_') || guestName.replace(/\s+/g, '_') || 'Student'}.pdf`;
      doc.save(fileName);
    } catch (error) {
      console.error('PDF generation error:', error);
      alert('Could not render professional PDF report. Downloading text report instead.');
      downloadTextReport();
    }
  };

  const generateResultsContent = () => {
    if (!cgpa || semesterResults.length === 0) {
      alert('Please calculate CGPA first.');
      return '';
    }
    
    let content = `BCSIT CGPA CALCULATION REPORT\n`;
    content += `Generated on: ${new Date().toLocaleDateString()}\n`;
    content += `Student Name: ${user?.name || guestName || 'N/A'}\n`;
    content += `College: ${profile?.college || guestCollege || 'N/A'}\n`;
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
    content += `Performance: ${getPerformanceText(cgpa || 0)}\n`;
    
    return content;
  };

  const getGradeColor = (gpa: number) => {
    if (gpa >= 3.7) return 'text-emerald-500';
    if (gpa >= 3.0) return 'text-indigo-500';
    if (gpa >= 2.0) return 'text-amber-500';
    return 'text-red-500';
  };

  const getPerformanceText = (gpa: number) => {
    if (gpa >= 3.7) return 'Excellent (First Division with Distinction)';
    if (gpa >= 3.0) return 'Good (First Division)';
    if (gpa >= 2.0) return 'Satisfactory (Second Division)';
    return 'Needs Improvement (Fail)';
  };

  const getGradientColor = (gpa: number) => {
    if (gpa >= 3.7) return 'from-emerald-600 via-emerald-500 to-teal-600';
    if (gpa >= 3.0) return 'from-indigo-600 via-purple-600 to-indigo-800';
    if (gpa >= 2.0) return 'from-amber-500 via-orange-500 to-amber-600';
    return 'from-rose-600 via-red-500 to-pink-600';
  };

  // Dynamically tags courses by their codes for extra styling context (matching Syllabus design)
  const getCourseCategory = (code?: string) => {
    if (!code) return { label: 'Specialization', bg: 'bg-teal-50 text-teal-600 border-teal-100/50' };
    const prefix = code.split(' ')[0];
    switch (prefix) {
      case 'ENG':
        return { label: 'Communication', bg: 'bg-sky-50 text-sky-600 border-sky-100/50' };
      case 'MTH':
      case 'STT':
      case 'RCH':
        return { label: 'Math & Research', bg: 'bg-rose-50 text-rose-600 border-rose-100/50' };
      case 'CMP':
      case 'PRJ':
      case 'PRI':
      case 'INT':
        return { label: 'Computer Science', bg: 'bg-indigo-50 text-indigo-600 border-indigo-100/50' };
      case 'MGT':
      case 'MKT':
      case 'ECO':
      case 'FIN':
      case 'LAW':
        return { label: 'Business & Law', bg: 'bg-amber-50 text-amber-600 border-amber-100/50' };
      default:
        return { label: 'Core', bg: 'bg-slate-50 text-slate-600 border-slate-100/50' };
    }
  };

  // SVGs circular metrics parameters
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = cgpa !== null ? circumference - (cgpa / 4.00) * circumference : circumference;

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-800 pb-20">
      
      {/* Hero Banner (styled identical to Notes.tsx without Academic Suite badge) */}
      <section className="relative text-white py-24 px-4 overflow-hidden bg-slate-955 bg-slate-905 bg-slate-950">
        {/* Soft Glowing Background Orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-1/4 w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 right-1/4 w-[350px] h-[350px] bg-purple-600/10 rounded-full blur-[120px]" />
        </div>
        
        <div className="relative max-w-6xl mx-auto text-center z-10 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent mb-4">
              Advanced CGPA Calculator
            </h1>
            <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Professional evaluation with double inputs (percentage marks or letter grades), target planners, and official PDF evaluation document downloads.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Sticky Interactive Dashboard Navigation Controls (styled identical to Notes.tsx controls) */}
      <div className="sticky top-16 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200/60 py-4 px-4 shadow-sm">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          
          <div className="flex items-center space-x-3">
            <Link to="/" className="flex items-center text-slate-500 hover:text-indigo-700 transition-colors text-xs font-bold uppercase tracking-wider">
              <ArrowLeft className="w-4.5 h-4.5 mr-1.5" />
              Home
            </Link>
            <div className="h-4.5 w-px bg-slate-200" />
            <div className="flex items-center gap-2">
              <Calculator className="w-5 h-5 text-indigo-600" />
              <h2 className="text-xs font-black text-slate-800 uppercase tracking-wider">PU Evaluation</h2>
            </div>
          </div>
          
          {/* Sliding Pill Tab Selector - Grid on mobile, Flex on desktop */}
          <div className="grid grid-cols-3 sm:flex bg-slate-100 rounded-xl p-1 border border-slate-200/40 w-full sm:w-auto">
            {[
              { key: 'calculator', label: 'Calculator' },
              { key: 'analytics', label: 'Analytics & Target' },
              { key: 'grading', label: 'Grading Scheme' },
            ].map((tab) => {
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`relative px-2 sm:px-4 py-2 rounded-lg text-[10px] sm:text-xs font-bold transition-colors z-10 uppercase tracking-wider bg-transparent border-0 cursor-pointer ${
                    isActive ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTabBackground"
                      className="absolute inset-0 bg-white shadow-sm rounded-lg border border-slate-200/20"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                  <span className="relative z-20 block truncate text-center">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* TAB 1: CALCULATOR */}
        {activeTab === 'calculator' && (
          <div className="space-y-6">
            
            {/* Student Info Card */}
            <Card hover={false} className="border border-slate-200/60 shadow-premium bg-white/90 backdrop-blur-md rounded-2xl">
              <CardContent className="p-6">
                <div className="flex items-center mb-4.5">
                  <GraduationCap className="w-5 h-5 mr-2.5 text-indigo-600" />
                  <h2 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">Student Credentials</h2>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                      Student Name
                    </label>
                    {user ? (
                      <div className="px-4 py-2.5 bg-slate-50 border border-slate-200/60 rounded-xl text-slate-800 text-xs font-semibold">
                        {user.name}
                      </div>
                    ) : (
                      <input
                        type="text"
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                        placeholder="Enter your full name"
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-xs bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 font-semibold transition-all"
                      />
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                      College Name
                    </label>
                    {user ? (
                      <div className="px-4 py-2.5 bg-slate-50 border border-slate-200/60 rounded-xl text-slate-800 text-xs font-semibold">
                        {profile?.college || 'Please edit your profile to add college'}
                      </div>
                    ) : (
                      <input
                        type="text"
                        value={guestCollege}
                        onChange={(e) => setGuestCollege(e.target.value)}
                        placeholder="Enter affiliated college name"
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-xs bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 font-semibold transition-all"
                      />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Semester Select Grid */}
            <Card hover={false} className="border border-slate-200/60 shadow-premium bg-white/90 backdrop-blur-md rounded-2xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4.5">
                  <div className="flex items-center">
                    <BookOpen className="w-5 h-5 mr-2.5 text-indigo-600" />
                    <h2 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">Select Evaluated Semesters</h2>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-100 px-2.5 py-1 rounded-md">
                    {selectedSemesters.length} Selected
                  </span>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {semestersData.map((semester) => (
                    <motion.label
                      key={semester.id}
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      className={`flex items-center p-3.5 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                        selectedSemesters.includes(semester.id)
                          ? 'bg-indigo-50/20 border-indigo-600 text-indigo-700 font-bold shadow-sm'
                          : 'bg-slate-50/50 border-slate-100 text-slate-600 font-semibold hover:border-slate-200'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedSemesters.includes(semester.id)}
                        onChange={() => handleSemesterToggle(semester.id)}
                        className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500 cursor-pointer"
                      />
                      <span className="ml-2.5 text-xs">{semester.name}</span>
                    </motion.label>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Specialization Options Selection */}
            {selectedSemesters.some(id => {
              const semester = semestersData.find(s => s.id === id);
              return semester?.subjects.some(s => s.courseName === 'Specialization Course' || s.courseName.includes('Concentration'));
            }) && (
              <Card hover={false} className="border border-purple-100 bg-gradient-to-r from-purple-50/20 to-pink-50/10 rounded-2xl shadow-premium">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4.5">
                    <Target className="w-5 h-5 mr-2.5 text-purple-600" />
                    <h2 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">Configure Specialized Tracks</h2>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {selectedSemesters.map(semesterId => {
                      const semester = semestersData.find(s => s.id === semesterId);
                      return semester?.subjects.filter(s => s.courseName === 'Specialization Course' || s.courseName.includes('Concentration')).map((subject) => {
                        const key = `${semesterId}-${subject.courseName}`;
                        const isSpecialization = subject.courseName === 'Specialization Course';
                        
                        return (
                          <div key={key} className="space-y-1.5">
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                              {semester.name} — {subject.courseName}
                            </label>
                            
                            {isSpecialization ? (
                              <select
                                value={concentrationChoices[key] || ''}
                                onChange={(e) => updateConcentrationSubject(key, e.target.value)}
                                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs bg-white text-slate-800 font-bold focus:outline-none focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 transition-all cursor-pointer"
                              >
                                <option value="">-- Choose Specialization Track --</option>
                                {getSpecializationOptions().map(spec => (
                                  <option key={spec.value} value={spec.label}>{spec.label}</option>
                                ))}
                              </select>
                            ) : (
                              <select
                                value={concentrationChoices[key] || ''}
                                onChange={(e) => updateConcentrationSubject(key, e.target.value)}
                                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs bg-white text-slate-800 font-bold focus:outline-none focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 transition-all cursor-pointer"
                              >
                                <option value="">-- Select Concentration Course --</option>
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
            )}

            {/* Input System Toggles */}
            {semesterResults.length > 0 && (
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 bg-white border border-slate-200/60 rounded-2xl gap-4 shadow-sm">
                <div>
                  <h3 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">Evaluation Input Scheme</h3>
                  <p className="text-[10px] text-slate-400 font-bold mt-0.5 uppercase tracking-wider">Select between raw percentage marks or letter grades directly</p>
                </div>
                
                <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200/40 w-full sm:w-auto">
                  <button
                    onClick={() => setCalculationMode('marks')}
                    className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-[10px] font-extrabold uppercase tracking-wide border-0 cursor-pointer transition-all ${
                      calculationMode === 'marks' 
                        ? 'bg-indigo-600 text-white shadow-sm' 
                        : 'text-slate-600 bg-transparent hover:text-slate-800'
                    }`}
                  >
                    <Percent className="w-3.5 h-3.5 inline mr-1" />
                    Percentage Marks
                  </button>
                  <button
                    onClick={() => setCalculationMode('grades')}
                    className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-[10px] font-extrabold uppercase tracking-wide border-0 cursor-pointer transition-all ${
                      calculationMode === 'grades' 
                        ? 'bg-indigo-600 text-white shadow-sm' 
                        : 'text-slate-600 bg-transparent hover:text-slate-800'
                    }`}
                  >
                    <Sliders className="w-3.5 h-3.5 inline mr-1" />
                    Letter Grades
                  </button>
                </div>
              </div>
            )}

            {/* Interactive Subject list */}
            <div className="space-y-4">
              {semesterResults.map((result) => (
                <div key={result.semesterId} className="border border-slate-200/60 rounded-2xl bg-white shadow-premium overflow-hidden">
                  
                  {/* Collapsible Header */}
                  <div 
                    onClick={() => setExpandedSemester(expandedSemester === result.semesterId ? null : result.semesterId)}
                    className="flex items-center justify-between p-4.5 bg-slate-50/50 hover:bg-slate-50 cursor-pointer select-none transition-colors border-b border-slate-200/60"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-indigo-50 border border-indigo-100/50 rounded-xl flex items-center justify-center text-indigo-600">
                        <BookOpen className="w-4.5 h-4.5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">{result.semesterName}</h4>
                        <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest mt-0.5 block">
                          {result.totalCredits} Credit Hours • {result.subjects.length} courses
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      {/* Bulk set grade widget */}
                      <div onClick={(e) => e.stopPropagation()} className="hidden sm:flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-2 py-1 shadow-sm">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Bulk Fill:</span>
                        <select
                          onChange={(e) => {
                            handleBulkFillGrades(result.semesterId, e.target.value);
                            e.target.value = ''; // Reset option index
                          }}
                          className="bg-transparent border-0 text-[10px] font-black text-indigo-600 focus:outline-none cursor-pointer uppercase tracking-wider"
                        >
                          <option value="">-- Grade --</option>
                          {Object.keys(gradePointsMap).map(g => (
                            <option key={g} value={g}>{g}</option>
                          ))}
                        </select>
                      </div>

                      {expandedSemester === result.semesterId ? (
                        <ChevronUp className="w-4.5 h-4.5 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-4.5 h-4.5 text-slate-400" />
                      )}
                    </div>
                  </div>

                  {/* Expanded view */}
                  <AnimatePresence initial={false}>
                    {expandedSemester === result.semesterId && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                      >
                        <div className="p-4 bg-white divide-y divide-slate-100">
                          
                          {/* Bulk fill widget for mobile */}
                          <div className="flex sm:hidden justify-between items-center pb-3 border-b border-slate-100">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Quick Fill Semester:</span>
                            <select
                              onChange={(e) => {
                                handleBulkFillGrades(result.semesterId, e.target.value);
                                e.target.value = ''; // Reset option index
                              }}
                              className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1 text-xs font-bold text-indigo-600 focus:outline-none cursor-pointer uppercase tracking-wider"
                            >
                              <option value="">-- Select Grade --</option>
                              {Object.keys(gradePointsMap).map(g => (
                                <option key={g} value={g}>{g}</option>
                              ))}
                            </select>
                          </div>
                          
                          {/* Subject Header (desktop only) */}
                          <div className="hidden md:grid grid-cols-6 gap-4 pb-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                            <div className="col-span-3">Course Code & Title</div>
                            <div className="text-center">Credits</div>
                            <div className="text-center">{calculationMode === 'marks' ? 'Marks (0-100)' : 'Letter Grade'}</div>
                            <div className="text-center">Earned Grade</div>
                          </div>

                          {/* Subject Rows */}
                          {result.subjects.map((subject, idx) => (
                            <div key={idx} className="grid grid-cols-1 md:grid-cols-6 gap-3 py-3 items-center">
                              
                              {/* Subject Title */}
                              <div className="col-span-1 md:col-span-3">
                                <div className="text-xs font-extrabold text-slate-800 tracking-tight flex flex-wrap items-center gap-1.5">
                                  {subject.courseCode && (
                                    <span className="text-[9px] bg-slate-100 text-slate-500 font-bold px-2 py-0.5 rounded border border-slate-200/60">
                                      {subject.courseCode}
                                    </span>
                                  )}
                                  
                                  {/* Subject Category Badge */}
                                  <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${getCourseCategory(subject.courseCode).bg}`}>
                                    {getCourseCategory(subject.courseCode).label}
                                  </span>
                                  
                                  <span className="text-slate-800">{subject.courseName}</span>
                                </div>
                              </div>

                              {/* Details (Credits, Input, Grade Output) in a responsive grid/flex */}
                              <div className="col-span-1 md:col-span-3 grid grid-cols-3 md:grid-cols-3 gap-2 items-center text-center">
                                
                                {/* Credits Column */}
                                <div className="flex flex-col md:block items-center">
                                  <span className="md:hidden text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Credits</span>
                                  <span className="text-xs font-bold text-slate-600 bg-slate-50 border border-slate-200/60 rounded-xl px-2.5 py-1">
                                    {subject.credits} Cr
                                  </span>
                                </div>

                                {/* Input Column */}
                                <div className="flex flex-col md:block items-center">
                                  <span className="md:hidden text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                                    {calculationMode === 'marks' ? 'Enter Marks' : 'Select Grade'}
                                  </span>
                                  
                                  {calculationMode === 'marks' ? (
                                    <input
                                      type="number"
                                      min="0"
                                      max="100"
                                      value={subject.marks || ''}
                                      onChange={(e) => updateSubjectMarks(result.semesterId, idx, parseInt(e.target.value) || 0)}
                                      placeholder="Marks"
                                      className="w-full max-w-[80px] text-center px-2 py-1.5 border border-slate-200 rounded-lg text-xs font-bold focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-slate-800"
                                    />
                                  ) : (
                                    <select
                                      value={subject.grade}
                                      onChange={(e) => updateSubjectGrade(result.semesterId, idx, e.target.value)}
                                      className="w-full max-w-[85px] px-1 py-1.5 border border-slate-200 rounded-lg text-xs font-bold bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-slate-800 uppercase tracking-wide cursor-pointer"
                                    >
                                      {Object.keys(gradePointsMap).map(g => (
                                        <option key={g} value={g}>{g}</option>
                                      ))}
                                    </select>
                                  )}
                                </div>

                                {/* Earned Grade Column */}
                                <div className="flex flex-col md:block items-center">
                                  <span className="md:hidden text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Grade</span>
                                  <span className={`inline-block w-12 text-center text-[10px] font-black text-white px-2 py-0.5 rounded-md shadow-sm ${
                                    subject.gradePoints >= 3.7 ? 'bg-emerald-500' :
                                    subject.gradePoints >= 3.0 ? 'bg-indigo-500' :
                                    subject.gradePoints >= 2.0 ? 'bg-amber-500' :
                                    subject.gradePoints >= 1.0 ? 'bg-orange-500' : 'bg-rose-500'
                                  }`}>
                                    {subject.grade}
                                  </span>
                                </div>

                              </div>

                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                </div>
              ))}
            </div>

            {/* Calculate Trigger Block */}
            {semesterResults.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center pt-4"
              >
                <Button
                  onClick={calculateResults}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold px-10 py-3.5 rounded-xl shadow-lg border-0 flex items-center justify-center gap-2 mx-auto cursor-pointer text-xs uppercase tracking-wider"
                >
                  <Sparkles className="w-4 h-4 text-yellow-350" />
                  Evaluate Academic GPA
                </Button>
              </motion.div>
            )}

          </div>
        )}

        {/* TAB 2: ANALYTICS & TARGET PLANNER */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            
            {/* Displaying metrics (CGPA Dial / Visual representation) */}
            {cgpa !== null ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Visual Circle Gauge Card (Styled like stats box in Notes.tsx) */}
                <Card hover={false} className="md:col-span-1 border border-slate-200/60 shadow-premium bg-slate-900 text-white overflow-hidden relative">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
                  <CardContent className="p-6 flex flex-col items-center justify-center min-h-[280px] text-center">
                    
                    <div className="relative mb-4">
                      {/* SVG Gauge */}
                      <svg className="w-36 h-36 transform -rotate-90" viewBox="0 0 160 160">
                        <defs>
                          <linearGradient id="circleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#4f46e5" />
                            <stop offset="50%" stopColor="#8b5cf6" />
                            <stop offset="100%" stopColor="#ec4899" />
                          </linearGradient>
                        </defs>
                        
                        <circle
                          cx="80"
                          cy="80"
                          r={radius}
                          fill="transparent"
                          stroke="rgba(255, 255, 255, 0.08)"
                          strokeWidth="10"
                        />
                        
                        <motion.circle
                          cx="80"
                          cy="80"
                          r={radius}
                          fill="transparent"
                          stroke="url(#circleGrad)"
                          strokeWidth="10"
                          strokeDasharray={circumference}
                          initial={{ strokeDashoffset: circumference }}
                          animate={{ strokeDashoffset }}
                          transition={{ duration: 1.0, ease: "easeOut" }}
                          strokeLinecap="round"
                        />
                      </svg>
                      
                      {/* CGPA Text Inner Overlay */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-3xl font-black text-white leading-none">{cgpa.toFixed(2)}</span>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1.5">CGPA / 4.00</span>
                      </div>
                    </div>

                    <h3 className="text-[10px] font-black uppercase text-indigo-400 tracking-widest mb-1.5">Status</h3>
                    <p className="text-[11px] font-bold text-white px-3.5 py-1 bg-white/10 rounded-full border border-white/5 inline-block">
                      {getPerformanceText(cgpa)}
                    </p>
                  </CardContent>
                </Card>

                {/* Scorecards */}
                <div className="md:col-span-2 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    
                    <div className="p-5 bg-white border border-slate-200/60 rounded-2xl shadow-sm">
                      <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 mb-3.5">
                        <Award className="w-5 h-5" />
                      </div>
                      <div className="text-2xl font-black text-slate-800">{cgpa.toFixed(2)}</div>
                      <div className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider mt-1">CUMULATIVE CGPA</div>
                    </div>
                    
                    <div className="p-5 bg-white border border-slate-200/60 rounded-2xl shadow-sm">
                      <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 mb-3.5">
                        <GraduationCap className="w-5 h-5" />
                      </div>
                      <div className="text-2xl font-black text-slate-800">{totalCredits} hrs</div>
                      <div className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider mt-1">CREDITS COMPLETED</div>
                    </div>

                  </div>

                  {/* PDF Transcripts generation card */}
                  <div className="p-5 bg-gradient-to-br from-indigo-50/20 to-purple-50/20 border border-slate-200/60 rounded-2xl shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Transcript Export</h4>
                      <p className="text-[10px] text-slate-500 font-bold uppercase mt-0.5">Generate a professional grade report containing all evaluated subject details</p>
                    </div>
                    
                    {/* Grid column on mobile, flex on desktop */}
                    <div className="grid grid-cols-2 sm:flex gap-2 w-full sm:w-auto">
                      <button
                        onClick={downloadResults}
                        className="flex-grow sm:flex-grow-0 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-[10px] uppercase tracking-wider px-4.5 py-2.5 rounded-xl border border-transparent flex items-center justify-center gap-1.5 shadow transition-all cursor-pointer"
                      >
                        <Download className="w-4 h-4 text-white" />
                        PDF Report
                      </button>
                      <button
                        onClick={downloadTextReport}
                        className="flex-grow sm:flex-grow-0 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-extrabold text-[10px] uppercase tracking-wider px-4.5 py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                      >
                        <FileText className="w-4 h-4 text-slate-500" />
                        Text File
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            ) : (
              <div className="text-center p-12 bg-white border border-slate-200/60 rounded-2xl shadow-sm">
                <Calculator className="w-12 h-12 text-slate-300 mx-auto mb-4 animate-bounce" />
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">No evaluation data</h3>
                <p className="text-xs text-slate-400 font-semibold max-w-sm mx-auto mt-2">
                  Select your semesters, fill out the grades in the Calculator tab and press "Evaluate Academic GPA" to view full analytics.
                </p>
                <button
                  onClick={() => setActiveTab('calculator')}
                  className="mt-5 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold uppercase tracking-wider rounded-xl border-0 cursor-pointer shadow-sm"
                >
                  Configure Calculator
                </button>
              </div>
            )}

            {/* SGPA Progression Trend Chart */}
            {cgpa !== null && semesterResults.length > 0 && (() => {
              const sortedResults = [...semesterResults].sort((a, b) => a.semesterId - b.semesterId);
              const width = 600;
              const height = 220;
              const paddingX = 50;
              const paddingY = 40;
              const chartWidth = width - paddingX * 2;
              const chartHeight = height - paddingY * 2;

              const points = sortedResults.map((r, i) => {
                const x = paddingX + (i / Math.max(1, sortedResults.length - 1)) * chartWidth;
                const y = height - paddingY - (r.sgpa / 4.0) * chartHeight;
                return { x, y, sgpa: r.sgpa, label: r.semesterName };
              });

              const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
              const areaPath = points.length > 0
                ? `${linePath} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`
                : '';

              return (
                <Card hover={false} className="border border-slate-200/60 shadow-premium bg-white rounded-2xl">
                  <CardContent className="p-6">
                    <div className="flex items-center mb-6">
                      <TrendingUp className="w-5 h-5 mr-2.5 text-indigo-600" />
                      <div>
                        <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">SGPA Progression Trend</h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Visual representation of your academic growth semester by semester</p>
                      </div>
                    </div>

                    <div className="w-full overflow-x-auto">
                      <div className="min-w-[600px] h-[230px] flex justify-center py-2">
                        <svg width="600" height="220" className="overflow-visible">
                          <defs>
                            <linearGradient id="chartGlow" x1="0%" y1="0%" x2="0%" y2="100%">
                              <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.2" />
                              <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.0" />
                            </linearGradient>
                          </defs>

                          {/* Grid Lines */}
                          {[0, 1, 2, 3, 4].map((val) => {
                            const y = height - paddingY - (val / 4.0) * chartHeight;
                            return (
                              <g key={val}>
                                <line x1={paddingX} y1={y} x2={width - paddingX} y2={y} stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4 4" />
                                <text x={paddingX - 15} y={y + 4} fill="#94a3b8" fontSize="9" fontWeight="bold" textAnchor="end">{val.toFixed(1)}</text>
                              </g>
                            );
                          })}

                          {/* Glow Area under chart */}
                          {points.length > 0 && <path d={areaPath} fill="url(#chartGlow)" />}

                          {/* Main line */}
                          {points.length > 0 && (
                            <path d={linePath} fill="none" stroke="#4f46e5" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                          )}

                          {/* Active data points */}
                          {points.map((p, i) => (
                            <g key={i} className="group cursor-pointer">
                              {/* Hover halo */}
                              <circle cx={p.x} cy={p.y} r="10" fill="#4f46e5" fillOpacity="0" className="transition-all duration-150 group-hover:fill-opacity-15" />
                              {/* Dot */}
                              <circle cx={p.x} cy={p.y} r="5" fill="#4f46e5" stroke="#ffffff" strokeWidth="2" />
                              {/* Numeric labels (visible on hover) */}
                              <g className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none">
                                <rect x={p.x - 22} y={p.y - 28} width="44" height="18" rx="4" fill="#1e293b" />
                                <text x={p.x} y={p.y - 16} fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">
                                  {p.sgpa.toFixed(2)}
                                </text>
                              </g>
                              {/* X-axis Label */}
                              <text x={p.x} y={height - 15} fill="#64748b" fontSize="9" fontWeight="bold" textAnchor="middle">
                                {p.label.replace("Semester", "Sem")}
                              </text>
                            </g>
                          ))}
                        </svg>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })()}

            {/* Target Goal Planner Card */}
            {cgpa !== null && (
              <Card hover={false} className="border border-slate-200/60 shadow-premium bg-white rounded-2xl">
                <CardContent className="p-6">
                  <div className="flex items-center mb-6">
                    <Target className="w-5 h-5 mr-2.5 text-indigo-600" />
                    <div>
                      <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Target CGPA Planner</h3>
                      <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Determine the average GPA needed in remaining semesters to achieve your goal</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                    
                    {/* Slider Selection */}
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-black text-slate-600 uppercase tracking-wider">Set Target CGPA:</span>
                        <span className="text-2xl font-black text-indigo-600">{targetCGPA.toFixed(2)}</span>
                      </div>
                      
                      <input
                        type="range"
                        min="2.00"
                        max="4.00"
                        step="0.05"
                        value={targetCGPA}
                        onChange={(e) => setTargetCGPA(parseFloat(e.target.value))}
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 focus:outline-none"
                      />
                      
                      <div className="flex justify-between text-[9px] font-black text-slate-400 uppercase tracking-widest">
                        <span>2.00 (Pass)</span>
                        <span>3.00 (First Div)</span>
                        <span>4.00 (Distinction)</span>
                      </div>
                    </div>

                    {/* Result analysis block */}
                    <div className="p-5 rounded-2xl border border-slate-200/60 bg-slate-50/50">
                      {targetAnalysis && (
                        <div>
                          {targetAnalysis.status === 'impossible' && (
                            <div className="space-y-2">
                              <span className="text-[10px] font-black text-rose-650 bg-rose-50 border border-rose-100 px-3 py-1 rounded-full uppercase tracking-wider">
                                Mathematically Out of Reach
                              </span>
                              <p className="text-xs text-slate-600 font-semibold leading-relaxed mt-2">
                                Achieving a <strong className="text-slate-800">{targetCGPA.toFixed(2)}</strong> target requires an average SGPA of <strong className="text-rose-650">{targetAnalysis.requiredSGPA?.toFixed(2)}</strong> in the remaining {targetAnalysis.remainingCredits} credits, which exceeds the maximum possible GPA of 4.0.
                              </p>
                            </div>
                          )}

                          {targetAnalysis.status === 'achieved' && (
                            <div className="space-y-2">
                              <span className="text-[10px] font-black text-emerald-650 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full uppercase tracking-wider">
                                Goal Secured!
                              </span>
                              <p className="text-xs text-slate-600 font-semibold leading-relaxed mt-2">
                                Excellent! Your current academic standing is high enough that you have already secured a <strong className="text-slate-800">{targetCGPA.toFixed(2)}</strong> overall CGPA, even with average passing grades in the future.
                              </p>
                            </div>
                          )}

                          {targetAnalysis.status === 'possible' && (
                            <div className="space-y-2">
                              <span className="text-[10px] font-black text-indigo-655 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full uppercase tracking-wider">
                                Goal Achievable
                              </span>
                              <p className="text-xs text-slate-600 font-semibold leading-relaxed mt-2">
                                To graduate with a <strong className="text-slate-800">{targetCGPA.toFixed(2)}</strong> target, you must maintain an average SGPA of <strong className="text-indigo-600">{targetAnalysis.requiredSGPA?.toFixed(2)}</strong> over the remaining <strong className="text-slate-800">{targetAnalysis.remainingCredits}</strong> credit hours.
                              </p>
                            </div>
                          )}

                          <div className="border-t border-slate-205 mt-4.5 pt-3.5 grid grid-cols-2 gap-4 text-center">
                            <div>
                              <div className="text-sm font-black text-slate-805">{targetAnalysis.completedCredits}</div>
                              <div className="text-[9px] text-slate-400 font-extrabold uppercase tracking-widest mt-0.5">Completed Credits</div>
                            </div>
                            <div>
                              <div className="text-sm font-black text-slate-805">{targetAnalysis.remainingCredits || 0}</div>
                              <div className="text-[9px] text-slate-400 font-extrabold uppercase tracking-widest mt-0.5">Remaining Credits</div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                  </div>
                </CardContent>
              </Card>
            )}

            {/* Semester-wise breakdown cards (Styled like Notes.tsx cards) */}
            {cgpa !== null && (
              <Card hover={false} className="border border-slate-200/60 shadow-premium bg-white rounded-2xl">
                <CardContent className="p-6">
                  <div className="flex items-center mb-6">
                    <BarChart3 className="w-5 h-5 mr-2.5 text-indigo-600 animate-pulse" />
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Evaluated Semester Breakdown</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {semesterResults.map((result) => (
                      <div 
                        key={result.semesterId}
                        className="p-5 bg-gradient-to-br from-slate-50 to-indigo-50/10 border border-slate-200/60 rounded-2xl hover:border-slate-300 transition-all flex flex-col justify-between"
                      >
                        <div>
                          <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5">{result.semesterName}</h4>
                          <div className={`text-3xl font-extrabold ${getGradeColor(result.sgpa)}`}>
                            {result.sgpa.toFixed(2)}
                          </div>
                        </div>
                        <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-widest mt-3.5 block border-t border-slate-100 pt-2">
                          {result.totalCredits} Credits Completed
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

          </div>
        )}

        {/* TAB 3: GRADING SCHEME */}
        {activeTab === 'grading' && (
          <div className="space-y-6">
            <Card hover={false} className="border border-slate-200/60 shadow-premium bg-white rounded-2xl">
              <CardContent className="p-6">
                <div className="flex items-center mb-6">
                  <FileText className="w-5 h-5 mr-2.5 text-indigo-650" />
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">
                    Pokhara University Official Grading Policies
                  </h3>
                </div>
                
                <div className="overflow-x-auto rounded-xl border border-slate-200/60 shadow-inner">
                  <table className="w-full border-collapse text-left text-xs">
                    <thead>
                      <tr className="bg-indigo-600 text-white font-bold text-[10px] uppercase tracking-wider">
                        <th className="px-4 py-3.5">Letter Grade</th>
                        <th className="px-4 py-3.5">Percentage Threshold</th>
                        <th className="px-4 py-3.5">Grade Honor Points</th>
                        <th className="px-4 py-3.5">Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-semibold text-slate-600">
                      <tr className="bg-emerald-50/20 hover:bg-emerald-50/30">
                        <td className="px-4 py-3 font-black text-emerald-600">A</td>
                        <td className="px-4 py-3">90% and above</td>
                        <td className="px-4 py-3 font-bold">4.0</td>
                        <td className="px-4 py-3 text-emerald-700 font-black">Excellent</td>
                      </tr>
                      <tr className="bg-emerald-50/5 hover:bg-emerald-50/10">
                        <td className="px-4 py-3 font-black text-emerald-600">A-</td>
                        <td className="px-4 py-3">85% to below 90%</td>
                        <td className="px-4 py-3 font-bold">3.7</td>
                        <td className="px-4 py-3 text-slate-500">Very Good</td>
                      </tr>
                      <tr className="bg-indigo-50/20 hover:bg-indigo-50/30">
                        <td className="px-4 py-3 font-black text-indigo-600">B+</td>
                        <td className="px-4 py-3">80% to below 85%</td>
                        <td className="px-4 py-3 font-bold">3.3</td>
                        <td className="px-4 py-3 text-slate-500">Good</td>
                      </tr>
                      <tr className="bg-indigo-50/5 hover:bg-indigo-50/10">
                        <td className="px-4 py-3 font-black text-indigo-500">B</td>
                        <td className="px-4 py-3">75% to below 80%</td>
                        <td className="px-4 py-3 font-bold">3.0</td>
                        <td className="px-4 py-3 text-indigo-600">Satisfactory</td>
                      </tr>
                      <tr className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-black text-indigo-400">B-</td>
                        <td className="px-4 py-3">70% to below 75%</td>
                        <td className="px-4 py-3 font-bold">2.7</td>
                        <td className="px-4 py-3 text-slate-500">Fair</td>
                      </tr>
                      <tr className="bg-amber-50/20 hover:bg-amber-50/30">
                        <td className="px-4 py-3 font-black text-amber-600">C+</td>
                        <td className="px-4 py-3">65% to below 70%</td>
                        <td className="px-4 py-3 font-bold">2.3</td>
                        <td className="px-4 py-3 text-slate-500">Satisfactory</td>
                      </tr>
                      <tr className="bg-amber-50/5 hover:bg-amber-50/10">
                        <td className="px-4 py-3 font-black text-amber-500">C</td>
                        <td className="px-4 py-3">60% to below 65%</td>
                        <td className="px-4 py-3 font-bold">2.0</td>
                        <td className="px-4 py-3 text-amber-700">Average (Min Credit Requirement)</td>
                      </tr>
                      <tr className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-black text-amber-400">C-</td>
                        <td className="px-4 py-3">55% to below 60%</td>
                        <td className="px-4 py-3 font-bold">1.7</td>
                        <td className="px-4 py-3 text-slate-500">Poor</td>
                      </tr>
                      <tr className="bg-orange-50/20 hover:bg-orange-50/30">
                        <td className="px-4 py-3 font-black text-orange-600">D+</td>
                        <td className="px-4 py-3">50% to below 55%</td>
                        <td className="px-4 py-3 font-bold">1.3</td>
                        <td className="px-4 py-3 text-slate-500">Poor</td>
                      </tr>
                      <tr className="bg-orange-50/5 hover:bg-orange-50/10">
                        <td className="px-4 py-3 font-black text-orange-500">D</td>
                        <td className="px-4 py-3">45% to below 50%</td>
                        <td className="px-4 py-3 font-bold">1.0</td>
                        <td className="px-4 py-3 text-orange-700 font-bold">Pass (Min Passing Grade)</td>
                      </tr>
                      <tr className="bg-rose-50/20 hover:bg-rose-50/30">
                        <td className="px-4 py-3 font-black text-rose-600">F</td>
                        <td className="px-4 py-3">Below 45%</td>
                        <td className="px-4 py-3 font-bold">0.0</td>
                        <td className="px-4 py-3 text-rose-700 font-bold">Fail</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="mt-5 p-4.5 bg-amber-50/50 border border-amber-200/50 rounded-2xl flex gap-3 items-start">
                  <Award className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-black text-amber-800 uppercase tracking-wider mb-1">Graduation Parameters</h4>
                    <p className="text-[11px] text-amber-700 leading-relaxed font-semibold">
                      To successfully complete the BCSIT degree from Pokhara University, students must secure a minimum grade of 'D' in all registered courses and maintain a minimum cumulative CGPA of 2.00.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

      </div>
    </div>
  );
}