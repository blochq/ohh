'use client';

import React, { ReactNode, FormHTMLAttributes } from 'react';
import { motion } from 'framer-motion';

interface AnimatedFormProps extends FormHTMLAttributes<HTMLFormElement> {
  children: ReactNode;
  className?: string;
  staggerChildren?: boolean;
  staggerDelay?: number;
  formAnimation?: boolean;
}

export default function AnimatedForm({
  children,
  className = '',
  staggerChildren = true,
  staggerDelay = 0.1,
  formAnimation = true,
  ...props
}: AnimatedFormProps) {
  // Form animation variants
  const formVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: 'beforeChildren',
        staggerChildren: staggerChildren ? staggerDelay : 0,
        delayChildren: 0.2
      }
    }
  };

  // Child animation variants
  const childVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: 'easeOut'
      }
    }
  };

  // Wrap each direct child with motion.div for staggered animation
  const animateChildren = (children: ReactNode): ReactNode => {
    return React.Children.map(children, (child) => {
      if (!React.isValidElement(child)) return child;

      // If the child already has variants, don't wrap it
      if (child.props.variants) return child;

      // If the child is a Fragment, animate its children
      if (child.type === React.Fragment) {
        return React.cloneElement(child, {
          ...child.props,
          children: animateChildren(child.props.children)
        });
      }

      return (
        <motion.div variants={childVariants}>
          {child}
        </motion.div>
      );
    });
  };

  return formAnimation ? (
    <motion.form
      className={className}
      initial="hidden"
      animate="visible"
      variants={formVariants}
      {...props}
    >
      {staggerChildren ? animateChildren(children) : children}
    </motion.form>
  ) : (
    <form className={className} {...props}>
      {children}
    </form>
  );
} 