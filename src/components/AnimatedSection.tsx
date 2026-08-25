'use client';

import React from 'react';
import { motion, Variants } from 'framer-motion';

interface AnimatedSectionProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  type?: 'fade-in-up' | 'fade-in' | 'slide-in-left' | 'slide-in-right';
}

export function AnimatedSection({
  children,
  className = '',
  delay = 0,
  duration = 0.6,
  type = 'fade-in-up',
}: AnimatedSectionProps) {
  const variants: Variants = {
    hidden: {
      opacity: 0,
      y: type === 'fade-in-up' ? 30 : 0,
      x: type === 'slide-in-left' ? -30 : type === 'slide-in-right' ? 30 : 0,
    },
    visible: {
      opacity: 1,
      y: 0,
      x: 0,
      transition: {
        duration,
        delay,
        ease: 'easeOut',
      },
    },
  };

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-100px' }}
      variants={variants}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface AnimatedGridProps {
  children: React.ReactNode;
  className?: string;
}

export function AnimatedGrid({ children, className = '' }: AnimatedGridProps) {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-50px' }}
      variants={containerVariants}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface AnimatedGridItemProps {
  children: React.ReactNode;
  className?: string;
}

export function AnimatedGridItem({ children, className = '' }: AnimatedGridItemProps) {
  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: 'easeOut',
      },
    },
  };

  return (
    <motion.div variants={itemVariants} className={className}>
      {children}
    </motion.div>
  );
}

interface HoverCardProps {
  children: React.ReactNode;
  className?: string;
}

export function HoverCard({ children, className = '' }: HoverCardProps) {
  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.01, boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.08)' }}
      transition={{ type: 'spring', stiffness: 350, damping: 20 }}
      className={`transition-shadow ${className}`}
    >
      {children}
    </motion.div>
  );
}
