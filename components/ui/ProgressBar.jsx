'use client';
import { motion } from 'framer-motion';

export const ProgressBar = ({ progress }) => {
  return (
    <div className="w-full bg-slate-200 rounded-full h-2.5">
      <motion.div
        className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2.5 rounded-full"
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
      />
    </div>
  );
};