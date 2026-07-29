import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Mail, Lock, User, UserPlus, BookOpen, MapPin, Eye, EyeOff, Shield, Users, Award, CheckCircle, ArrowRight, Sparkles, Star, GraduationCap, Building, Calendar } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { useAuth } from '../../context/AuthContext';

const schema = yup.object({
  name: yup.string().required('Name is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup
    .string()
    .min(8, 'Password must be at least 8 characters')
    .required('Password is required'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'Passwords must match')
    .required('Confirm password is required'),
  role: yup.string().required('Role is required'),
  semester: yup.number().when('role', {
    is: 'student',
    then: (schema) => schema.required('Semester is required for students'),
    otherwise: (schema) => schema.notRequired(),
  }),
  college: yup.string().when('role', {
    is: 'student',
    then: (schema) => schema.required('College is required for students'),
    otherwise: (schema) => schema.notRequired(),
  }),
});

interface FormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: string;
  semester?: number;
  college?: string;
}

const roleOptions = [
  { value: 'student', label: 'Student' },
  { value: 'teacher', label: 'Teacher' },
];

const semesterOptions = [
  { value: 1, label: '1st Semester' },
  { value: 2, label: '2nd Semester' },
  { value: 3, label: '3rd Semester' },
  { value: 4, label: '4th Semester' },
  { value: 5, label: '5th Semester' },
  { value: 6, label: '6th Semester' },
  { value: 7, label: '7th Semester' },
  { value: 8, label: '8th Semester' },
];

const collegeOptions = [
  { value: 'Ace Institute of Management', label: 'Ace Institute of Management', address: 'Bibhuti Janak Marg, New Baneshwor, Kathmandu' },
  { value: 'Gandaki College of Engineering and Science', label: 'Gandaki College of Engineering and Science', address: 'Pokhara, Kaski' },
  { value: 'Nepal College of Information Technology', label: 'Nepal College of Information Technology', address: 'Balkumari, Lalitpur' },
  { value: 'Pokhara University', label: 'Pokhara University', address: 'Pokhara, Kaski' },
  { value: 'Prime College', label: 'Prime College', address: 'Devkota Sadak, Mid Baneshwor, Kathmandu' },
  { value: 'Kathmandu College of Technology', label: 'Kathmandu College of Technology', address: 'Sinamangal, Kathmandu' },
  { value: 'Medhavi College', label: 'Medhavi College', address: 'Shankhamul, Kathmandu' },
  { value: 'Crimson College of Technology', label: 'Crimson College of Technology', address: 'Devinagar, Butwal, Rupandehi' },
  { value: 'SAIM College', label: 'SAIM College', address: 'Old Baneswor Chowk, Kathmandu' },
  { value: 'Apollo International College', label: 'Apollo International College', address: 'Lakhechaur Marg, Baneshwor, Kathmandu' },
  { value: 'Quest International College', label: 'Quest International College', address: 'Gwarko, Lalitpur' },
  { value: 'Shubhashree College of Management', label: 'Shubhashree College of Management', address: 'New Baneshwor, Kathmandu' },
  { value: 'Liberty College', label: 'Liberty College', address: 'Pragati Marg-2, Anamnagar, Kathmandu' },
  { value: 'Uniglobe College', label: 'Uniglobe College', address: 'New Baneshwor, Kathmandu' },
  { value: 'Excel Business College', label: 'Excel Business College', address: 'Lakhechaur Marg, New Baneshwor, Kathmandu' },
  { value: 'Rajdhani Model College', label: 'Rajdhani Model College', address: 'Old Baneshwor, Kathmandu' },
  { value: 'Other', label: 'Other College', address: '' },
];

export function SignUp() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    trigger,
  } = useForm<FormData>({
    resolver: yupResolver(schema),
  });

  const watchedRole = watch('role');
  const watchedCollege = watch('college');

  const getCollegeAddress = () => {
    if (!watchedCollege) return '';
    const college = collegeOptions.find((c) => c.value === watchedCollege);
    return college ? college.address : '';
  };

  const nextStep = async () => {
    const fieldsToValidate = currentStep === 1 
      ? ['name', 'email', 'role'] 
      : ['password', 'confirmPassword'];
    
    const isValid = await trigger(fieldsToValidate as any);
    if (isValid) {
      setCurrentStep(2);
    }
  };

  const prevStep = () => {
    setCurrentStep(1);
  };

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);
      setError('');

      const additionalData: any = {};
      if (data.role === 'student') {
        additionalData.semester = data.semester;
        additionalData.college = data.college;
        additionalData.collegeAddress = getCollegeAddress();
      }

      await signUp(data.email, data.password, data.name, data.role, additionalData);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  const benefits = [
    'Access to comprehensive study materials',
    'Interactive learning tools and calculators',
    'Past papers and exam resources',
    'Community support and discussions',
    'Progress tracking and analytics',
    'Mobile-friendly platform'
  ];

  const stats = [
    { icon: Users, label: '2,500+', sublabel: 'Active Students' },
    { icon: Award, label: '95%', sublabel: 'Success Rate' },
    { icon: Shield, label: '100%', sublabel: 'Secure Platform' }
  ];

  return (
    <div className="min-h-screen bg-slate-50/30 relative overflow-hidden flex flex-col justify-center">
      {/* Animated Background */}
      <div className="absolute inset-0 z-0">
        <motion.div 
          className="absolute top-20 left-10 w-44 h-44 bg-indigo-200/20 rounded-full blur-3xl animate-pulse"
          animate={{ x: [0, 40, 0], y: [0, -20, 0] }}
          transition={{ duration: 10, repeat: Infinity }}
        />
        <motion.div 
          className="absolute bottom-20 right-10 w-56 h-56 bg-purple-200/20 rounded-full blur-3xl"
          animate={{ x: [0, -30, 0], y: [0, 30, 0] }}
          transition={{ duration: 12, repeat: Infinity }}
        />
      </div>

      <div className="relative min-h-screen flex z-10">
        {/* Left Side - Branding */}
        <motion.div 
          className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-600 via-purple-650 to-indigo-900 text-white p-12 flex-col justify-center relative overflow-hidden"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Backdrop Glow */}
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-white/5 rounded-full blur-3xl" />

          <div className="flex items-center space-x-3 mb-10 relative z-10">
            <div className="w-11 h-11 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/10 shadow-inner">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-black tracking-tight">BCSITHub</span>
          </div>

          <div className="relative z-10">
            <h1 className="text-4xl xl:text-5xl font-black mb-4 leading-tight tracking-tight">
              Start Your
              <span className="block bg-gradient-to-r from-yellow-300 via-amber-300 to-orange-300 bg-clip-text text-transparent mt-1">
                Learning Journey
              </span>
            </h1>
            <p className="text-base text-indigo-100/80 font-medium mb-10 leading-relaxed max-w-md">
              Join thousands of BCSIT students and unlock your academic potential with our comprehensive platform.
            </p>

            <div className="mb-10">
              <h3 className="text-xs font-bold mb-4 uppercase tracking-widest text-yellow-300 flex items-center">
                <Sparkles className="w-4 h-4 mr-2" />
                Why choose BCSITHub?
              </h3>
              <ul className="space-y-4">
                {benefits.map((benefit, index) => (
                  <motion.li 
                    key={index}
                    className="flex items-center text-sm font-semibold text-indigo-50"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + index * 0.05 }}
                  >
                    <CheckCircle className="w-4.5 h-4.5 mr-3 text-indigo-300 flex-shrink-0" />
                    {benefit}
                  </motion.li>
                ))}
              </ul>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {stats.map((stat, index) => (
                <motion.div 
                  key={index}
                  className="p-4 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md shadow-sm text-center"
                  whileHover={{ y: -3 }}
                  transition={{ duration: 0.3 }}
                >
                  <stat.icon className="w-5 h-5 mb-2 text-yellow-350 mx-auto" />
                  <div className="text-xl font-extrabold">{stat.label}</div>
                  <div className="text-[10px] font-bold text-indigo-200 uppercase tracking-wider">{stat.sublabel}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Right Side - Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full max-w-md"
          >
            {/* Mobile Logo */}
            <div className="lg:hidden text-center mb-8">
              <div className="flex items-center justify-center space-x-2.5 mb-2">
                <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <span className="text-2xl font-black bg-gradient-to-r from-indigo-600 to-purple-650 bg-clip-text text-transparent">
                  BCSITHub
                </span>
              </div>
            </div>

            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 mb-2 tracking-tight">
                Create Your Account
              </h2>
              <p className="text-xs font-bold text-slate-455 uppercase tracking-widest">
                Join the community of successful BCSIT students
              </p>
            </div>

            {/* Progress Steps */}
            <div className="mb-8">
              <div className="flex items-center justify-center space-x-4">
                <div className={`flex items-center ${currentStep >= 1 ? 'text-indigo-650' : 'text-slate-400'}`}>
                  <div className={`w-8 h-8 rounded-xl text-xs font-bold flex items-center justify-center ${currentStep >= 1 ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-200'}`}>
                    1
                  </div>
                  <span className="ml-2 text-xs font-bold uppercase tracking-wider hidden sm:inline">Basic Info</span>
                </div>
                <div className={`w-12 h-0.5 ${currentStep >= 2 ? 'bg-indigo-600' : 'bg-slate-200'}`} />
                <div className={`flex items-center ${currentStep >= 2 ? 'text-indigo-650' : 'text-slate-400'}`}>
                  <div className={`w-8 h-8 rounded-xl text-xs font-bold flex items-center justify-center ${currentStep >= 2 ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-200'}`}>
                    2
                  </div>
                  <span className="ml-2 text-xs font-bold uppercase tracking-wider hidden sm:inline">Security</span>
                </div>
              </div>
            </div>

            <Card hover={false} className="border border-slate-105 shadow-premium bg-white/90 backdrop-blur-md rounded-2xl">
              <CardContent className="p-6 sm:p-8">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                  <AnimatePresence>
                    {error && (
                      <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="bg-rose-50 border border-rose-100/50 text-rose-700 px-4 py-3 rounded-xl flex items-center gap-3 text-xs font-semibold"
                      >
                        <div className="w-4.5 h-4.5 bg-rose-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-[10px] font-bold">!</span>
                        </div>
                        <span>{error}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <AnimatePresence mode="wait">
                    {currentStep === 1 ? (
                      <motion.div
                        key="step1"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-5"
                      >
                        <div>
                          <label className="block text-xs font-bold text-slate-550 mb-1.5 uppercase tracking-wider">
                            Full Name
                          </label>
                          <div className="relative">
                            <User className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                              type="text"
                              placeholder="Enter your full name"
                              {...register('name')}
                              className={`w-full pl-11 pr-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all duration-300 bg-white text-slate-800 placeholder:text-slate-400 ${
                                errors.name ? 'border-red-300' : 'border-slate-200'
                              }`}
                            />
                          </div>
                          {errors.name && (
                            <p className="mt-1.5 text-xs font-bold text-rose-655">{errors.name.message}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-555 mb-1.5 uppercase tracking-wider">
                            Email Address
                          </label>
                          <div className="relative">
                            <Mail className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                              type="email"
                              placeholder="Enter your email"
                              {...register('email')}
                              className={`w-full pl-11 pr-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all duration-300 bg-white text-slate-800 placeholder:text-slate-400 ${
                                errors.email ? 'border-red-300' : 'border-slate-200'
                              }`}
                            />
                          </div>
                          {errors.email && (
                            <p className="mt-1.5 text-xs font-bold text-rose-655">{errors.email.message}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-555 mb-1.5 uppercase tracking-wider">
                            I am a
                          </label>
                          <div className="relative">
                            <GraduationCap className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <select
                              {...register('role')}
                              className={`w-full pl-11 pr-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all duration-300 bg-white text-slate-805 font-semibold ${
                                errors.role ? 'border-red-300' : 'border-slate-200'
                              }`}
                            >
                              <option value="">Select your role</option>
                              {roleOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          </div>
                          {errors.role && (
                            <p className="mt-1.5 text-xs font-bold text-rose-655">{errors.role.message}</p>
                          )}
                        </div>

                        {watchedRole === 'student' && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="space-y-5"
                          >
                            <div>
                              <label className="block text-xs font-bold text-slate-555 mb-1.5 uppercase tracking-wider">
                                Current Semester
                              </label>
                              <div className="relative">
                                <Calendar className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <select
                                  {...register('semester')}
                                  className={`w-full pl-11 pr-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all duration-300 bg-white text-slate-800 font-semibold ${
                                    errors.semester ? 'border-red-300' : 'border-slate-200'
                                  }`}
                                >
                                  <option value="">Select your semester</option>
                                  {semesterOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                      {option.label}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              {errors.semester && (
                                <p className="mt-1.5 text-xs font-bold text-rose-605">{errors.semester.message}</p>
                              )}
                            </div>

                            <div>
                              <label className="block text-xs font-bold text-slate-555 mb-1.5 uppercase tracking-wider">
                                College
                              </label>
                              <div className="relative">
                                <Building className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <select
                                  {...register('college')}
                                  className={`w-full pl-11 pr-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all duration-300 bg-white text-slate-800 font-semibold ${
                                    errors.college ? 'border-red-300' : 'border-slate-200'
                                  }`}
                                >
                                  <option value="">Select your college</option>
                                  {collegeOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                      {option.label}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              {errors.college && (
                                <p className="mt-1.5 text-xs font-bold text-rose-605">{errors.college.message}</p>
                              )}
                            </div>

                            {watchedCollege && watchedCollege !== 'Other' && (
                              <motion.div 
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex items-start space-x-2 text-xs font-semibold text-indigo-650 bg-indigo-50/50 p-3 rounded-xl border border-indigo-100/50"
                              >
                                <MapPin className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-indigo-600" />
                                <span>{getCollegeAddress()}</span>
                              </motion.div>
                            )}
                          </motion.div>
                        )}

                        <button
                          type="button"
                          onClick={nextStep}
                          className="w-full bg-gradient-to-r from-indigo-600 to-purple-650 hover:brightness-110 text-white font-bold py-3.5 rounded-xl shadow-md transition-all duration-300 border-0 flex items-center justify-center gap-2 text-sm"
                        >
                          <span>Continue</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="step2"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-5"
                      >
                        <div>
                          <label className="block text-xs font-bold text-slate-550 mb-1.5 uppercase tracking-wider">
                            Password
                          </label>
                          <div className="relative">
                            <Lock className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                              type={showPassword ? 'text' : 'password'}
                              placeholder="Create a strong password"
                              {...register('password')}
                              className={`w-full pl-11 pr-12 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all duration-300 bg-white text-slate-800 placeholder:text-slate-400 ${
                                errors.password ? 'border-red-300' : 'border-gray-200'
                              }`}
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3.5 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-655"
                            >
                              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                          {errors.password && (
                            <p className="mt-1.5 text-xs font-bold text-rose-605">{errors.password.message}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-550 mb-1.5 uppercase tracking-wider">
                            Confirm Password
                          </label>
                          <div className="relative">
                            <Lock className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                              type={showConfirmPassword ? 'text' : 'password'}
                              placeholder="Confirm your password"
                              {...register('confirmPassword')}
                              className={`w-full pl-11 pr-12 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all duration-300 bg-white text-slate-800 placeholder:text-slate-400 ${
                                errors.confirmPassword ? 'border-red-300' : 'border-gray-200'
                              }`}
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              className="absolute right-3.5 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-655"
                            >
                              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                          {errors.confirmPassword && (
                            <p className="mt-1.5 text-xs font-bold text-rose-605">{errors.confirmPassword.message}</p>
                          )}
                        </div>

                        <div className="flex gap-4">
                          <button
                            type="button"
                            onClick={prevStep}
                            className="flex-1 py-3 border border-slate-205 text-slate-705 bg-slate-50 hover:bg-slate-100 rounded-xl font-bold text-xs transition-all duration-300"
                          >
                            Back
                          </button>
                          <button
                            type="submit"
                            className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-650 hover:brightness-110 text-white font-bold py-3 rounded-xl shadow-md transition-all duration-300 border-0 text-xs flex items-center justify-center gap-1.5"
                            disabled={loading}
                          >
                            {loading ? (
                              <>
                                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                <span>Creating...</span>
                              </>
                            ) : (
                              <>
                                <UserPlus className="w-4 h-4" />
                                <span>Create Account</span>
                              </>
                            )}
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </form>

                <div className="mt-6 text-center">
                  <div className="relative mb-5">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-100" />
                    </div>
                    <div className="relative flex justify-center text-[10px] font-bold uppercase tracking-wider">
                      <span className="px-3 bg-white text-slate-400">Already have an account?</span>
                    </div>
                  </div>
                  <Link 
                    to="/signin" 
                    className="inline-flex items-center gap-2 text-indigo-650 hover:text-indigo-805 font-bold text-xs"
                  >
                    <Star className="w-3.5 h-3.5 text-yellow-500 fill-current" />
                    Sign in here
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </CardContent>
            </Card>

            <div className="mt-8 text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              <div className="flex flex-wrap items-center justify-center gap-4">
                <div className="flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Secure Signup</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-purple-500" />
                  <span>2,500+ Users</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-amber-500" />
                  <span>Free Platform</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}