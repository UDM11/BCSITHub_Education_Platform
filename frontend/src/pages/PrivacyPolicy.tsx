import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, 
  Lock, 
  Eye, 
  Database, 
  Users, 
  Globe, 
  ArrowLeft, 
  ChevronDown, 
  ChevronRight,
  CheckCircle,
  AlertTriangle,
  Info,
  Mail,
  Phone,
  Calendar,
  FileText,
  Settings,
  UserCheck,
  Zap,
  Heart,
  BookOpen
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

interface PolicySection {
  id: string;
  title: string;
  icon: React.ElementType;
  content: string[];
  subsections?: { title: string; content: string[] }[];
}

const policySections: PolicySection[] = [
  {
    id: 'information-collection',
    title: 'Information We Collect',
    icon: Database,
    content: [
      'We collect information you provide directly to us, such as when you create an account, use our services, or contact us.',
      'We automatically collect certain information about your device and usage of our services.',
      'We may receive information about you from third parties, such as social media platforms.'
    ],
    subsections: [
      {
        title: 'Personal Information',
        content: [
          'Name, email address, and contact information',
          'Academic information and progress data',
          'Profile preferences and settings'
        ]
      },
      {
        title: 'Usage Data',
        content: [
          'Device information and browser type',
          'IP address and location data',
          'Pages visited and time spent on our platform'
        ]
      }
    ]
  },
  {
    id: 'information-use',
    title: 'How We Use Your Information',
    icon: Settings,
    content: [
      'To provide, maintain, and improve our educational services',
      'To personalize your learning experience and recommendations',
      'To communicate with you about our services and updates'
    ],
    subsections: [
      {
        title: 'Service Provision',
        content: [
          'Delivering personalized educational content',
          'Tracking academic progress and achievements',
          'Providing customer support and assistance'
        ]
      },
      {
        title: 'Communication',
        content: [
          'Sending important service notifications',
          'Sharing educational updates and resources',
          'Responding to your inquiries and feedback'
        ]
      }
    ]
  },
  {
    id: 'information-sharing',
    title: 'Information Sharing and Disclosure',
    icon: Users,
    content: [
      'We do not sell, trade, or rent your personal information to third parties',
      'We may share information in certain limited circumstances as described below',
      'We require third parties to maintain the confidentiality of your information'
    ],
    subsections: [
      {
        title: 'Service Providers',
        content: [
          'Third-party services that help us operate our platform',
          'Analytics providers to improve our services',
          'Cloud storage and hosting providers'
        ]
      },
      {
        title: 'Legal Requirements',
        content: [
          'When required by law or legal process',
          'To protect our rights and prevent fraud',
          'In case of emergency to protect user safety'
        ]
      }
    ]
  },
  {
    id: 'data-security',
    title: 'Data Security',
    icon: Lock,
    content: [
      'We implement appropriate technical and organizational measures to protect your information',
      'We use encryption and secure protocols to safeguard data transmission',
      'We regularly review and update our security practices'
    ],
    subsections: [
      {
        title: 'Technical Safeguards',
        content: [
          'SSL/TLS encryption for data transmission',
          'Secure database storage with access controls',
          'Regular security audits and monitoring'
        ]
      },
      {
        title: 'Access Controls',
        content: [
          'Limited access to personal information',
          'Employee training on data protection',
          'Multi-factor authentication for admin access'
        ]
      }
    ]
  },
  {
    id: 'user-rights',
    title: 'Your Rights and Choices',
    icon: UserCheck,
    content: [
      'You have the right to access, update, or delete your personal information',
      'You can control your privacy settings and communication preferences',
      'You may request a copy of your data or account deletion'
    ],
    subsections: [
      {
        title: 'Data Access',
        content: [
          'View and download your personal data',
          'Request corrections to inaccurate information',
          'Export your academic progress and achievements'
        ]
      },
      {
        title: 'Privacy Controls',
        content: [
          'Manage notification preferences',
          'Control data sharing settings',
          'Opt-out of non-essential communications'
        ]
      }
    ]
  },
  {
    id: 'cookies',
    title: 'Cookies and Tracking',
    icon: Eye,
    content: [
      'We use cookies and similar technologies to enhance your experience',
      'Cookies help us remember your preferences and improve our services',
      'You can control cookie settings through your browser'
    ],
    subsections: [
      {
        title: 'Types of Cookies',
        content: [
          'Essential cookies for basic functionality',
          'Analytics cookies to understand usage patterns',
          'Preference cookies to remember your settings'
        ]
      },
      {
        title: 'Cookie Management',
        content: [
          'Browser settings to control cookies',
          'Opt-out options for analytics tracking',
          'Clear cookies and browsing data anytime'
        ]
      }
    ]
  }
];

export function PrivacyPolicy() {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<string>('information-collection');

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

  const sectionVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        type: "spring",
        stiffness: 120,
        damping: 20
      }
    }
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSection(expandedSection === sectionId ? null : sectionId);
  };

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {/* Animated Background */}
      <motion.div 
        className="fixed inset-0 opacity-5 pointer-events-none"
        animate={{
          background: [
            'radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.3) 0%, transparent 50%)',
            'radial-gradient(circle at 80% 20%, rgba(99, 102, 241, 0.3) 0%, transparent 50%)',
            'radial-gradient(circle at 40% 80%, rgba(139, 92, 246, 0.3) 0%, transparent 50%)'
          ]
        }}
        transition={{ duration: 10, repeat: Infinity }}
      />

      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <Link to="/" className="flex items-center text-gray-600 hover:text-blue-600 transition-colors">
                <ArrowLeft className="w-5 h-5 mr-2" />
                <span className="hidden sm:inline">Back to Home</span>
                <span className="sm:hidden">Back</span>
              </Link>
              <div className="h-6 w-px bg-gray-300" />
              <div className="flex items-center">
                <Shield className="w-6 h-6 mr-2 text-blue-600" />
                <h1 className="text-lg sm:text-xl font-bold text-gray-900">Privacy Policy</h1>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-500">
              <Calendar className="w-4 h-4" />
              <span className="hidden sm:inline">Last updated: January 2025</span>
              <span className="sm:hidden">Jan 2025</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Table of Contents - Sidebar */}
          <motion.div 
            className="lg:col-span-1"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Card className="lg:sticky lg:top-24 shadow-lg border-0 bg-white">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-blue-600" />
                  Table of Contents
                </h3>
                <nav className="space-y-2">
                  {policySections.map((section, index) => (
                    <motion.button
                      key={section.id}
                      onClick={() => scrollToSection(section.id)}
                      className={`w-full text-left p-3 rounded-lg transition-all duration-300 flex items-center group ${
                        activeSection === section.id
                          ? 'bg-blue-100 text-blue-700 border-2 border-blue-300'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                      whileHover={{ scale: 1.02, x: 5 }}
                      whileTap={{ scale: 0.98 }}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <section.icon className="w-4 h-4 mr-3 flex-shrink-0" />
                      <span className="text-xs sm:text-sm font-medium">{section.title}</span>
                      <ChevronRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                    </motion.button>
                  ))}
                </nav>

                {/* Quick Actions */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Quick Actions</h4>
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start text-sm"
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      Contact Us
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start text-sm"
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Download PDF
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Main Content */}
          <motion.div 
            className="lg:col-span-3"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Hero Section */}
            <motion.div 
              className="text-center mb-12"
              variants={itemVariants}
            >
              <motion.div
                className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Shield className="w-10 h-10 text-white" />
              </motion.div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                Privacy Policy
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed px-4">
                Your privacy is important to us. This policy explains how BCSITHub collects, 
                uses, and protects your personal information.
              </p>
              
              {/* Trust Indicators */}
              <motion.div 
                className="flex items-center justify-center space-x-8 mt-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                {[
                  { icon: Lock, label: 'Secure', color: 'text-green-600' },
                  { icon: UserCheck, label: 'Transparent', color: 'text-blue-600' },
                  { icon: Heart, label: 'Trusted', color: 'text-red-600' }
                ].map((item, index) => (
                  <motion.div
                    key={item.label}
                    className="flex items-center space-x-2"
                    whileHover={{ scale: 1.05 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 + index * 0.1 }}
                  >
                    <item.icon className={`w-5 h-5 ${item.color}`} />
                    <span className="text-sm font-medium text-gray-700">{item.label}</span>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

            {/* Policy Sections */}
            <div className="space-y-8">
              {policySections.map((section, index) => (
                <motion.div
                  key={section.id}
                  id={section.id}
                  variants={sectionVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-100px" }}
                  className="scroll-mt-24"
                >
                  <Card className="shadow-lg border-0 bg-white overflow-hidden">
                    <CardContent className="p-0">
                      <motion.div
                        className="p-6 cursor-pointer"
                        onClick={() => toggleSection(section.id)}
                        whileHover={{ backgroundColor: "rgba(59, 130, 246, 0.02)" }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <motion.div 
                              className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center"
                              whileHover={{ scale: 1.1, rotate: 5 }}
                            >
                              <section.icon className="w-6 h-6 text-white" />
                            </motion.div>
                            <div className="flex-1 min-w-0">
                              <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-1">
                                {section.title}
                              </h3>
                              <p className="text-sm sm:text-base text-gray-600 line-clamp-2">
                                {section.content[0].substring(0, 100)}...
                              </p>
                            </div>
                          </div>
                          <motion.div
                            animate={{ rotate: expandedSection === section.id ? 180 : 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <ChevronDown className="w-6 h-6 text-gray-400" />
                          </motion.div>
                        </div>
                      </motion.div>

                      <AnimatePresence>
                        {expandedSection === section.id && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="border-t border-gray-100"
                          >
                            <div className="p-6 space-y-6">
                              {/* Main Content */}
                              <div className="space-y-4">
                                {section.content.map((paragraph, pIndex) => (
                                  <motion.p
                                    key={pIndex}
                                    className="text-gray-700 leading-relaxed"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: pIndex * 0.1 }}
                                  >
                                    {paragraph}
                                  </motion.p>
                                ))}
                              </div>

                              {/* Subsections */}
                              {section.subsections && (
                                <div className="space-y-6">
                                  {section.subsections.map((subsection, sIndex) => (
                                    <motion.div
                                      key={sIndex}
                                      className="bg-gray-50 rounded-xl p-6"
                                      initial={{ opacity: 0, x: -20 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      transition={{ delay: 0.2 + sIndex * 0.1 }}
                                    >
                                      <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                                        <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
                                        {subsection.title}
                                      </h4>
                                      <ul className="space-y-2">
                                        {subsection.content.map((item, iIndex) => (
                                          <motion.li
                                            key={iIndex}
                                            className="flex items-start space-x-3 text-gray-700"
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.3 + iIndex * 0.05 }}
                                          >
                                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                                            <span>{item}</span>
                                          </motion.li>
                                        ))}
                                      </ul>
                                    </motion.div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Contact Section */}
            <motion.div
              className="mt-16"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Card className="shadow-xl border-0 bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                <CardContent className="p-8 text-center">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="mb-6"
                  >
                    <div className="w-16 h-16 bg-white/20 rounded-3xl flex items-center justify-center mx-auto mb-4">
                      <Mail className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold mb-2">Questions About Your Privacy?</h3>
                    <p className="text-blue-100 mb-6 text-sm sm:text-base">
                      We're here to help. Contact our privacy team for any questions or concerns.
                    </p>
                  </motion.div>
                  
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button
                      className="text-blue-600 hover:bg-blue-50"
                      size="lg"
                    >
                      <Mail className="w-5 h-5 mr-2" />
                      Contact Privacy Team
                    </Button>
                    <Button
                      variant="outline"
                      className="border-white text-white hover:bg-white/10"
                      size="lg"
                    >
                      <Phone className="w-5 h-5 mr-2" />
                      Call Support
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Footer Note */}
            <motion.div
              className="mt-12 text-center"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center justify-center space-x-2 text-gray-500 text-sm">
                <BookOpen className="w-4 h-4" />
                <span>This policy is part of our commitment to transparency and user privacy</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}