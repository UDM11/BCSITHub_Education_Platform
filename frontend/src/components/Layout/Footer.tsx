import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import {
  BookOpen,
  Mail,
  Phone,
  MapPin,
  ArrowUp,
  ExternalLink,
  Clock,
  Download,
  Send,
  CheckCircle,
  Shield,
  Heart,
} from 'lucide-react';
import { useInstallModal } from '@/context/InstallModalContext';
import { apiClient } from '@/lib/apiClient';
import { toast } from 'react-hot-toast';

export function Footer() {
  const { open: openInstallModal } = useInstallModal();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const location = useLocation();

  const isChapterNotes = /^\/notes\/semester\/[^/]+\/subject\/[^/]+\/chapter\/[^/]+$/.test(location.pathname);
  if (isChapterNotes) return null;

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      const res: any = await apiClient.post('/newsletter/subscribe', { email });
      setLoading(false);
      if (res.requires_verification) {
        setShowOtpInput(true);
        toast.success("Verification code sent to your email!");
      } else if (res.already_subscribed) {
        setSubscribed(true);
        toast.success("You are already subscribed!");
      }
    } catch (err: any) {
      setLoading(false);
      toast.error(err.response?.data?.detail || "Subscription failed.");
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode) return;
    setOtpLoading(true);
    try {
      await apiClient.post('/newsletter/verify', { email, otp: otpCode });
      setOtpLoading(false);
      setSubscribed(true);
      setShowOtpInput(false);
      toast.success("Subscription verified successfully!");
    } catch (err: any) {
      setOtpLoading(false);
      toast.error(err.response?.data?.detail || "Invalid code. Please try again.");
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 18,
      },
    },
  };

  const socialLinks = [
    {
      name: 'Facebook',
      href: 'https://www.facebook.com/',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M22.675 0h-21.35C.593 0 0 .593 0 1.326v21.348C0 23.407.593 24 1.326 24h11.495v-9.294H9.691v-3.622h3.13V8.413c0-3.1 1.894-4.788 4.659-4.788 1.325 0 2.466.099 2.797.143v3.24l-1.918.001c-1.504 0-1.796.715-1.796 1.763v2.313h3.59l-.467 3.622h-3.123V24h6.116c.73 0 1.323-.593 1.323-1.326V1.326C24 .593 23.407 0 22.675 0z" />
        </svg>
      ),
    },
    {
      name: 'LinkedIn',
      href: 'https://www.linkedin.com/',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
      ),
    },
    {
      name: 'Instagram',
      href: 'https://www.instagram.com/',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
        </svg>
      ),
    },
  ];

  const quickLinks = [
    { name: 'Syllabus Grid', href: '/syllabus' },
    { name: 'Subject Notes', href: '/notes' },
    { name: 'Past Exam Papers', href: '/past-papers' },
    { name: 'PU Colleges', href: '/colleges' },
    { name: 'University Notices', href: '/pu-notices' },
  ];

  const learningTools = [
    { name: 'CGPA Calculator', href: '/cgpa-calculator' },
    { name: 'Quiz Generator', href: '/quiz-generator' },
    { name: 'Pomodoro Timer', href: '/pomodoro-timer' },
    { name: 'Code Compiler', href: '/code-compiler' },
  ];

  return (
    <footer className="relative bg-slate-950 text-slate-400 border-t border-slate-900 pt-20 pb-8 overflow-hidden z-10">
      
      {/* Decorative Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-indigo-500/5 rounded-full blur-[120px]" />
        <div className="absolute top-0 left-10 w-96 h-96 bg-purple-500/5 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Top/Main Section */}
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-12 gap-12"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          
          {/* Column 1: Brand & Subscription (Spans 5 cols) */}
          <motion.div variants={itemVariants} className="lg:col-span-5 space-y-6 text-left">
            <div className="flex items-center space-x-3">
              <div className="w-11 h-11 rounded-xl overflow-hidden shadow-md flex items-center justify-center">
                <img src="/logo.jpg" alt="BCSITHub Logo" className="w-full h-full object-cover" />
              </div>
              <span className="text-xl font-extrabold text-white tracking-tight">
                BCSIT<span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">Hub</span>
              </span>
            </div>

            <p className="text-sm text-slate-400 max-w-sm leading-relaxed font-normal">
              Empowering Pokhara University BCSIT students to succeed with organized course materials, interactive tools, and solved past exam papers.
            </p>

            {/* Newsletter Input */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider">
                Subscribe to PU Exam Notices
              </h4>
              <AnimatePresence mode="wait">
                {subscribed ? (
                  <motion.div
                    key="success"
                    className="flex flex-col gap-2 bg-emerald-950/20 border border-emerald-900/50 p-4 rounded-xl text-emerald-400 text-xs font-bold shadow-lg shadow-emerald-950/10 max-w-sm"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 flex-shrink-0 animate-bounce text-emerald-400" />
                      <span>Subscription Successful!</span>
                    </div>
                    <p className="text-[10px] text-emerald-400/80 font-normal leading-relaxed">
                      You are now registered. We will dispatch critical Pokhara University notices to your inbox instantly.
                    </p>
                  </motion.div>
                ) : showOtpInput ? (
                  <motion.form
                    key="otp-form"
                    onSubmit={handleVerifyOtp}
                    className="flex flex-col gap-2 max-w-sm w-full bg-slate-900 border border-slate-800 focus-within:border-indigo-500/50 rounded-xl p-3.5 transition-all text-left"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <span className="text-[10px] font-bold text-indigo-400 tracking-wide">Enter the 6-Digit OTP sent to your email:</span>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        required
                        maxLength={6}
                        placeholder="123456"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                        className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 w-full text-xs text-center font-bold tracking-widest text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                      />
                      <button
                        type="submit"
                        disabled={otpLoading}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-4 py-2 flex items-center justify-center flex-shrink-0 transition-colors shadow-md disabled:opacity-50 font-bold text-xs"
                      >
                        {otpLoading ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          "Verify"
                        )}
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowOtpInput(false)}
                      className="text-[10px] text-slate-500 hover:text-slate-300 font-bold self-start mt-1 cursor-pointer bg-transparent border-0"
                    >
                      ← Back to email input
                    </button>
                  </motion.form>
                ) : (
                  <motion.form
                    key="form"
                    onSubmit={handleSubscribe}
                    className="flex max-w-sm w-full bg-slate-900 border border-slate-800 focus-within:border-indigo-500/50 rounded-xl p-1 transition-all"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <input
                      type="email"
                      required
                      placeholder="Enter your student email..."
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-transparent pl-3.5 pr-2 py-2 w-full text-xs text-white placeholder-slate-500 focus:outline-none"
                    />
                    <button
                      type="submit"
                      disabled={loading}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-4 py-2 flex items-center justify-center flex-shrink-0 transition-colors shadow-md disabled:opacity-50"
                    >
                      {loading ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Send className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Column 2: Quick Links (Spans 2 cols) */}
          <motion.div variants={itemVariants} className="lg:col-span-2 text-left space-y-5">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Academics</h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-sm text-slate-400 hover:text-white transition-all duration-200 flex items-center group"
                  >
                    <span className="transition-transform group-hover:translate-x-1.5 flex items-center gap-1.5">
                      <span className="opacity-0 w-0 group-hover:opacity-100 group-hover:w-3 transition-all text-indigo-400 font-bold">→</span>
                      {link.name}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Column 3: Utilities (Spans 2 cols) */}
          <motion.div variants={itemVariants} className="lg:col-span-2 text-left space-y-5">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Utility Suite</h3>
            <ul className="space-y-3">
              {learningTools.map((tool) => (
                <li key={tool.name}>
                  <Link
                    to={tool.href}
                    className="text-sm text-slate-400 hover:text-white transition-all duration-200 flex items-center group"
                  >
                    <span className="transition-transform group-hover:translate-x-1.5 flex items-center gap-1.5">
                      <span className="opacity-0 w-0 group-hover:opacity-100 group-hover:w-3 transition-all text-purple-400 font-bold">→</span>
                      {tool.name}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Column 4: Contact & Info (Spans 3 cols) */}
          <motion.div variants={itemVariants} className="lg:col-span-3 text-left space-y-5">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Get in Touch</h3>
            <div className="space-y-4">
              {[
                { icon: Mail, text: 'bcsithub@gmail.com', href: 'mailto:bcsithub@gmail.com' },
                { icon: Phone, text: '+977-123456789', href: 'tel:+977123456789' },
                { icon: MapPin, text: 'Kathmandu, Nepal', href: '#' },
              ].map((item, index) => (
                <a
                  key={index}
                  href={item.href}
                  className="flex items-center space-x-3 group cursor-pointer text-slate-400 hover:text-white transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800/80 flex items-center justify-center text-slate-400 group-hover:text-white group-hover:bg-gradient-to-tr group-hover:from-indigo-600 group-hover:to-purple-600 transition-all duration-300">
                    <item.icon className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-semibold">{item.text}</span>
                </a>
              ))}
            </div>

            {/* Social Rows */}
            <div className="flex space-x-2.5 pt-2">
              {socialLinks.map((social) => (
                <motion.a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noreferrer"
                  className="w-9 h-9 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:border-indigo-500/20 transition-all duration-300"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label={social.name}
                >
                  {social.icon}
                </motion.a>
              ))}
            </div>
          </motion.div>

        </motion.div>

        {/* Gradient Divider Line */}
        <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-800 to-transparent my-12" />

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 relative">
          
          {/* Copyrights */}
          <div className="text-left text-[11px] text-slate-500 font-medium tracking-wide flex items-center space-x-1.5 order-2 md:order-1">
            <span>© {new Date().getFullYear()} BCSITHub. All rights reserved.</span>
            <span>•</span>
            <span className="flex items-center">
              Made with <Heart className="w-3 h-3 text-rose-500 fill-rose-500 mx-0.5 animate-pulse" /> for PU Students
            </span>
          </div>

          {/* Navigation terms & Install Modal */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-[11px] font-bold text-slate-500 order-1 md:order-2">
            <button
              type="button"
              onClick={openInstallModal}
              className="flex items-center gap-1 hover:text-indigo-400 transition-colors text-indigo-400/80 font-bold"
            >
              <Download className="w-3 h-3" />
              <span>Install App</span>
            </button>
            <span className="text-slate-700 font-normal">•</span>
            <Link to="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <span className="text-slate-700 font-normal">•</span>
            <Link to="/terms-of-service" className="hover:text-white transition-colors">Terms of Service</Link>
            <span className="text-slate-700 font-normal">•</span>
            <Link to="/support" className="hover:text-white transition-colors">Support</Link>
          </div>

          {/* Frosted Glass Back to Top Button */}
          <motion.button
            onClick={scrollToTop}
            className="w-10 h-10 bg-slate-900/60 backdrop-blur-md border border-slate-800/80 hover:border-indigo-500/30 rounded-full flex items-center justify-center shadow-lg hover:shadow-indigo-500/10 hover:text-indigo-400 text-slate-400 transition-all duration-300 absolute -top-5 md:top-auto md:-bottom-2 right-4 lg:-right-4"
            whileHover={{ 
              scale: 1.1, 
              y: [0, -4, 0],
              transition: { repeat: Infinity, duration: 0.6, ease: "easeInOut" }
            }}
            whileTap={{ scale: 0.95 }}
            aria-label="Scroll to top"
          >
            <ArrowUp className="w-4 h-4" />
          </motion.button>

        </div>
      </div>
    </footer>
  );
}