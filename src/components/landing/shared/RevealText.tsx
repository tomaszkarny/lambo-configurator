'use client';

import {
  type ElementType,
  type ReactNode,
  Children,
  useRef,
} from 'react';
import { motion, useInView, type Variants } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface RevealTextProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
  once?: boolean;
  stagger?: boolean;
  staggerDelay?: number;
  as?: ElementType;
}

const directionOffset: Record<string, { x: number; y: number }> = {
  up: { x: 0, y: 40 },
  down: { x: 0, y: -40 },
  left: { x: 40, y: 0 },
  right: { x: -40, y: 0 },
};

export default function RevealText({
  children,
  className,
  delay = 0,
  direction = 'up',
  once = true,
  stagger = false,
  staggerDelay = 0.1,
  as: Tag = 'div',
}: RevealTextProps) {
  const prefersReducedMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once, margin: '-10%' });

  const offset = directionOffset[direction];

  const MotionTag = motion.create(Tag);

  if (stagger) {
    const items = Children.toArray(children);

    const containerVariants: Variants = {
      hidden: {},
      visible: {
        transition: {
          staggerChildren: staggerDelay,
          delayChildren: delay,
        },
      },
    };

    const itemVariants: Variants = prefersReducedMotion
      ? {
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: { duration: 0.4, ease: 'easeOut' },
          },
        }
      : {
          hidden: { opacity: 0, x: offset.x, y: offset.y },
          visible: {
            opacity: 1,
            x: 0,
            y: 0,
            transition: {
              duration: 0.8,
              ease: [0.25, 0.4, 0, 1],
            },
          },
        };

    return (
      <MotionTag
        ref={ref}
        className={className}
        variants={containerVariants}
        initial="hidden"
        animate={isInView ? 'visible' : 'hidden'}
      >
        {items.map((child, i) => (
          <motion.div key={i} variants={itemVariants}>
            {child}
          </motion.div>
        ))}
      </MotionTag>
    );
  }

  const variants: Variants = prefersReducedMotion
    ? {
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: { duration: 0.4, ease: 'easeOut', delay },
        },
      }
    : {
        hidden: { opacity: 0, x: offset.x, y: offset.y },
        visible: {
          opacity: 1,
          x: 0,
          y: 0,
          transition: {
            duration: 0.8,
            ease: [0.25, 0.4, 0, 1],
            delay,
          },
        },
      };

  return (
    <MotionTag
      ref={ref}
      className={className}
      variants={variants}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
    >
      {children}
    </MotionTag>
  );
}
