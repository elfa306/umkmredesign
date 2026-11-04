'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Store, Boxes, QrCode, Lock, LogOut, ChevronRight, Sparkles, BookOpen, Factory } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import BottomNav from '@/components/BottomNav';
import { Press, Rise } from '@/components/Motion';
import CavaLogo from '@/components/CavaLogo';

const menus = [
  {
    href: '/pengaturan-usaha',
    icon: Store,
    title: 'Profil & Jenis Usaha',
    desc: 'Atur kategori bisnis, modal awal, dan metode penerimaan kas',
  },
  {
    href: '/inventaris',
    icon: Boxes,
    title: 'Manajemen Inventaris & Stok',
    desc: 'Katalog barang dagangan, bahan baku, dan riwayat mutasi persediaan',
  },
  {
    href: '/integrasi',
    icon: QrCode,
    title: 'Koneksi QRIS & MacroDroid',
    desc: 'Panduan otomatisasi notifikasi GoPay Merchant ke kasir CAVA',
  },
  {
    href: '/demo',
    icon: Sparkles,
    title: 'Coba Ruang Demonstrasi',
    desc: 'Simulasi alur transaksi retail, manufaktur, dan jasa tanpa login',
  },
  {
    href: '/reset-password',
    icon: Lock,
    title: 'Keamanan & Kata Sandi',
    desc: 'Ubah kata sandi akun CAVA Anda',
  },
];

export default function AkunLainnyaPage() {
  const router = useRouter();
  const [userName, setUserName] = useState('Pemilik Usaha');
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUserName(user.user_metadata?.nama_usaha ?? 'Usaha CAVA');
        setUserEmail(user.email ?? '');
      }
    });
  }, []);

  async function keluar() {
    await supabase.auth.signOut();
    router.replace('/login');
  }

  return (
    <div className="wrap">
      {/* Header */}
      <header className="pt-6 pb-2 text-center">
        <p className="text-xs font-bold text-[#307B8E]">Pengaturan Akun</p>
        <h1 className="text-2xl font-black text-[#103A57] tracking-tight">Akun & Fitur</h1>
      </header>

      {/* User Profile Card (Prussian Blue #103A57) */}
      <Rise delay={0.02}>
        <div className="rounded-3xl bg-[#103A57] p-5 text-white shadow-xl shadow-[#103A57]/15 border border-white/10 flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/10 p-2 shadow-inner">
            <CavaLogo variant="mark" size="md" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-base font-black truncate">{userName}</h2>
            <p className="text-xs text-[#A9D3C5] font-semibold truncate">{userEmail || 'Akun UMKM Terdaftar'}</p>
            <span className="inline-block mt-1.5 rounded-full bg-white/15 px-2.5 py-0.5 text-[10px] font-extrabold text-[#CEE5D6]">
              CAVA Basic Member
            </span>
          </div>
        </div>
      </Rise>

      {/* Menu List */}
      <div className="space-y-2.5 pt-1">
        {menus.map((m, i) => {
          const Icon = m.icon;
          return (
            <Rise key={m.href} delay={0.04 * (i + 1)}>
              <Link
                href={m.href}
                className="flex items-center gap-3.5 rounded-2xl bg-white p-4 shadow-sm border border-[#307B8E]/10 hover:border-[#307B8E]/30 active:scale-[0.99] transition"
              >
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#A9D3C5]/40 text-[#103A57]">
                  <Icon size={20} strokeWidth={2.2} />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-xs font-black text-[#103A57]">{m.title}</h3>
                  <p className="text-[11px] text-[#486577] mt-0.5 leading-snug line-clamp-1">{m.desc}</p>
                </div>
                <ChevronRight size={18} className="text-slate-300 shrink-0" />
              </Link>
            </Rise>
          );
        })}
      </div>

      {/* Logout Button */}
      <div className="pt-2">
        <button
          type="button"
          onClick={keluar}
          className="w-full rounded-2xl bg-white border border-red-200 py-3.5 px-4 text-xs font-extrabold text-[#991B1B] shadow-sm hover:bg-red-50/50 active:scale-[0.98] transition flex items-center justify-center gap-2"
        >
          <LogOut size={16} /> Keluar dari Akun
        </button>
      </div>

      <BottomNav />
    </div>
  );
}
