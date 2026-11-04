'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowRight, Play, UserRound } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { CavaLogo } from '@/components/CavaLogo';

export default function LandingPage() {
  const router = useRouter();

  // Pengguna yang sudah memiliki sesi aktif langsung masuk ke kasir.
  useEffect(() => {
    let aktif = true;

    void supabase.auth.getSession().then(({ data, error }) => {
      if (!aktif || error || !data.session) return;
      router.replace('/kasir');
    });

    return () => {
      aktif = false;
    };
  }, [router]);

  return (
    <main
      className="relative isolate flex min-h-[100svh] w-full flex-col items-center justify-center overflow-hidden bg-[#103A57] px-6 text-white selection:bg-[#A9D3C5] selection:text-[#103A57]"
      style={{
        paddingTop: 'calc(2rem + env(safe-area-inset-top))',
        paddingBottom: 'calc(2rem + env(safe-area-inset-bottom))',
      }}
    >
      {/* Cahaya dekoratif lembut dengan warna asli CAVA. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-32 -top-40 h-96 w-96 rounded-full bg-[#307B8E]/25 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-40 -left-32 h-96 w-96 rounded-full bg-[#A9D3C5]/10 blur-3xl"
      />

      {/* Lengkungan bawah terinspirasi dari CAVA Splash. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-[245px] left-1/2 h-[350px] w-[145%] max-w-[900px] -translate-x-1/2 rounded-[50%] bg-[#307B8E]/45"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-[285px] left-1/2 h-[330px] w-[125%] max-w-[820px] -translate-x-1/2 rounded-[50%] bg-[#103A57]"
      />

      <div className="relative z-10 flex w-full max-w-[420px] flex-1 flex-col items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 14, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col items-center"
        >
          {/* Memakai aset logo V resmi dari /public, bukan logo hasil gambar AI. */}
          <CavaLogo variant="splash" height={88} light />
        </motion.div>

        <motion.nav
          aria-label="Pilihan akses CAVA"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
          className="mt-16 flex w-full max-w-[340px] flex-col gap-3"
        >
          <Link
            href="/login"
            className="group inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-[#A9D3C5] px-6 py-4 text-sm font-extrabold text-[#103A57] shadow-[0_12px_28px_rgba(0,0,0,0.18)] transition duration-200 hover:-translate-y-0.5 hover:bg-[#CEE5D6] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#A9D3C5]/40 active:translate-y-0"
          >
            <span>Masuk</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>

          <Link
            href="/demo"
            className="inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl border border-[#A9D3C5]/55 bg-white/[0.06] px-6 py-4 text-sm font-bold text-white backdrop-blur-sm transition duration-200 hover:-translate-y-0.5 hover:border-[#A9D3C5] hover:bg-[#307B8E]/35 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#A9D3C5]/30 active:translate-y-0"
          >
            <Play className="h-4 w-4 fill-current" />
            <span>Demo</span>
          </Link>

          <Link
            href="/kasir"
            className="inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl border border-white/20 bg-[#205874]/35 px-6 py-4 text-sm font-bold text-[#CEE5D6] transition duration-200 hover:-translate-y-0.5 hover:border-[#A9D3C5]/70 hover:bg-[#205874]/60 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#A9D3C5]/30 active:translate-y-0"
          >
            <UserRound className="h-4 w-4" />
            <span>Mode Tamu</span>
          </Link>
        </motion.nav>
      </div>

      <footer className="relative z-10 mt-8 text-center text-[10px] font-semibold tracking-[0.22em] text-[#A9D3C5]/65">
        CAVA <span className="mx-1.5 text-[#307B8E]">·</span> CASH VALUE
      </footer>
    </main>
  );
}
