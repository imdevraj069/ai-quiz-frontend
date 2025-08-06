'use client';

import { AnimatePresence } from 'framer-motion';

export default function MotionProvider({ children }) {
  return (
    <AnimatePresence mode="wait">
      {children}
    </AnimatePresence>
  );
}
