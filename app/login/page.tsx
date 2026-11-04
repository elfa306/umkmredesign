'use client';

import { useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Play,
  Store,
  UserRound,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { pesanAuth } from '@/lib/pesanAuth';
import { CavaLogo } from '@/components/CavaLogo';

type Mode = 'masuk' | 'daftar' | 'lupa';

export default function Login() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('masuk');
  const [err, setErr] = useState('');
  const [info, setInfo] = useState('');
  const [lihat, setLihat] = useState(false);
  const [proses, setProses] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    let aktif = true;

    void supabase.auth.getSession().then(({ data, error }) => {
      if (!aktif) return;
      if (!error && data.session) {
        router.replace('/kasir');
        return;
      }
      setCheckingSession(false);
    });

    return () => {
      aktif = false;
    };
  }, [router]);

  function gantiMode(nextMode: Mode) {
    setMode(nextMode);
    setErr('');
    setInfo('');
    setLihat(false);
  }

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (proses) return;

    const formData = new FormData(e.currentTarget);
    const email = String(formData.get('email') ?? '').trim().toLowerCase();
    const password = String(formData.get('password') ?? '');
    const currentMode = mode;

    setErr('');
    setInfo('');
    setProses(true);

    try {
      if (currentMode === 'lupa') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) {
          setErr(pesanAuth(error.message));
          return;
        }
        setInfo('Jika email terdaftar, tautan pemulihan sudah dikirim. Periksa kotak masuk dan folder spam.');
        return;
      }

      if (currentMode === 'daftar') {
        const namaUsaha = String(formData.get('nama_usaha') ?? '').trim();
        if (!namaUsaha) {
          setErr('Isi nama usaha terlebih dahulu.');
          return;
        }
        if (password.length < 6) {
          setErr('Kata sandi minimal 6 karakter.');
          return;
        }

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { nama_usaha: namaUsaha },
            emailRedirectTo: `${window.location.origin}/onboarding`,
          },
        });

        if (error) {
          setErr(pesanAuth(error.message));
          return;
        }
        if (!data.session) {
          setInfo('Akun berhasil didaftarkan. Buka email untuk konfirmasi, lalu masuk ke CAVA.');
          setMode('masuk');
          setLihat(false);
          return;
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          setErr(pesanAuth(error.message));
          return;
        }
      }

      router.replace('/kasir');
      router.refresh();
    } catch (error) {
      setErr(pesanAuth(error instanceof Error ? error.message : 'Terjadi kesalahan. Coba lagi.'));
    } finally {
      setProses(false);
    }
  }

  if (checkingSession) {
    return (
      <main className="flex min-h-[100svh] items-center justify-center bg-[#CEE5D6] px-5">
        <div className="flex flex-col items-center gap-4 rounded-3xl bg-white/80 px-8 py-10 text-center shadow-lg">
          <CavaLogo variant="splash" height={42} />
          <p className="text-xs font-semibold text-[#307B8E]">Memeriksa sesi akun…</p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-[100svh] items-center justify-center bg-[#CEE5D6] p-3 text-[#103A57] sm:p-6">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-[30px] border border-[#103A57]/10 bg-white shadow-[0_24px_80px_rgba(16,58,87,0.18)] lg:min-h-[680px] lg:grid-cols-[0.9fr_1.1fr]">
        <aside className="relative flex min-h-[230px] flex-col justify-between overflow-hidden bg-[#103A57] px-7 py-7 text-white sm:px-10 sm:py-9 lg:min-h-full lg:px-12 lg:py-12">
          <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#307B8E]/35 blur-3xl" />
          <div aria-hidden="true" className="pointer-events-none absolute -bottom-28 -left-16 h-72 w-72 rounded-full bg-[#A9D3C5]/15 blur-3xl" />
          <div className="relative z-10 flex items-center justify-between">
            <CavaLogo variant="splash" height={48} light />
            <span className="rounded-full border border-[#A9D3C5]/35 bg-white/5 px-3 py-1.5 text-[9px] font-extrabold tracking-[0.18em] text-[#CEE5D6]">
              CASH VALUE
            </span>
          </div>

          <div className="relative z-10 mt-7 max-w-sm lg:mt-12">
            <p className="text-[10px] font-extrabold tracking-[0.22em] text-[#A9D3C5]">KELOLA USAHA LEBIH TERARAH</p>
            <h2 className="mt-3 text-2xl font-black leading-tight tracking-tight sm:text-3xl">
              Setiap transaksi punya arti bagi perkembangan usahamu.
            </h2>
            <p className="mt-3 max-w-sm text-xs leading-6 text-white/75 sm:text-sm">
              Catat pemasukan, pantau pengeluaran, dan pahami perkembangan usaha melalui satu tempat.
            </p>
          </div>

          <div className="relative z-10 mt-8 hidden gap-3 sm:grid sm:grid-cols-2 lg:mt-12">
            <div className="rounded-2xl border border-white/10 bg-white/[0.07] p-3">
              <CheckCircle2 className="mb-2 h-4 w-4 text-[#A9D3C5]" />
              <p className="text-[11px] font-bold text-white">Catatan lebih rapi</p>
              <p className="mt-1 text-[10px] leading-4 text-white/60">Transaksi harian tersimpan teratur.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.07] p-3">
              <Store className="mb-2 h-4 w-4 text-[#A9D3C5]" />
              <p className="text-[11px] font-bold text-white">Kenali nilai usaha</p>
              <p className="mt-1 text-[10px] leading-4 text-white/60">Pantau progres dari data yang tercatat.</p>
            </div>
          </div>
          <div aria-hidden="true" className="pointer-events-none absolute -bottom-[190px] left-1/2 h-[260px] w-[150%] -translate-x-1/2 rounded-[50%] bg-[#307B8E]/30" />
        </aside>

        <section className="flex flex-col justify-center px-5 py-8 sm:px-10 sm:py-10 lg:px-14">
          <div className="mx-auto w-full max-w-md">
            <Link href="/" className="mb-7 inline-flex items-center gap-2 text-[11px] font-bold text-[#307B8E] transition hover:text-[#103A57]">
              <ArrowLeft size={14} />
              Kembali ke halaman awal
            </Link>

            <div className="mb-6">
              <p className="text-[10px] font-extrabold tracking-[0.2em] text-[#307B8E]">
                {mode === 'lupa' ? 'PEMULIHAN AKUN' : 'AKUN CAVA'}
              </p>
              <h1 className="mt-2 text-2xl font-black tracking-tight text-[#103A57] sm:text-3xl">
                {mode === 'daftar' ? 'Buat akun usaha' : mode === 'lupa' ? 'Lupa kata sandi?' : 'Selamat datang kembali'}
              </h1>
              <p className="mt-2 text-xs leading-5 text-slate-500 sm:text-sm">
                {mode === 'daftar'
                  ? 'Mulai simpan catatan usaha dalam akun CAVA.'
                  : mode === 'lupa'
                    ? 'Masukkan email akun untuk menerima tautan pemulihan.'
                    : 'Masuk untuk melanjutkan pencatatan dan melihat perkembangan usaha.'}
              </p>
            </div>

            {mode !== 'lupa' ? (
              <div className="mb-6 grid grid-cols-2 rounded-2xl bg-[#CEE5D6]/55 p-1">
                <button
                  type="button"
                  onClick={() => gantiMode('masuk')}
                  aria-pressed={mode === 'masuk'}
                  className={`rounded-xl px-4 py-3 text-xs font-extrabold transition ${mode === 'masuk' ? 'bg-[#103A57] text-white shadow-sm' : 'text-[#103A57]/65 hover:text-[#103A57]'}`}
                >
                  Masuk
                </button>
                <button
                  type="button"
                  onClick={() => gantiMode('daftar')}
                  aria-pressed={mode === 'daftar'}
                  className={`rounded-xl px-4 py-3 text-xs font-extrabold transition ${mode === 'daftar' ? 'bg-[#103A57] text-white shadow-sm' : 'text-[#103A57]/65 hover:text-[#103A57]'}`}
                >
                  Daftar
                </button>
              </div>
            ) : (
              <button type="button" onClick={() => gantiMode('masuk')} className="mb-5 inline-flex items-center gap-2 text-xs font-bold text-[#307B8E] hover:text-[#103A57]">
                <ArrowLeft size={14} /> Kembali ke masuk
              </button>
            )}

            <form onSubmit={submit} className="space-y-4">
              {mode === 'daftar' && (
                <div>
                  <label htmlFor="nama_usaha" className="mb-2 block text-[11px] font-extrabold text-[#103A57]">Nama usaha / toko</label>
                  <div className="relative">
                    <Store className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#307B8E]" />
                    <input
                      id="nama_usaha"
                      name="nama_usaha"
                      type="text"
                      autoComplete="organization"
                      placeholder="Contoh: Warung Sari"
                      required
                      className="auth-input"
                    />
                  </div>
                </div>
              )}

              <div>
                <label htmlFor="email" className="mb-2 block text-[11px] font-extrabold text-[#103A57]">Email</label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#307B8E]" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    placeholder="nama@email.com"
                    required
                    className="auth-input"
                  />
                </div>
              </div>

              {mode !== 'lupa' && (
                <div>
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <label htmlFor="password" className="text-[11px] font-extrabold text-[#103A57]">Kata sandi</label>
                    {mode === 'masuk' && (
                      <button type="button" onClick={() => gantiMode('lupa')} className="text-[10px] font-bold text-[#307B8E] hover:text-[#103A57]">
                        Lupa kata sandi?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#307B8E]" />
                    <input
                      id="password"
                      name="password"
                      type={lihat ? 'text' : 'password'}
                      autoComplete={mode === 'daftar' ? 'new-password' : 'current-password'}
                      placeholder={mode === 'daftar' ? 'Minimal 6 karakter' : 'Masukkan kata sandi'}
                      minLength={mode === 'daftar' ? 6 : undefined}
                      required
                      className="auth-input"
                    />
                    <button
                      type="button"
                      onClick={() => setLihat((current) => !current)}
                      aria-label={lihat ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                      className="absolute right-3 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-xl text-slate-400 transition hover:bg-[#CEE5D6]/60 hover:text-[#103A57]"
                    >
                      {lihat ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                </div>
              )}

              {err && (
                <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-3 text-xs font-semibold leading-5 text-rose-700">
                  {err}
                </div>
              )}
              {info && (
                <div role="status" className="rounded-xl border border-[#366B2B]/20 bg-[#366B2B]/[0.07] px-3.5 py-3 text-xs font-semibold leading-5 text-[#366B2B]">
                  {info}
                </div>
              )}

              <button
                type="submit"
                disabled={proses}
                className="inline-flex min-h-13 w-full items-center justify-center gap-2 rounded-2xl bg-[#103A57] px-5 py-3.5 text-xs font-extrabold text-white shadow-lg shadow-[#103A57]/15 transition hover:bg-[#174968] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#307B8E]/25 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {proses ? 'Memproses…' : mode === 'daftar' ? 'Buat akun' : mode === 'lupa' ? 'Kirim tautan pemulihan' : 'Masuk ke CAVA'}
                {!proses && <ArrowRight size={15} />}
              </button>
            </form>

            <div className="my-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-slate-100" />
              <span className="text-[9px] font-bold tracking-[0.15em] text-slate-400">ATAU LANJUTKAN DENGAN</span>
              <div className="h-px flex-1 bg-slate-100" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Link href="/demo" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-[#307B8E]/20 bg-white px-3 py-3 text-[11px] font-extrabold text-[#103A57] transition hover:bg-[#CEE5D6]/35">
                <Play size={15} /> Coba demo
              </Link>
              <Link href="/kasir" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-[#307B8E]/20 bg-white px-3 py-3 text-[11px] font-extrabold text-[#103A57] transition hover:bg-[#CEE5D6]/35">
                <UserRound size={15} /> Mode tamu
              </Link>
            </div>

            <p className="mt-7 text-center text-[10px] leading-5 text-slate-400">
              Dengan menggunakan CAVA, pastikan informasi usaha yang dicatat sudah sesuai dengan kondisi sebenarnya.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
