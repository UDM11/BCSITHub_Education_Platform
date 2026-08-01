import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  Scale, 
  Users, 
  AlertTriangle, 
  Shield, 
  Globe, 
  ArrowLeft, 
  ChevronDown, 
  ChevronRight,
  CheckCircle,
  XCircle,
  Info,
  Mail,
  Phone,
  Calendar,
  Gavel,
  UserX,
  Ban,
  Zap,
  Heart,
  BookOpen
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

interface TermsSection {
  id: string;
  title: string;
  icon: React.ElementType;
  content: string[];
  subsections?: { title: string; content: string[] }[];
}

const termsSections: TermsSection[] = [
  {
    id: 'acceptance',
    title: 'Acceptance of Terms',
    icon: CheckCircle,
    content: [
      'By accessing and using BCSITHub, you accept and agree to be bound by the terms and provision of this agreement.',
      'If you do not agree to abide by the above, please do not use this service.',
      'These terms apply to all visitors, users, and others who access or use the service.'
    ],
    subsections: [
      {
        title: 'Agreement Scope',
        content: [
          'These terms govern your use of our website and services',
          'Additional terms may apply to specific features or services',
          'By creating an account, you confirm your acceptance of these terms'
        ]
      },
      {
        title: 'Updates to Terms',
        content: [
          'We reserve the right to update these terms at any time',
          'Users will be notified of significant changes',
          'Continued use constitutes acceptance of updated terms'
        ]
      }
    ]
  },
  {
    id: 'user-accounts',
    title: 'User Accounts and Registration',
    icon: Users,
    content: [
      'You must provide accurate and complete information when creating an account.',
      'You are responsible for maintaining the confidentiality of your account credentials.',
      'You must notify us immediately of any unauthorized use of your account.'
    ],
    subsections: [
      {
        title: 'Account Requirements',
        content: [
          'Must be a current or prospective BCSIT student',
          'Provide valid email address and contact information',
          'Choose a secure password and keep it confidential'
        ]
      },
      {
        title: 'Account Responsibilities',
        content: [
          'Maintain accuracy of your profile information',
          'Report suspicious activity immediately',
          'Use your account only for legitimate educational purposes'
        ]
      }
    ]
  },
  {
    id: 'acceptable-use',
    title: 'Acceptable Use Policy',
    icon: Shield,
    content: [
      'You agree to use our services only for lawful purposes and in accordance with these terms.',
      'You will not use our platform to transmit harmful, offensive, or illegal content.',
      'Respect the intellectual property rights of others and our platform.'
    ],
    subsections: [
      {
        title: 'Prohibited Activities',
        content: [
          'Harassment, bullying, or threatening other users',
          'Sharing copyrighted material without permission',
          'Attempting to hack or compromise system security',
          'Creating fake accounts or impersonating others'
        ]
      },
      {
        title: 'Content Guidelines',
        content: [
          'Keep all content educational and appropriate',
          'No spam, advertising, or commercial solicitation',
          'Respect privacy and confidentiality of others',
          'Report inappropriate content to moderators'
        ]
      }
    ]
  },
  {
    id: 'intellectual-property',
    title: 'Intellectual Property Rights',
    icon: FileText,
    content: [
      'All content on BCSITHub is protected by copyright and other intellectual property laws.',
      'You retain ownership of content you create and upload to our platform.',
      'By uploading content, you grant us a license to use, display, and distribute it on our platform.'
    ],
    subsections: [
      {
        title: 'Our Content',
        content: [
          'Platform design, features, and functionality are our property',
          'Educational materials may be subject to third-party copyrights',
          'Unauthorized reproduction or distribution is prohibited'
        ]
      },
      {
        title: 'User Content',
        content: [
          'You retain ownership of your original content',
          'Grant us license to display and share your content',
          'Ensure you have rights to any content you upload'
        ]
      }
    ]
  },
  {
    id: 'privacy-data',
    title: 'Privacy and Data Protection',
    icon: Globe,
    content: [
      'Your privacy is important to us. Please review our Privacy Policy for details on data collection and use.',
      'We implement appropriate security measures to protect your personal information.',
      'You have rights regarding your personal data as outlined in our Privacy Policy.'
    ],
    subsections: [
      {
        title: 'Data Collection',
        content: [
          'We collect information necessary to provide our services',
          'Usage data helps us improve platform functionality',
          'Personal information is handled according to privacy laws'
        ]
      },
      {
        title: 'Data Security',
        content: [
          'Industry-standard encryption and security measures',
          'Regular security audits and updates',
          'Prompt notification of any security breaches'
        ]
      }
    ]
  },
  {
    id: 'termination',
    title: 'Account Termination',
    icon: UserX,
    content: [
      'We reserve the right to terminate or suspend accounts that violate these terms.',
      'You may terminate your account at any time by contacting us.',
      'Upon termination, your access to the service will cease immediately.'
    ],
    subsections: [
      {
        title: 'Grounds for Termination',
        content: [
          'Violation of acceptable use policy',
          'Fraudulent or illegal activity',
          'Repeated policy violations despite warnings',
          'Inactive accounts may be suspended'
        ]
      },
      {
        title: 'Termination Process',
        content: [
          'Warning system for minor violations',
          'Immediate suspension for serious violations',
          'Appeal process available for disputed actions',
          'Data retention according to privacy policy'
        ]
      }
    ]
  },
  {
    id: 'disclaimers',
    title: 'Disclaimers and Limitations',
    icon: AlertTriangle,
    content: [
      'Our services are provided "as is" without warranties of any kind.',
      'We do not guarantee the accuracy or completeness of educational content.',
      'We are not liable for any damages arising from use of our services.'
    ],
    subsections: [
      {
        title: 'Service Availability',
        content: [
          'Services may be temporarily unavailable for maintenance',
          'No guarantee of uninterrupted access',
          'Third-party service dependencies may affect availability'
        ]
      },
      {
        title: 'Educational Content',
        content: [
          'Content is for educational purposes only',
          'Verify information with official sources',
          'We are not responsible for academic decisions based on our content'
        ]
      }
    ]
  }
];

export function TermsOfService() {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<string>('acceptance');

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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-green-50">
      {/* Animated Background */}
      <motion.div 
        className="fixed inset-0 opacity-5 pointer-events-none"
        animate={{
          background: [
            'radial-gradient(circle at 20% 50%, rgba(34, 197, 94, 0.3) 0%, transparent 50%)',
            'radial-gradient(circle at 80% 20%, rgba(59, 130, 246, 0.3) 0%, transparent 50%)',
            'radial-gradient(circle at 40% 80%, rgba(168, 85, 247, 0.3) 0%, transparent 50%)'
          ]
        }}
        transition={{ duration: 10, repeat: Infinity }}
      />

      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <Link to="/" className="flex items-center text-gray-600 hover:text-green-600 transition-colors">
                <ArrowLeft className="w-5 h-5 mr-2" />
                <span className="hidden sm:inline">Back to Home</span>
                <span className="sm:hidden">Back</span>
              </Link>
              <div className="h-6 w-px bg-gray-300" />
              <div className="flex items-center">
                <Scale className="w-6 h-6 mr-2 text-green-600" />
                <h1 className="text-lg sm:text-xl font-bold text-gray-900">Terms of Service</h1>
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
                  <Gavel className="w-5 h-5 mr-2 text-green-600" />
                  Table of Contents
                </h3>
                <nav className="space-y-2">
                  {termsSections.map((section, index) => (
                    <motion.button
                      key={section.id}
                      onClick={() => scrollToSection(section.id)}
                      className={`w-full text-left p-3 rounded-lg transition-all duration-300 flex items-center group ${
                        activeSection === section.id
                          ? 'bg-green-100 text-green-700 border-2 border-green-300'
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
                      Contact Legal Team
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
                className="w-20 h-20 bg-gradient-to-br from-green-500 to-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-6"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Scale className="w-10 h-10 text-white" />
              </motion.div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                Terms of Service
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed px-4">
                These terms govern your use of BCSITHub and outline the rights and responsibilities 
                of all users of our educational platform.
              </p>
              
              {/* Trust Indicators */}
              <motion.div 
                className="flex items-center justify-center space-x-8 mt-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                {[
                  { icon: Scale, label: 'Fair', color: 'text-green-600' },
                  { icon: Shield, label: 'Protected', color: 'text-blue-600' },
                  { icon: Heart, label: 'Respectful', color: 'text-red-600' }
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

            {/* Terms Sections */}
            <div className="space-y-8">
              {termsSections.map((section, index) => (
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
                        whileHover={{ backgroundColor: "rgba(34, 197, 94, 0.02)" }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <motion.div 
                              className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-600 rounded-2xl flex items-center justify-center"
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
                                            <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
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
              <Card className="shadow-xl border-0 bg-gradient-to-br from-green-500 to-blue-600 text-white">
                <CardContent className="p-8 text-center">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="mb-6"
                  >
                    <div className="w-16 h-16 bg-white/20 rounded-3xl flex items-center justify-center mx-auto mb-4">
                      <Gavel className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold mb-2">Questions About These Terms?</h3>
                    <p className="text-green-100 mb-6 text-sm sm:text-base">
                      Our legal team is here to help clarify any questions about our terms of service.
                    </p>
                  </motion.div>
                  
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button
                      className="text-green-600 hover:bg-green-50"
                      size="lg"
                    >
                      <Mail className="w-5 h-5 mr-2" />
                      Contact Legal Team
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
                <span>These terms ensure a safe and productive learning environment for all users</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}