import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HelpCircle, 
  MessageCircle, 
  Phone, 
  Mail, 
  Search, 
  ArrowLeft, 
  ChevronDown, 
  CheckCircle,
  Clock,
  Send,
  FileText,
  Video,
  Book,
  Zap,
  ThumbsUp,
  Settings,
  Users,
  Headphones
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  helpful: number;
}

interface SupportCategory {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  items: string[];
}

const faqItems: FAQItem[] = [
  {
    id: '1',
    question: 'How do I create an account on BCSITHub?',
    answer: 'To create an account, click the "Sign Up" button in the top right corner, fill in your details including your student ID, email, and create a secure password. You\'ll receive a verification email to activate your account.',
    category: 'account',
    helpful: 45
  },
  {
    id: '2',
    question: 'How can I access past papers and notes?',
    answer: 'Once logged in, navigate to the "Notes" or "Past Papers" section from the main menu. You can filter by semester, subject, and year to find the specific materials you need.',
    category: 'academic',
    helpful: 38
  },
  {
    id: '3',
    question: 'Is the CGPA calculator accurate?',
    answer: 'Yes, our CGPA calculator follows the official Pokhara University grading system. However, always verify important calculations with your academic advisor for official purposes.',
    category: 'tools',
    helpful: 52
  },
  {
    id: '4',
    question: 'How do I report inappropriate content?',
    answer: 'You can report inappropriate content by clicking the "Report" button next to any post or content, or by contacting our moderation team directly through the contact form.',
    category: 'safety',
    helpful: 29
  },
  {
    id: '5',
    question: 'Can I contribute notes and materials?',
    answer: 'Absolutely! We encourage students to share their notes and materials. Use the "Upload" feature in the respective sections, and our team will review and approve quality content.',
    category: 'contribution',
    helpful: 41
  },
  {
    id: '6',
    question: 'How do I reset my password?',
    answer: 'Click "Forgot Password" on the login page, enter your email address, and follow the instructions in the reset email. Make sure to check your spam folder if you don\'t see the email.',
    category: 'account',
    helpful: 33
  }
];

const supportCategories: SupportCategory[] = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    description: 'New to BCSITHub? Learn the basics',
    icon: Book,
    color: 'from-blue-500 to-cyan-500',
    items: ['Account Setup', 'Platform Navigation', 'First Steps Guide', 'Profile Completion']
  },
  {
    id: 'academic-help',
    title: 'Academic Support',
    description: 'Help with studies and resources',
    icon: Users,
    color: 'from-emerald-500 to-teal-500',
    items: ['Finding Notes', 'Past Papers Access', 'Study Groups', 'Academic Calendar']
  },
  {
    id: 'technical-support',
    title: 'Technical Issues',
    description: 'Troubleshooting and bug reports',
    icon: Settings,
    color: 'from-purple-500 to-pink-500',
    items: ['Login Problems', 'Upload Issues', 'Browser Compatibility', 'Mobile App Support']
  },
  {
    id: 'tools-features',
    title: 'Tools & Features',
    description: 'Using our educational tools',
    icon: Zap,
    color: 'from-indigo-500 to-purple-500',
    items: ['CGPA Calculator', 'Quiz Generator', 'Pomodoro Timer', 'Code Compiler']
  }
];

export function Support() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    priority: 'medium'
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  };

  const filteredFAQs = faqItems.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleFAQ = (faqId: string) => {
    setExpandedFAQ(expandedFAQ === faqId ? null : faqId);
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Contact form submitted:', contactForm);
    toast.success('Your support message was sent successfully!');
    setContactForm({
      name: '',
      email: '',
      subject: '',
      message: '',
      priority: 'medium'
    });
  };

  return (
    <div className="min-h-screen bg-slate-50/30">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-40">
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

      {/* Header */}
      <div className="bg-white/85 backdrop-blur-md border-b border-slate-100 sticky top-0 z-40 shadow-sm relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4.5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <Link to="/" className="flex items-center text-slate-655 hover:text-purple-650 transition-colors text-sm font-semibold">
                <ArrowLeft className="w-4 h-4 mr-1.5" />
                Back to Home
              </Link>
              <div className="h-4 w-px bg-slate-200" />
              <div className="flex items-center">
                <Headphones className="w-5 h-5 mr-2 text-purple-600 animate-pulse" />
                <h1 className="text-lg font-bold text-slate-800">Support Center</h1>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-xs font-bold text-slate-500">
              <Clock className="w-4 h-4 text-slate-400" />
              <span>24/7 Support Desk Available</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">
        {/* Hero Section */}
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-650 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-indigo-500/10"
            whileHover={{ scale: 1.08, rotate: 3 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <HelpCircle className="w-8 h-8 text-white" />
          </motion.div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-855 mb-4 tracking-tight leading-tight">
            How can we help you today?
          </h2>
          <p className="text-base sm:text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed mb-8">
            Get instant answers to your questions or reach out to our customer support team. 
            We're here to make your BCSITHub experience smooth and productive.
          </p>

          {/* Search Bar */}
          <motion.div
            className="relative max-w-xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400 w-4.5 h-4.5" />
            <input
              type="text"
              placeholder="Search help articles, FAQs, or topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all duration-300 bg-white text-slate-800 placeholder:text-slate-400 shadow-sm"
            />
          </motion.div>
        </motion.div>

        {/* Support Categories */}
        <motion.div
          className="mb-16"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <h3 className="text-xl font-bold text-slate-800 mb-8 text-center">Browse Help by Category</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {supportCategories.map((category) => (
              <motion.div
                key={category.id}
                variants={itemVariants}
                whileHover={{ y: -4 }}
                className="cursor-pointer"
              >
                <Card className="border border-slate-105 shadow-premium bg-white h-full hover:border-indigo-200 transition-all duration-300 rounded-2xl">
                  <CardContent className="p-6">
                    <div className={`w-11 h-11 bg-gradient-to-br ${category.color} rounded-xl flex items-center justify-center mb-4 shadow-sm`}>
                      <category.icon className="w-5 h-5 text-white" />
                    </div>
                    <h4 className="text-base font-bold text-slate-800 mb-2">{category.title}</h4>
                    <p className="text-xs text-slate-500 font-semibold mb-4 leading-relaxed">{category.description}</p>
                    <ul className="space-y-1.5">
                      {category.items.map((item, itemIndex) => (
                        <li key={itemIndex} className="text-xs text-slate-500 font-bold flex items-center">
                          <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full mr-2" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* FAQ Section */}
          <motion.div 
            className="lg:col-span-2"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <h3 className="text-xl font-bold text-slate-800">Frequently Asked Questions</h3>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full sm:w-auto px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white text-slate-705 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 font-bold transition-all"
              >
                <option value="all">All Categories</option>
                <option value="account">Account Setup</option>
                <option value="academic">Academic Resources</option>
                <option value="tools">Utilities</option>
                <option value="safety">Platform Safety</option>
                <option value="contribution">Material Uploads</option>
              </select>
            </div>

            <div className="space-y-4">
              {filteredFAQs.map((faq, index) => (
                <motion.div
                  key={faq.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="border border-slate-105 shadow-premium bg-white rounded-2xl overflow-hidden hover:border-slate-200 transition-colors">
                    <CardContent className="p-0">
                      <div
                        className="p-6 cursor-pointer"
                        onClick={() => toggleFAQ(faq.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="text-sm font-bold text-slate-800 mb-2 pr-4 leading-snug">
                              {faq.question}
                            </h4>
                            <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs font-semibold text-slate-505">
                              <span className="flex items-center">
                                <ThumbsUp className="w-3.5 h-3.5 mr-1 text-slate-400" />
                                {faq.helpful} helpful votes
                              </span>
                              <span className="capitalize px-2.5 py-0.5 bg-slate-55 border border-slate-100 rounded-full text-[10px] font-bold text-slate-600">
                                {faq.category}
                              </span>
                            </div>
                          </div>
                          <motion.div
                            animate={{ rotate: expandedFAQ === faq.id ? 180 : 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <ChevronDown className="w-4 h-4 text-slate-400" />
                          </motion.div>
                        </div>
                      </div>

                      <AnimatePresence>
                        {expandedFAQ === faq.id && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="border-t border-slate-50"
                          >
                            <div className="p-6 bg-slate-50/20 text-xs font-semibold text-slate-600 leading-relaxed">
                              <p className="mb-4">{faq.answer}</p>
                              <div className="flex items-center justify-between border-t border-slate-50 pt-4 mt-2">
                                <span className="text-[10px] uppercase tracking-wider text-slate-455 font-bold">Was this article helpful?</span>
                                <div className="flex space-x-2">
                                  <Button size="sm" variant="outline" className="text-[10px] font-bold px-3 py-1 bg-white border-slate-200">
                                    <ThumbsUp className="w-3 h-3 mr-1 text-indigo-650" />
                                    Yes
                                  </Button>
                                  <Button size="sm" variant="outline" className="text-[10px] font-bold px-3 py-1 bg-white border-slate-200">
                                    No
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            className="lg:col-span-1"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Card className="border border-slate-105 shadow-premium bg-white/95 backdrop-blur-md lg:sticky lg:top-24 rounded-2xl">
              <CardContent className="p-6">
                <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center">
                  <MessageCircle className="w-5 h-5 mr-2 text-indigo-605 animate-bounce" />
                  Contact Support
                </h3>
                
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-550 mb-1.5 uppercase tracking-wider">Your Name</label>
                    <input
                      type="text"
                      value={contactForm.name}
                      onChange={(e) => setContactForm({...contactForm, name: e.target.value})}
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs bg-white text-slate-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 font-semibold transition-all"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-[10px] font-bold text-slate-555 mb-1.5 uppercase tracking-wider">Email Address</label>
                    <input
                      type="email"
                      value={contactForm.email}
                      onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs bg-white text-slate-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 font-semibold transition-all"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-[10px] font-bold text-slate-555 mb-1.5 uppercase tracking-wider">Subject</label>
                    <input
                      type="text"
                      value={contactForm.subject}
                      onChange={(e) => setContactForm({...contactForm, subject: e.target.value})}
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs bg-white text-slate-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 font-semibold transition-all"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-[10px] font-bold text-slate-555 mb-1.5 uppercase tracking-wider">Priority Level</label>
                    <select
                      value={contactForm.priority}
                      onChange={(e) => setContactForm({...contactForm, priority: e.target.value})}
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs bg-white text-slate-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 font-bold transition-all"
                    >
                      <option value="low">Low Priority</option>
                      <option value="medium">Medium Priority</option>
                      <option value="high">High Priority</option>
                      <option value="urgent">Urgent Escalation</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-[10px] font-bold text-slate-555 mb-1.5 uppercase tracking-wider">Message</label>
                    <textarea
                      value={contactForm.message}
                      onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                      rows={4}
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs bg-white text-slate-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 font-semibold transition-all"
                      required
                    />
                  </div>
                  
                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-650 hover:brightness-110 text-white font-bold py-3 rounded-xl shadow-md border-0 transition-all text-xs flex items-center justify-center gap-1.5"
                  >
                    <Send className="w-4 h-4" />
                    <span>Send Message</span>
                  </button>
                </form>

                {/* Quick Contact Options */}
                <div className="mt-8 pt-6 border-t border-slate-100 text-xs font-bold text-slate-500">
                  <h4 className="text-sm font-bold text-slate-805 mb-4">Other Ways to Reach Us</h4>
                  <div className="space-y-3.5">
                    <div className="flex items-center">
                      <Mail className="w-4 h-4 mr-3 text-indigo-650" />
                      <span>support@bcsithub.com</span>
                    </div>
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 mr-3 text-indigo-650" />
                      <span>+977-123-456-789</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-3 text-indigo-650" />
                      <span>24/7 Virtual Support Available</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Additional Resources */}
        <motion.div
          className="mt-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <Card className="border-0 shadow-premium bg-gradient-to-br from-indigo-650 via-purple-605 to-indigo-900 text-white rounded-2xl overflow-hidden">
            <CardContent className="p-8 text-center relative">
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full blur-2xl" />
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="mb-6"
              >
                <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/10">
                  <Video className="w-7 h-7 text-white animate-pulse" />
                </div>
                <h3 className="text-2xl font-black mb-2">Need More Guidance?</h3>
                <p className="text-indigo-100 text-sm max-w-md mx-auto mb-6">
                  Check out our video walkthrough tutorials, user documentation guides, and community forum pages.
                </p>
              </motion.div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
                <Button
                  className="bg-white hover:bg-slate-50 text-indigo-650 font-bold border-0"
                  size="lg"
                >
                  <Video className="w-4.5 h-4.5 mr-2 text-indigo-600" />
                  <span>Video Tutorials</span>
                </Button>
                <Button
                  variant="outline"
                  className="border-white/30 hover:bg-white/10 text-white font-bold"
                  size="lg"
                >
                  <FileText className="w-4.5 h-4.5 mr-2" />
                  <span>User Guide</span>
                </Button>
                <Button
                  variant="outline"
                  className="border-white/30 hover:bg-white/10 text-white font-bold"
                  size="lg"
                >
                  <Users className="w-4.5 h-4.5 mr-2" />
                  <span>Community Forum</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}