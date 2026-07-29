import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Backendless from 'backendless';
import { Mail, CheckCircle, RefreshCw, ArrowLeft, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const EmailVerification = () => {
  const { user, reloadUser } = useAuth();
  const navigate = useNavigate();

  const [sending, setSending] = useState(false);
  const [checking, setChecking] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  // Redirect to signin if user doesn't exist
  useEffect(() => {
    if (!user) navigate('/signin');
  }, [user, navigate]);

  // Countdown for resend cooldown
  useEffect(() => {
    if (cooldown === 0) return;
    const timer = setTimeout(() => setCooldown((prev) => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  // Resend email confirmation
  const handleResend = async () => {
    if (!user?.email) {
      toast.error('No user email found.');
      return;
    }

    try {
      setSending(true);
      await Backendless.UserService.resendEmailConfirmation(user.email);
      toast.success('Verification email resent. Check your inbox!');
      setCooldown(60); // 1 min cooldown
    } catch (error: any) {
      toast.error(error.message || 'Failed to resend verification email.');
    } finally {
      setSending(false);
    }
  };

  // Check if user has verified their email
  const handleCheckVerification = async () => {
    if (!user?.objectId) {
      toast.error('User ID not found.');
      return;
    }

    try {
      setChecking(true);
      const updatedUser = await Backendless.Data.of('Users').findById(user.objectId);
      await reloadUser(updatedUser);

      if (updatedUser.emailConfirmed) {
        toast.success('Email verified! Redirecting...');
        navigate('/profile');
      } else {
        toast.error('Email not verified yet. Please check your inbox.');
      }
    } catch (error: any) {
      toast.error(error.message || 'Error checking verification status.');
    } finally {
      setChecking(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50/30 relative overflow-hidden flex flex-col justify-center px-4">
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

      <div className="relative max-w-md w-full mx-auto z-10">
        {/* Back to Sign In Link */}
        <motion.div 
          className="mb-4"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <button 
            onClick={() => navigate('/signin')}
            className="inline-flex items-center gap-2 text-indigo-650 hover:text-indigo-805 font-bold transition-colors text-xs bg-transparent border-0 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Sign In
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card hover={false} className="border border-slate-105 shadow-premium bg-white/90 backdrop-blur-md rounded-2xl overflow-hidden">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-indigo-50 border border-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Mail className="w-7 h-7 text-indigo-600 animate-bounce" />
              </div>

              <h2 className="text-2xl font-extrabold text-slate-805 mb-3 tracking-tight">Verify Your Email</h2>
              
              <p className="text-sm text-slate-600 leading-relaxed mb-6 font-medium">
                A verification link has been delivered to <strong className="text-indigo-600">{user.email}</strong>. Check your inbox and click the validation link to activate.
              </p>

              <div className="space-y-4">
                <Button 
                  onClick={handleCheckVerification} 
                  disabled={checking} 
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-650 hover:brightness-110 text-white font-bold py-3.5 rounded-xl shadow-md border-0 transition-all"
                >
                  {checking ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Checking Status...</span>
                    </div>
                  ) : (
                    <span>I Have Verified My Email</span>
                  )}
                </Button>

                <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 text-xs font-semibold text-slate-505 flex items-start gap-2.5 text-left">
                  <ShieldAlert className="w-4 h-4 text-indigo-500 mt-0.5 flex-shrink-0" />
                  <span>Check spam/junk directories if the confirmation link doesn't arrive within 5 minutes.</span>
                </div>

                <div className="pt-2 text-xs font-bold text-slate-500">
                  Didn't receive the email?
                  <button
                    onClick={handleResend}
                    disabled={sending || cooldown > 0}
                    className={`ml-1.5 font-bold transition-all bg-transparent border-0 cursor-pointer ${
                      sending || cooldown > 0
                        ? 'text-slate-400 cursor-not-allowed'
                        : 'text-indigo-650 hover:text-indigo-800 underline'
                    }`}
                  >
                    {sending ? (
                      <span className="flex items-center gap-1 inline-flex">
                        <RefreshCw className="w-3 h-3 animate-spin" />
                        Sending...
                      </span>
                    ) : cooldown > 0 ? (
                      `Resend in ${cooldown}s`
                    ) : (
                      'Resend Verification Email'
                    )}
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default EmailVerification;
