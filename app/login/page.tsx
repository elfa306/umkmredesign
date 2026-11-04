'use client';

import { useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Eye, EyeOff, Lock, Mail, Play, Store, UserRound } from 'lucide-react';
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

    void supabase.auth.getSession()
      .then(({ data, error }) => {
        if (!aktif) return;
        if (!error && data.session) {
          router.replace('/kasir');
          return;
        }
        setCheckingSession(false);
      })
      .catch(() => {
        if (aktif) setCheckingSession(false);
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
      <main className="grid min-h-[100svh] place-items-center bg-[#CEE5D6] px-5">
        <div className="flex flex-col items-center gap-3 rounded-3xl bg-white px-8 py-8 shadow-sm">
          <CavaLogo variant="horizontal" height={34} />
          <p className="text-xs font-semibold text-[#307B8E]">Memeriksa akun…</p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-[100svh] items-center justify-center bg-[#CEE5D6] px-4 py-8 sm:px-6">
      <section className="w-full max-w-[420px] rounded-[26px] border border-[#103A57]/10 bg-white p-5 shadow-[0_18px_55px_rgba(16,58,87,0.12)] sm:p-8">
        <header className="mb-7">
          <Link href="/" aria-label="Kembali ke halaman awal CAVA" className="mb-6 inline-flex items-center gap-2 text-[11px] font-bold text-[#307B8E] transition hover:text-[#103A57]">
            <ArrowLeft size={14} />
            Beranda
          </Link>
          <div className="mb-6">
            <CavaLogo variant="horizontal" height={38} />
          </div>
          <p className="text-[10px] font-extrabold tracking-[0.17em] text-[#307B8E]">
            {mode === 'lupa' ? 'PEMULIHAN AKUN' : 'AKUN CAVA'}
          </p>
          <h1 className="mt-2 text-[25px] font-black leading-tight tracking-tight text-[#103A57]">
            {mode === 'daftar' ? 'Daftar akun usaha' : mode === 'lupa' ? 'Lupa kata sandi?' : 'Masuk ke CAVA'}
          </h1>
          <p className="mt-1.5 text-xs leading-5 text-slate-500">
            {mode === 'daftar'
              ? 'Buat akun untuk menyimpan catatan usahamu.'
              : mode === 'lupa'
                ? 'Masukkan email akun untuk menerima tautan pemulihan.'
                : 'Masukkan email dan kata sandi untuk melanjutkan.'}
          </p>
        </header>

        {mode !== 'lupa' ? (
          <div className="mb-5 grid grid-cols-2 rounded-xl bg-[#CEE5D6]/60 p-1">
            <button
              type="button"
              onClick={() => gantiMode('masuk')}
              aria-pressed={mode === 'masuk'}
              className={`min-h-10 rounded-lg px-3 text-xs font-extrabold transition ${mode === 'masuk' ? 'bg-[#103A57] text-white shadow-sm' : 'text-[#103A57]/65 hover:text-[#103A57]'}`}
            >
              Masuk
            </button>
            <button
              type="button"
              onClick={() => gantiMode('daftar')}
              aria-pressed={mode === 'daftar'}
              className={`min-h-10 rounded-lg px-3 text-xs font-extrabold transition ${mode === 'daftar' ? 'bg-[#103A57] text-white shadow-sm' : 'text-[#103A57]/65 hover:text-[#103A57]'}`}
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
              <label htmlFor="nama_usaha" className="mb-1.5 block text-[11px] font-extrabold text-[#103A57]">Nama usaha / toko</label>
              <div className="relative">
                <Store className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#307B8E]" />
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
            <label htmlFor="email" className="mb-1.5 block text-[11px] font-extrabold text-[#103A57]">Email</label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#307B8E]" />
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
              <div className="mb-1.5 flex items-center justify-between gap-2">
                <label htmlFor="password" className="text-[11px] font-extrabold text-[#103A57]">Kata sandi</label>
                {mode === 'masuk' && (
                  <button type="button" onClick={() => gantiMode('lupa')} className="text-[10px] font-bold text-[#307B8E] hover:text-[#103A57]">
                    Lupa kata sandi?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#307B8E]" />
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
                  className="absolute right-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-xl text-slate-400 transition hover:bg-[#CEE5D6]/60 hover:text-[#103A57]"
                >
                  {lihat ? <EyeOff size={16} /> : <Eye size={16} />}
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
            className="inline-flex min-h-[50px] w-full items-center justify-center gap-2 rounded-xl bg-[#103A57] px-5 py-3 text-xs font-extrabold text-white shadow-md shadow-[#103A57]/15 transition hover:bg-[#174968] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#307B8E]/25 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {proses ? 'Memproses…' : mode === 'daftar' ? 'Buat akun' : mode === 'lupa' ? 'Kirim tautan pemulihan' : 'Masuk'}
            {!proses && <ArrowRight size={15} />}
          </button>
        </form>

        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-slate-100" />
          <span className="text-[9px] font-bold tracking-[0.14em] text-slate-400">AKSES LAIN</span>
          <div className="h-px flex-1 bg-slate-100" />
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <Link href="/demo" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#307B8E]/20 bg-white px-3 py-2.5 text-[11px] font-extrabold text-[#103A57] transition hover:bg-[#CEE5D6]/35">
            <Play size={14} /> Demo
          </Link>
          <Link href="/kasir" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#307B8E]/20 bg-white px-3 py-2.5 text-[11px] font-extrabold text-[#103A57] transition hover:bg-[#CEE5D6]/35">
            <UserRound size={14} /> Mode tamu
          </Link>
        </div>
      </section>
    </main>
  );
}
