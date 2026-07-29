import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Mail, Lock, LogIn, BookOpen, Eye, EyeOff, Shield, Users, Award, CheckCircle, ArrowRight, Sparkles, Star } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { useAuth } from '../../context/AuthContext';

const schema = yup.object({
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup
    .string()
    .min(8, 'Password must be at least 8 characters')
    .required('Password is required'),
  rememberMe: yup.boolean(),
});

interface FormData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export function SignIn() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { signIn } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<FormData>({
    resolver: yupResolver(schema),
  });

  // Load email from localStorage if remembered
  useEffect(() => {
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
      setValue('email', rememberedEmail);
      setValue('rememberMe', true);
    }
  }, [setValue]);

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);
      setError('');
      await signIn(data.email, data.password, 'backendless');

      if (data.rememberMe) {
        localStorage.setItem('rememberedEmail', data.email);
      } else {
        localStorage.removeItem('rememberedEmail');
      }

      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

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
              Your Gateway to
              <span className="block bg-gradient-to-r from-yellow-300 via-amber-300 to-orange-300 bg-clip-text text-transparent mt-1">
                Academic Excellence
              </span>
            </h1>
            <p className="text-base text-indigo-100/80 font-medium mb-10 leading-relaxed max-w-md">
              Join thousands of BCSIT students achieving their academic goals with interactive syllabus tools.
            </p>

            <div className="mb-10">
              <h3 className="text-xs font-bold mb-4 uppercase tracking-widest text-yellow-300 flex items-center">
                <Sparkles className="w-4 h-4 mr-2" />
                Curriculum Core Features
              </h3>
              <ul className="space-y-4">
                <li className="flex items-center text-sm font-semibold text-indigo-50">
                  <CheckCircle className="w-4.5 h-4.5 mr-3 text-indigo-300 flex-shrink-0" />
                  Access to comprehensive study materials
                </li>
                <li className="flex items-center text-sm font-semibold text-indigo-50">
                  <CheckCircle className="w-4.5 h-4.5 mr-3 text-indigo-300 flex-shrink-0" />
                  Interactive learning tools and compilers
                </li>
                <li className="flex items-center text-sm font-semibold text-indigo-50">
                  <CheckCircle className="w-4.5 h-4.5 mr-3 text-indigo-300 flex-shrink-0" />
                  Past papers and official PU exam notices
                </li>
              </ul>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md shadow-sm">
                <Users className="w-5 h-5 mb-2 text-yellow-350" />
                <div className="text-xl font-extrabold">2,500+</div>
                <div className="text-[10px] font-bold text-indigo-200 uppercase tracking-wider">Students</div>
              </div>
              <div className="p-4 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md shadow-sm">
                <Award className="w-5 h-5 mb-2 text-yellow-355" />
                <div className="text-xl font-extrabold">95%</div>
                <div className="text-[10px] font-bold text-indigo-200 uppercase tracking-wider">Success</div>
              </div>
              <div className="p-4 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md shadow-sm">
                <Shield className="w-5 h-5 mb-2 text-yellow-350" />
                <div className="text-xl font-extrabold">100%</div>
                <div className="text-[10px] font-bold text-indigo-200 uppercase tracking-wider">Secure</div>
              </div>
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
                Welcome Back!
              </h2>
              <p className="text-xs font-bold text-slate-455 uppercase tracking-widest">
                Sign in to continue your academic dashboard
              </p>
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

                  <div>
                    <label className="block text-xs font-bold text-slate-550 mb-1.5 uppercase tracking-wider">
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
                      <p className="mt-1.5 text-xs font-bold text-rose-600">{errors.email.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-550 mb-1.5 uppercase tracking-wider">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter your password"
                        {...register('password')}
                        className={`w-full pl-11 pr-12 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all duration-300 bg-white text-slate-800 placeholder:text-slate-400 ${
                          errors.password ? 'border-red-300' : 'border-slate-200'
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
                      <p className="mt-1.5 text-xs font-bold text-rose-600">{errors.password.message}</p>
                    )}
                  </div>

                  <div className="flex items-center justify-between gap-4 text-xs">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        {...register('rememberMe')}
                        className="w-4 h-4 text-indigo-600 border-slate-350 rounded focus:ring-indigo-500/10"
                      />
                      <span className="text-slate-600 font-semibold">Remember me</span>
                    </label>
                    <Link
                      to="/forgot-password"
                      className="text-indigo-650 hover:text-indigo-805 font-bold flex items-center gap-1"
                    >
                      Forgot password?
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-650 hover:brightness-110 text-white font-bold py-3.5 rounded-xl shadow-md transition-all duration-300 border-0 flex items-center justify-center gap-2"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Signing in...</span>
                      </>
                    ) : (
                      <>
                        <LogIn className="w-4.5 h-4.5" />
                        <span>Sign In</span>
                      </>
                    )}
                  </button>
                </form>

                <div className="mt-6 text-center">
                  <div className="relative mb-5">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-100" />
                    </div>
                    <div className="relative flex justify-center text-[10px] font-bold uppercase tracking-wider">
                      <span className="px-3 bg-white text-slate-400">New to BCSITHub?</span>
                    </div>
                  </div>
                  <Link 
                    to="/signup" 
                    className="inline-flex items-center gap-2 text-indigo-650 hover:text-indigo-800 text-xs font-bold"
                  >
                    <Star className="w-3.5 h-3.5 text-yellow-500 fill-current" />
                    Create free account
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </CardContent>
            </Card>

            <div className="mt-8 text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              <div className="flex flex-wrap items-center justify-center gap-4">
                <div className="flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Secure Login</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-purple-500" />
                  <span>2,500+ Users</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-amber-500" />
                  <span>Pokhara Uni</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}