'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  ArrowRight, 
  TrendingUp, 
  QrCode, 
  ShieldCheck, 
  Sparkles, 
  Play, 
  CheckCircle2, 
  Calculator,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { CavaLogo, CavaVMark } from '@/components/CavaLogo';

const springTransition = { type: 'spring' as const, stiffness: 240, damping: 26 };

export default function LandingPage() {
  const router = useRouter();

  // If already logged in, navigate smoothly
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        router.replace('/kasir');
      }
    });
  }, [router]);

  return (
    <div className="min-h-screen bg-[#CEE5D6] text-slate-900 flex flex-col font-sans selection:bg-[#307B8E] selection:text-white">
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-[#CEE5D6]/90 border-b border-[#307B8E]/15 px-4 sm:px-6 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <CavaLogo variant="full" height={30} />
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/demo"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-[#103A57] bg-white/70 hover:bg-white border border-[#307B8E]/20 transition-all shadow-xs"
            >
              <Play className="w-3.5 h-3.5 fill-[#103A57]" />
              <span className="hidden sm:inline">Coba</span> Demo
            </Link>
            <Link
              href="/login"
              className="px-4 py-1.5 rounded-full text-xs font-bold text-white bg-[#103A57] hover:bg-[#0c2d44] transition-all shadow-sm"
            >
              Masuk
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-10 space-y-8">
        {/* Hero Card - Prussian Blue inspired by Qita Bank aesthetic */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={springTransition}
          className="relative overflow-hidden rounded-3xl bg-[#103A57] text-white p-6 sm:p-10 shadow-xl border border-white/10"
        >
          {/* Subtle geometric glowing backdrop */}
          <div className="absolute -right-16 -top-16 w-80 h-80 rounded-full bg-[#307B8E]/30 blur-3xl pointer-events-none" />
          <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-10 pointer-events-none hidden md:block">
            <CavaVMark size={240} />
          </div>

          <div className="relative z-10 max-w-2xl space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#307B8E]/30 border border-[#A9D3C5]/30 text-[#A9D3C5] text-xs font-semibold tracking-wide">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Platform Pencatatan Kas & Nilai Usaha</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-[1.15]">
              Jualan Lancar, <br />
              <span className="text-[#A9D3C5]">Cash Value</span> Usaha Terlihat Nyata.
            </h1>

            <p className="text-white/80 text-sm sm:text-base leading-relaxed max-w-xl">
              CAVA membantu pelaku UMKM mencatat transaksi harian, memantau persentase balik modal secara real-time, dan menyiapkan rapor kelayakan kredit (KUR) siap bank.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-[#A9D3C5] text-[#103A57] font-bold text-sm shadow-lg hover:bg-white transition-all transform active:scale-95"
              >
                <span>Mulai Sekarang</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/kasir"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm border border-white/20 transition-all"
              >
                <span>Buka Beranda Kasir</span>
              </Link>
              <Link
                href="/demo"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-xs font-medium text-white/80 hover:text-white underline underline-offset-4"
              >
                <span>Pelajari Mode Demo</span>
              </Link>
            </div>
          </div>

          {/* Mini Real-Time Highlight Strip */}
          <div className="mt-8 pt-6 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <div className="text-[11px] text-white/60 uppercase font-semibold">Untung Bersih</div>
              <div className="text-lg font-bold text-emerald-300">Rp 245.000</div>
            </div>
            <div>
              <div className="text-[11px] text-white/60 uppercase font-semibold">Balik Modal</div>
              <div className="text-lg font-bold text-amber-300">72%</div>
            </div>
            <div>
              <div className="text-[11px] text-white/60 uppercase font-semibold">Skor KUR</div>
              <div className="text-lg font-bold text-[#A9D3C5]">78 / 100</div>
            </div>
            <div>
              <div className="text-[11px] text-white/60 uppercase font-semibold">Catat Instan</div>
              <div className="text-lg font-bold text-white">Tombol V</div>
            </div>
          </div>
        </motion.section>

        {/* Feature Bento Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {/* Card 1: Balik Modal */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={springTransition}
            className="rounded-3xl bg-white/85 p-6 border border-[#307B8E]/15 shadow-sm space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-[#A9D3C5]/40 flex items-center justify-center text-[#103A57]">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-[#103A57]">Target Balik Modal Harian</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Tiap hari pedagang tahu pasti berapa sisa modal yang belum kembali. Dari modal Rp 340.000, Anda sudah membalikkan 72% (kurang Rp 95.000).
              </p>
            </div>

            <div className="bg-[#CEE5D6]/40 rounded-2xl p-3 space-y-2 border border-[#307B8E]/10">
              <div className="flex justify-between text-xs font-bold text-[#103A57]">
                <span>Progress Modal</span>
                <span className="text-[#366B2B]">72% tercapai</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-slate-200 overflow-hidden">
                <div className="h-full bg-[#103A57] rounded-full" style={{ width: '72%' }} />
              </div>
            </div>
          </motion.div>

          {/* Card 2: Layar Catat (Center V) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ ...springTransition, delay: 0.1 }}
            className="rounded-3xl bg-[#307B8E] text-white p-6 shadow-md space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center text-white">
                <CavaVMark size={22} />
              </div>
              <h3 className="text-lg font-bold">Layar Catat Cepat 3 Detik</h3>
              <p className="text-xs text-white/85 leading-relaxed">
                Ketuk tombol <b>V</b> di tengah navigasi bawah. Masukkan nominal pada numpad, pilih <b>Uang Masuk</b> atau <b>Uang Keluar</b>, dan transaksi langsung tersimpan.
              </p>
            </div>

            <div className="bg-white/10 rounded-2xl p-3 flex items-center justify-between text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-emerald-200">
                <ArrowUpRight className="w-4 h-4" /> Masuk: Rp 410.000
              </span>
              <span className="flex items-center gap-1.5 text-rose-200">
                <ArrowDownRight className="w-4 h-4" /> Keluar: Rp 165.000
              </span>
            </div>
          </motion.div>

          {/* Card 3: Nilai Usaha & Skor KUR */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ ...springTransition, delay: 0.2 }}
            className="rounded-3xl bg-white/85 p-6 border border-[#307B8E]/15 shadow-sm space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-[#A9D3C5]/40 flex items-center justify-center text-[#103A57]">
                <ShieldCheck className="w-5 h-5 text-[#366B2B]" />
              </div>
              <h3 className="text-lg font-bold text-[#103A57]">Rapor Kelayakan Kredit (KUR)</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Evaluasi otomatis kelayakan kredit usaha Anda berdasarkan omzet rutin, arus kas positif, dan rasio modal. Unduh laporan standar SAK EMKM dalam PDF/Excel.
              </p>
            </div>

            <div className="flex items-center gap-3 bg-[#CEE5D6]/40 rounded-2xl p-3 border border-[#307B8E]/10">
              <div className="w-10 h-10 rounded-full bg-[#103A57] text-[#A9D3C5] font-black flex items-center justify-center text-sm">
                78
              </div>
              <div className="text-xs">
                <div className="font-bold text-[#103A57]">Hampir Siap KUR</div>
                <div className="text-slate-500 text-[10px]">Peluang persetujuan bank tinggi</div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Action Banner to Enter Kasir */}
        <section className="rounded-3xl bg-gradient-to-r from-[#103A57] to-[#1a4f73] text-white p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md">
          <div className="space-y-1 text-center sm:text-left">
            <h2 className="text-xl sm:text-2xl font-bold">Siap mencatat keuangan usaha Anda?</h2>
            <p className="text-white/70 text-xs sm:text-sm">
              Gunakan CAVA sekarang juga gratis, langsung dari browser perangkat Anda.
            </p>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Link
              href="/kasir"
              className="flex-1 sm:flex-none text-center px-6 py-3 rounded-2xl bg-[#A9D3C5] hover:bg-white text-[#103A57] font-bold text-xs sm:text-sm transition-all shadow-md active:scale-95"
            >
              Buka Beranda CAVA
            </Link>
            <Link
              href="/demo"
              className="flex-1 sm:flex-none text-center px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-medium text-xs sm:text-sm border border-white/20 transition-all"
            >
              Demo Kasir
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#307B8E]/15 py-6 px-4 text-center text-xs text-slate-500">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <CavaLogo variant="full" height={20} />
            <span className="text-slate-400">· Cash Value Platform</span>
          </div>
          <div>© {new Date().getFullYear()} CAVA. Berdayakan UMKM Indonesia.</div>
        </div>
      </footer>
    </div>
  );
}
