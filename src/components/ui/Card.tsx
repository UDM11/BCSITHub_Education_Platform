import React from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export function Card({ children, className = '', hover = true }: CardProps) {
  return (
    <motion.div
      whileHover={hover ? { y: -5 } : {}}
      transition={{ type: 'spring', stiffness: 300, damping: 22 }}
      className={`bg-white rounded-2xl border border-slate-100 shadow-premium transition-all duration-300 ${
        hover ? 'hover:shadow-premium-hover hover:border-indigo-500/10' : ''
      } ${className}`}
    >
      {children}
    </motion.div>
  );
}

export function CardHeader({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`px-6 py-5 border-b border-slate-100 ${className}`}>
      {children}
    </div>
  );
}

export function CardContent({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`px-6 py-5 ${className}`}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`px-6 py-5 border-t border-slate-100 ${className}`}>
      {children}
    </div>
  );
}