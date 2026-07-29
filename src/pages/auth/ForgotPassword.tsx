import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Mail, Send, BookOpen, Shield, Users, Award, CheckCircle, ArrowRight, Sparkles, Star, ArrowLeft, RefreshCw, Clock } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import Backendless from 'backendless';

const schema = yup.object({
  email: yup.string().email('Invalid email').required('Email is required'),
});

interface FormData {
  email: string;
}

export function ForgotPassword() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [emailSent, setEmailSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<FormData>({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setError('');
    setMessage('');

    try {
      // Step 1: Check if user exists
      const response = await Backendless.Data.of('Users').find({
        where: `email = '${data.email}'`,
      });

      if (response.length === 0) {
        setError('No account found with this email address.');
      } else {
        // Step 2: Send password reset link
        await Backendless.UserService.restorePassword(data.email);
        setMessage('Password reset link sent successfully!');
        setEmailSent(true);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEmailSent(false);
    setMessage('');
    setError('');
  };

  const securityFeatures = [
    'Secure password reset process',
    'Email verification required',
    'Account protection measures',
    'Encrypted communication'
  ];

  const stats = [
    { icon: Users, label: '2,500+', sublabel: 'Protected Users' },
    { icon: Shield, label: '100%', sublabel: 'Secure Process' },
    { icon: Award, label: '24/7', sublabel: 'Support Available' }
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
              Secure Account
              <span className="block bg-gradient-to-r from-yellow-300 via-amber-300 to-orange-300 bg-clip-text text-transparent mt-1">
                Recovery
              </span>
            </h1>
            <p className="text-base text-indigo-100/80 font-medium mb-10 leading-relaxed max-w-md">
              We'll help you regain access to your account safely and securely.
            </p>

            <div className="mb-10">
              <h3 className="text-xs font-bold mb-4 uppercase tracking-widest text-yellow-300 flex items-center">
                <Sparkles className="w-4 h-4 mr-2" />
                Security Features:
              </h3>
              <ul className="space-y-4">
                {securityFeatures.map((feature, index) => (
                  <motion.li 
                    key={index}
                    className="flex items-center text-sm font-semibold text-indigo-50"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + index * 0.05 }}
                  >
                    <CheckCircle className="w-4.5 h-4.5 mr-3 text-indigo-300 flex-shrink-0" />
                    {feature}
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

            {/* Back to Sign In */}
            <motion.div 
              className="mb-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Link 
                to="/signin" 
                className="inline-flex items-center gap-2 text-indigo-650 hover:text-indigo-805 font-bold transition-colors text-xs"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to Sign In
              </Link>
            </motion.div>

            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 mb-2 tracking-tight">
                {emailSent ? 'Check Your Email' : 'Forgot Password?'}
              </h2>
              <p className="text-xs font-bold text-slate-455 uppercase tracking-widest leading-relaxed">
                {emailSent 
                  ? "We've sent a password reset link to your email"
                  : "Enter your email and we'll send you a reset link"
                }
              </p>
            </div>

            <Card hover={false} className="border border-slate-105 shadow-premium bg-white/90 backdrop-blur-md rounded-2xl">
              <CardContent className="p-6 sm:p-8">
                <AnimatePresence mode="wait">
                  {!emailSent ? (
                    <motion.form 
                      key="form"
                      onSubmit={handleSubmit(onSubmit)} 
                      className="space-y-5"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                    >
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
                            placeholder="Enter your email address"
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

                      <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-indigo-600 to-purple-650 hover:brightness-110 text-white font-bold py-3.5 rounded-xl shadow-md transition-all duration-300 border-0 flex items-center justify-center gap-2 text-sm"
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span>Sending Reset Link...</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4" />
                            <span>Send Reset Link</span>
                          </>
                        )}
                      </button>
                    </motion.form>
                  ) : (
                    <motion.div 
                      key="success"
                      className="text-center space-y-5"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                        className="w-16 h-16 bg-emerald-50 border border-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4"
                      >
                        <Mail className="w-6 h-6 text-emerald-650" />
                      </motion.div>

                      <div className="bg-emerald-50/50 border border-emerald-100/50 text-emerald-800 px-4 py-3.5 rounded-xl text-xs font-semibold">
                        <div className="flex items-center justify-center gap-2">
                          <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                          <span>{message}</span>
                        </div>
                      </div>

                      <div className="bg-indigo-50/50 border border-indigo-100/50 rounded-xl p-4.5 text-left">
                        <div className="flex items-start gap-3">
                          <Clock className="w-4 h-4 text-indigo-600 mt-0.5 flex-shrink-0" />
                          <div className="text-xs text-indigo-800 font-semibold">
                            <p className="font-bold text-slate-800 mb-1">What's next?</p>
                            <ul className="space-y-1 opacity-90">
                              <li>• Check your email inbox for the reset link</li>
                              <li>• Click the link to create a new password</li>
                              <li>• The link expires in 24 hours</li>
                            </ul>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3 pt-2">
                        <p className="text-xs text-slate-500 font-medium leading-relaxed">
                          Didn't receive the email? Check your spam folder or
                        </p>
                        <button
                          onClick={resetForm}
                          className="w-full py-3 border border-slate-205 text-indigo-600 bg-white hover:bg-slate-50 rounded-xl font-bold text-xs transition-all duration-300"
                        >
                          <RefreshCw className="w-3.5 h-3.5 mr-2 inline" />
                          Try Again
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {!emailSent && (
                  <div className="mt-6 text-center">
                    <div className="relative mb-5">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-slate-100" />
                      </div>
                      <div className="relative flex justify-center text-[10px] font-bold uppercase tracking-wider">
                        <span className="px-3 bg-white text-slate-400">Remember password?</span>
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
                )}
              </CardContent>
            </Card>

            <div className="mt-8 text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              <div className="flex flex-wrap items-center justify-center gap-4">
                <div className="flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Secure Reset</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-purple-500" />
                  <span>2,500+ Users</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-amber-500" />
                  <span>PU Official</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}