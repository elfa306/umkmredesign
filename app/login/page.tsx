'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Eye, EyeOff, ArrowLeft, Lock, Mail, Store } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { pesanAuth } from '@/lib/pesanAuth';
import { CavaLogo, CavaVMark } from '@/components/CavaLogo';

type Mode = 'masuk' | 'daftar' | 'lupa';

export default function Login() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('masuk');
  const [err, setErr] = useState('');
  const [info, setInfo] = useState('');
  const [lihat, setLihat] = useState(false);
  const [proses, setProses] = useState(false);

  const ganti = (m: Mode) => {
    setMode(m);
    setErr('');
    setInfo('');
  };

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr('');
    setInfo('');
    setProses(true);
    try {
      const fd = new FormData(e.currentTarget);
      const email = String(fd.get('email')).trim();
      const password = String(fd.get('password') ?? '');

      if (mode === 'lupa') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) return setErr(pesanAuth(error.message));
        return setInfo(
          'Jika email itu terdaftar, tautan untuk membuat kata sandi baru sudah dikirim. Cek kotak masuk dan folder spam. Tautan berlaku terbatas, jadi segera dibuka.'
        );
      }

      if (mode === 'daftar') {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { nama_usaha: String(fd.get('nama_usaha')) },
            emailRedirectTo: `${window.location.origin}/onboarding`,
          },
        });
        if (error) return setErr(pesanAuth(error.message));
        if (!data.session) return setInfo('Cek email Anda untuk konfirmasi, lalu masuk.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) return setErr(pesanAuth(error.message));
      }
      router.replace('/kasir');
    } catch (x) {
      setErr(pesanAuth((x as Error).message));
    } finally {
      setProses(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#CEE5D6] text-slate-900 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-sm space-y-6">
        {/* Brand header */}
        <div className="text-center space-y-3">
          <Link href="/" className="inline-block transition-transform hover:scale-105">
            <CavaLogo variant="full" height={36} />
          </Link>
          <p className="text-xs font-medium text-[#103A57]/80">
            Cash Value Platform · Pencatatan Kas &amp; Nilai Usaha
          </p>
        </div>

        {/* Auth Card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/90 backdrop-blur-md rounded-3xl p-6 shadow-xl border border-[#307B8E]/20 space-y-5"
        >
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h2 className="text-base font-extrabold text-[#103A57]">
              {mode === 'daftar' ? 'Daftar Akun Baru' : mode === 'lupa' ? 'Lupa Kata Sandi' : 'Masuk ke CAVA'}
            </h2>
            <Link
              href="/kasir"
              className="text-[11px] font-semibold text-[#307B8E] hover:underline"
            >
              Mode Tamu →
            </Link>
          </div>

          {mode === 'lupa' && (
            <p className="text-xs text-slate-500 leading-relaxed">
              Masukkan email yang Anda pakai saat mendaftar. Kami akan kirimkan tautan pemulihan kata sandi.
            </p>
          )}

          <form onSubmit={submit} className="space-y-3.5">
            {mode === 'daftar' && (
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-600">Nama Usaha / Toko</label>
                <div className="relative">
                  <Store className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    name="nama_usaha"
                    placeholder="Contoh: Kopi Cava Nusantara"
                    required
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#103A57]"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-600">Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  name="email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  placeholder="nama@email.com"
                  required
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#103A57]"
                />
              </div>
            </div>

            {mode !== 'lupa' && (
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-semibold text-slate-600">Kata Sandi</label>
                  {mode === 'masuk' && (
                    <button
                      type="button"
                      onClick={() => ganti('lupa')}
                      className="text-[10px] text-[#307B8E] hover:underline"
                    >
                      Lupa sandi?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    name="password"
                    type={lihat ? 'text' : 'password'}
                    autoComplete={mode === 'daftar' ? 'new-password' : 'current-password'}
                    placeholder="Minimal 6 karakter"
                    minLength={6}
                    required
                    className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#103A57]"
                  />
                  <button
                    type="button"
                    onClick={() => setLihat(!lihat)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    aria-label="Lihat kata sandi"
                  >
                    {lihat ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={proses}
              className="w-full py-3 rounded-2xl bg-[#103A57] text-white text-xs font-bold shadow-md hover:bg-[#0c2d44] transition-all disabled:opacity-50"
            >
              {proses
                ? 'MOHON TUNGGU…'
                : mode === 'daftar'
                ? 'DAFTAR SEKARANG'
                : mode === 'lupa'
                ? 'KIRIM TAUTAN PEMULIHAN'
                : 'MASUK'}
            </button>
          </form>

          {err && (
            <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
              {err}
            </div>
          )}

          {info && (
            <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
              {info}
            </div>
          )}

          <div className="pt-2 text-center border-t border-slate-100">
            <button
              type="button"
              onClick={() => ganti(mode === 'masuk' ? 'daftar' : 'masuk')}
              className="text-xs font-medium text-[#103A57] hover:underline"
            >
              {mode === 'masuk'
                ? 'Belum punya akun? Daftar gratis'
                : mode === 'daftar'
                ? 'Sudah punya akun? Masuk'
                : '← Kembali ke halaman masuk'}
            </button>
          </div>
        </motion.div>

        {/* Back to Home Link */}
        <div className="text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-[#103A57] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Beranda CAVA</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
