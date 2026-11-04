'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Home, 
  History, 
  ShieldCheck, 
  User, 
  Boxes, 
  TrendingUp, 
  Sparkles, 
  PlusCircle, 
  Settings,
  LogOut
} from 'lucide-react';
import QuickRecordModal from './QuickRecordModal';
import { CavaLogo, CavaVMark } from './CavaLogo';
import { supabase } from '@/lib/supabase';

export default function BottomNav() {
  const p = usePathname();
  const [showCatatModal, setShowCatatModal] = useState(false);
  const [namaUsaha, setNamaUsaha] = useState('[Nama Usaha]');

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.user_metadata?.nama_usaha) {
        setNamaUsaha(user.user_metadata.nama_usaha);
      }
    });
  }, []);

  const isBeranda = p === '/kasir' || p === '/';
  const isRiwayat = p === '/laporan';
  const isNilai = p === '/kredit' || p === '/rekomendasi';
  const isInventaris = p === '/inventaris';
  const isHarga = p === '/harga';
  const isAkun = p === '/lainnya' || p === '/pengaturan-usaha' || p === '/integrasi';
  const isDemo = p?.startsWith('/demo');

  const navLinks = [
    { href: '/kasir', label: 'Beranda', icon: Home, active: isBeranda },
    { href: '/laporan', label: 'Riwayat & Laporan', icon: History, active: isRiwayat },
    { href: '/kredit', label: 'Nilai Usaha (KUR)', icon: ShieldCheck, active: isNilai },
    { href: '/inventaris', label: 'Inventaris & Stok', icon: Boxes, active: isInventaris },
    { href: '/harga', label: 'Cek Harga Bahan', icon: TrendingUp, active: isHarga },
    { href: '/lainnya', label: 'Pengaturan & Akun', icon: Settings, active: isAkun },
    { href: '/demo', label: 'Ruang Demo', icon: Sparkles, active: isDemo },
  ];

  return (
    <>
      {/* ===================================================================
        * 1. MOBILE BOTTOM NAVIGATION (Hidden on lg: screens and above)
        * =================================================================== */}
      <nav
        className="lg:hidden fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-white/95 backdrop-blur-md border-t border-[#307B8E]/15 rounded-t-[28px] px-3 pt-2 pb-[calc(10px+env(safe-area-inset-bottom))] shadow-[0_-8px_25px_rgba(16,58,87,0.08)] z-50 flex items-center justify-around"
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
            <CavaVMark size={30} />
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

      {/* ===================================================================
        * 2. DESKTOP SIDEBAR (Visible on lg: screens and above)
        * =================================================================== */}
      <aside
        className="hidden lg:flex fixed left-0 top-0 bottom-0 w-64 bg-[#103A57] text-white z-40 p-5 flex-col justify-between border-r border-white/10 shadow-2xl"
        data-html2canvas-ignore
      >
        <div className="space-y-6">
          {/* Logo brand lockup */}
          <div className="pt-2 px-2">
            <Link href="/kasir" className="inline-block transition-transform hover:scale-105">
              <CavaLogo variant="horizontal" height={34} light={true} />
            </Link>
          </div>

          {/* Quick Catat CTA Button */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.02 }}
            onClick={() => setShowCatatModal(true)}
            className="w-full py-3 px-4 rounded-2xl bg-[#A9D3C5] hover:bg-white text-[#103A57] font-extrabold text-xs shadow-lg flex items-center justify-center gap-2.5 transition-all"
          >
            <CavaVMark size={18} />
            <span>CATAT TRANSAKSI</span>
          </motion.button>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {navLinks.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    item.active
                      ? 'bg-white/15 text-white shadow-xs border border-white/15'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon size={18} strokeWidth={item.active ? 2.5 : 2} className={item.active ? 'text-[#A9D3C5]' : 'text-white/60'} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Card at bottom of sidebar */}
        <div className="pt-4 border-t border-white/10">
          <div className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/10">
            <div className="min-w-0 flex-1 pr-2">
              <div className="text-xs font-black truncate text-white">{namaUsaha}</div>
              <div className="text-[10px] text-[#A9D3C5] truncate">CAVA UMKM Aktif</div>
            </div>
            <Link
              href="/lainnya"
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors"
              title="Pengaturan"
            >
              <Settings size={15} />
            </Link>
          </div>
        </div>
      </aside>

      {/* Global Quick Record Modal */}
      <QuickRecordModal
        isOpen={showCatatModal}
        onClose={() => setShowCatatModal(false)}
        onSuccess={() => {
          window.dispatchEvent(new CustomEvent('cava:transaction-saved'));
        }}
      />
    </>
  );
}
