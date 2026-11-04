'use client';

import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import CavaLogo from './CavaLogo';

export default function CavaSplash() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Only show once per session in session storage
    const hasSeen = sessionStorage.getItem('cava_splash_seen');
    if (!hasSeen) {
      setShow(true);
      const timer = setTimeout(() => {
        setShow(false);
        sessionStorage.setItem('cava_splash_seen', 'true');
      }, 1600);
      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="cava-splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-between bg-[#103A57] text-white select-none overflow-hidden"
        >
          {/* Subtle curved glow background */}
          <div className="pointer-events-none absolute -top-32 -right-32 h-96 w-96 rounded-full bg-[#307B8E]/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-[#A9D3C5]/10 blur-3xl" />

          {/* Top spacer */}
          <div className="pt-12" />

          {/* Centered Brand Presentation matching Splash PDF */}
          <motion.div
            initial={{ scale: 0.82, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.1 }}
            className="flex flex-col items-center"
          >
            {/* Big V Emblem */}
            <div className="mb-4">
              <svg width={110} height={110} viewBox="0 0 100 100" fill="none">
                <polygon points="30,22 70,22 50,42" fill="#A9D3C5" />
                <path d="M20,24 L38,24 L50,68 L62,24 L80,24 L56,82 C53.5,87 46.5,87 44,82 Z" fill="#307B8E" />
              </svg>
            </div>

            <motion.h1
              initial={{ letterSpacing: '0.1em', opacity: 0 }}
              animate={{ letterSpacing: '0.3em', opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="text-4xl font-black text-white ml-2"
            >
              CAVA
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 0.9, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-3 text-xs font-bold tracking-[0.35em] text-[#A9D3C5] uppercase"
            >
              Cash Value
            </motion.p>
          </motion.div>

          {/* Curved bottom arc matching Splash_0370296b.pdf */}
          <div className="relative w-full h-32 overflow-hidden flex justify-center items-end">
            <div className="w-[140%] h-44 rounded-t-[100%] bg-[#307B8E]/30" />
            <div className="absolute w-[120%] h-28 rounded-t-[100%] bg-[#103A57]/90" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
