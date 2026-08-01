import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';

import { AuthProvider } from './context/AuthContext';
import { ProfileProvider } from './context/ProfileContext';
import { PWAInstallProvider } from './context/PWAInstallContext';
import { InstallModalProvider } from './context/InstallModalContext';

import { Navbar } from './components/Layout/Navbar';
import { Footer } from './components/Layout/Footer';
import { PWAInstallBanner } from './components/PWAInstallBanner';
import ProtectedRoute from './components/routes/ProtectedRoute';
import ScrollToTop from './components/ScrollToTop';
import { useAuth } from './context/AuthContext';

import { Toaster } from 'react-hot-toast';
import { ToastContainer } from './components/ui/Toast';

// Pages
import { Home } from './pages/Home';
import { SignIn } from './pages/auth/SignIn';
import { SignUp } from './pages/auth/SignUp';
import { ForgotPassword } from './pages/auth/ForgotPassword';
import { Syllabus } from './pages/Syllabus';
import { Notes } from './pages/Notes/Notes';
import { PastPapers } from './pages/PastPapers';
import { Colleges } from './pages/Colleges';
import { CGPACalculator } from './pages/CGPACalculator';
import { PomodoroTimer } from './pages/PomodoroTimer';
import { CodeCompiler } from './pages/CodeCompiler';
import { QuizGenerator } from './pages/QuizGenerator';
import { PrivacyPolicy } from './pages/PrivacyPolicy';
import { TermsOfService } from './pages/TermsOfService';
import { Support } from './pages/Support';
import PUNotices from './pages/PUNotices';
import UploadPaper from './pages/UploadPaper';
import SemesterSubjects from './pages/Notes/SemesterSubjects';
import SubjectChapters from './pages/Notes/SubjectChapters';
import ChapterNotes from './pages/Notes/ChapterNotes';

// Dashboards
import AdminDashboard from './dashboard/admin/AdminDashboard';
import StudentProfile from './dashboard/student/StudentProfile';
import TeacherDashboard from './dashboard/teacher/TeacherDashboard';

// Email Verification Page
import OTPVerification from './pages/auth/EmailVerification';
import OAuthCallback from './pages/auth/OAuthCallback';
import CompleteProfile from './pages/auth/CompleteProfile';

// Not Found Page
import { NotFound } from './pages/NotFound';

function AppContent() {
  const { user } = useAuth();
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin-dashboard');

  return (
    <div className="flex flex-col min-h-screen">
      {!isAdminRoute && <Navbar />}
      <PWAInstallBanner />

      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/syllabus" element={<Syllabus />} />
          <Route path="/notes" element={<Notes />} />
          <Route path="/notes/semester/:semesterId" element={<SemesterSubjects />} />

          {/* Subject chapters route with 'subject' segment */}
          <Route
            path="/notes/semester/:semesterId/subject/:subjectId"
            element={<SubjectChapters />}
          />

          <Route
            path="/notes/semester/:semesterId/subject/:subjectId/chapter/:chapterId"
            element={<ChapterNotes />}
          />

          <Route path="/past-papers" element={<PastPapers />} />
          <Route path="/colleges" element={<Colleges />} />
          <Route path="/cgpa-calculator" element={<CGPACalculator />} />
          <Route path="/pomodoro-timer" element={<PomodoroTimer />} />
          <Route path="/code-compiler" element={<CodeCompiler />} />
          <Route path="/quiz-generator" element={<QuizGenerator />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />
          <Route path="/support" element={<Support />} />
          <Route path="/pu-notices" element={<PUNotices />} />

          <Route path="/verify" element={<OTPVerification />} />
          <Route path="/auth/callback" element={<OAuthCallback />} />
          <Route path="/complete-profile" element={<CompleteProfile />} />

          {/* Protected Routes */}
          <Route
            path="/upload-paper"
            element={
              <ProtectedRoute>
                <UploadPaper />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin-dashboard"
            element={
              <ProtectedRoute adminOnly>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher-dashboard"
            element={
              <ProtectedRoute>
                <TeacherDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <StudentProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <StudentProfile />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      {!isAdminRoute && <Footer />}

      <ToastContainer />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <ProfileProvider>
        <PWAInstallProvider>
        <InstallModalProvider>
        <Router>
          <ScrollToTop />
          <AppContent />

          <Toaster
            position="top-right"
            toastOptions={{
              duration: 5000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#4BB543',
                  secondary: '#fff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ff3333',
                  secondary: '#fff',
                },
              },
            }}
          />
        </Router>
        </InstallModalProvider>
        </PWAInstallProvider>
      </ProfileProvider>
    </AuthProvider>
  );
}

export default App;
