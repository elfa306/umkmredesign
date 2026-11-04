'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Home, History, ShieldCheck, User } from 'lucide-react';
import QuickRecordModal from './QuickRecordModal';

export default function BottomNav() {
  const p = usePathname();
  const [showCatatModal, setShowCatatModal] = useState(false);

  const isBeranda = p === '/kasir' || p === '/';
  const isRiwayat = p === '/laporan';
  const isNilai = p === '/kredit' || p === '/rekomendasi';
  const isAkun = p === '/lainnya' || p === '/pengaturan-usaha' || p === '/integrasi' || p === '/inventaris';

  return (
    <>
      <nav
        className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-white/95 backdrop-blur-md border-t border-[#307B8E]/15 rounded-t-[28px] px-3 pt-2 pb-[calc(10px+env(safe-area-inset-bottom))] shadow-[0_-8px_25px_rgba(16,58,87,0.08)] z-50 flex items-center justify-around"
        data-html2canvas-ignore
      >
        {/* 1. Beranda */}
        <Link
          href="/kasir"
          className={`flex flex-col items-center justify-center py-1 px-2 min-w-[56px] transition-colors ${
            isBeranda ? 'text-[#103A57]' : 'text-slate-400 hover:text-[#103A57]'
          }`}
        >
          <Home size={22} strokeWidth={isBeranda ? 2.5 : 1.8} />
          <span className={`text-[10px] tracking-tight mt-1 ${isBeranda ? 'font-black' : 'font-semibold'}`}>
            Beranda
          </span>
        </Link>

        {/* 2. Riwayat */}
        <Link
          href="/laporan"
          className={`flex flex-col items-center justify-center py-1 px-2 min-w-[56px] transition-colors ${
            isRiwayat ? 'text-[#103A57]' : 'text-slate-400 hover:text-[#103A57]'
          }`}
        >
          <History size={22} strokeWidth={isRiwayat ? 2.5 : 1.8} />
          <span className={`text-[10px] tracking-tight mt-1 ${isRiwayat ? 'font-black' : 'font-semibold'}`}>
            Riwayat
          </span>
        </Link>

        {/* 3. Center V Button (CATAT) */}
        <div className="relative -top-5 flex flex-col items-center">
          <motion.button
            whileTap={{ scale: 0.92 }}
            whileHover={{ scale: 1.05 }}
            onClick={() => setShowCatatModal(true)}
            aria-label="Catat transaksi"
            className="flex h-14 w-14 items-center justify-center rounded-full bg-[#103A57] p-2.5 text-white shadow-[0_8px_20px_rgba(16,58,87,0.35)] ring-4 ring-[#CEE5D6] transition-transform"
          >
            {/* The sharp CAVA V icon */}
            <svg width={30} height={30} viewBox="0 0 100 100" fill="none">
              <polygon points="30,22 70,22 50,42" fill="#A9D3C5" />
              <path d="M20,24 L38,24 L50,68 L62,24 L80,24 L56,82 C53.5,87 46.5,87 44,82 Z" fill="#307B8E" />
            </svg>
          </motion.button>
          <span className="text-[10px] font-black text-[#103A57] mt-0.5 tracking-wide">
            Catat
          </span>
        </div>

        {/* 4. Nilai (Rapor Usaha) */}
        <Link
          href="/kredit"
          className={`flex flex-col items-center justify-center py-1 px-2 min-w-[56px] transition-colors ${
            isNilai ? 'text-[#103A57]' : 'text-slate-400 hover:text-[#103A57]'
          }`}
        >
          <ShieldCheck size={22} strokeWidth={isNilai ? 2.5 : 1.8} />
          <span className={`text-[10px] tracking-tight mt-1 ${isNilai ? 'font-black' : 'font-semibold'}`}>
            Nilai
          </span>
        </Link>

        {/* 5. Akun */}
        <Link
          href="/lainnya"
          className={`flex flex-col items-center justify-center py-1 px-2 min-w-[56px] transition-colors ${
            isAkun ? 'text-[#103A57]' : 'text-slate-400 hover:text-[#103A57]'
          }`}
        >
          <User size={22} strokeWidth={isAkun ? 2.5 : 1.8} />
          <span className={`text-[10px] tracking-tight mt-1 ${isAkun ? 'font-black' : 'font-semibold'}`}>
            Akun
          </span>
        </Link>
      </nav>

      {/* Global Quick Record Modal */}
      <QuickRecordModal
        isOpen={showCatatModal}
        onClose={() => setShowCatatModal(false)}
        onSuccess={() => {
          // If on a page with reload logic, it triggers
          window.dispatchEvent(new CustomEvent('cava:transaction-saved'));
        }}
      />
    </>
  );
}
