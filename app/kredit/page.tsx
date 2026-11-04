'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ChevronDown,
  CheckCircle2,
  Circle,
  Download,
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  TriangleAlert,
  Sparkles,
  Info,
} from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import { supabase } from '@/lib/supabase';
import { fetchHari } from '@/lib/data';
import { todayISO, rupiah } from '@/lib/accounting';
import { BI_RATE } from '@/lib/config';
import { exportPdf } from '@/lib/exportPdf';
import { Rise } from '@/components/Motion';

const BATAS_BUNGA_MURAH = 8;
const BATAS_RASIO_CICILAN = 0.3;

type Bank = {
  id: string;
  nama: string;
  jenis: string;
  plafonMin: number;
  plafonMax: number;
  tenorBulan: number;
  hitungBunga: (biRate: number) => number;
  basisBunga: string;
  minUsiaBulan: number;
  minOmzetHarian: number;
  prosesHari: number;
  agunan: boolean;
  risiko: 'rendah' | 'sedang' | 'tinggi';
};

const mockBanks: Bank[] = [
  {
    id: 'kur-bri',
    nama: 'KUR BRI',
    jenis: 'Bank · Subsidi pemerintah',
    plafonMin: 1_000_000,
    plafonMax: 100_000_000,
    tenorBulan: 36,
    hitungBunga: () => 6,
    basisBunga: 'Tetap 6% (Subsidi KUR)',
    minUsiaBulan: 6,
    minOmzetHarian: 100_000,
    prosesHari: 7,
    agunan: false,
    risiko: 'rendah',
  },
  {
    id: 'bprs-amanah',
    nama: 'BPRS Amanah',
    jenis: 'BPR Syariah · Bagi Hasil',
    plafonMin: 2_000_000,
    plafonMax: 50_000_000,
    tenorBulan: 24,
    hitungBunga: (bi) => bi + 2,
    basisBunga: 'BI Rate + 2%',
    minUsiaBulan: 3,
    minOmzetHarian: 150_000,
    prosesHari: 5,
    agunan: false,
    risiko: 'rendah',
  },
  {
    id: 'kop-makmur',
    nama: 'Koperasi Usaha',
    jenis: 'Koperasi Simpan Pinjam',
    plafonMin: 1_000_000,
    plafonMax: 25_000_000,
    tenorBulan: 18,
    hitungBunga: (bi) => bi + 4,
    basisBunga: 'BI Rate + 4%',
    minUsiaBulan: 3,
    minOmzetHarian: 100_000,
    prosesHari: 3,
    agunan: false,
    risiko: 'sedang',
  },
  {
    id: 'pinjol-kilat',
    nama: 'Fintech P2P Online',
    jenis: 'Pinjaman Online Instan',
    plafonMin: 500_000,
    plafonMax: 15_000_000,
    tenorBulan: 6,
    hitungBunga: (bi) => bi + 12,
    basisBunga: 'BI Rate + 12%',
    minUsiaBulan: 0,
    minOmzetHarian: 0,
    prosesHari: 1,
    agunan: false,
    risiko: 'tinggi',
  },
];

const anuitas = (pokok: number, bungaTahun: number, bulan: number) => {
  const r = bungaTahun / 100 / 12;
  return r === 0 ? pokok / bulan : (pokok * r) / (1 - Math.pow(1 + r, -bulan));
};

export default function NilaiUsahaPage() {
  const router = useRouter();
  const areaRef = useRef<HTMLDivElement>(null);

  // Simulation parameters matching Nilai_Usaha_2ba3331c.pdf
  const [pinjamanSimulasi, setPinjamanSimulasi] = useState<number>(5000000);
  const [tenorSimulasi, setTenorSimulasi] = useState<number>(12); // months
  const [terbuka, setTerbuka] = useState<string | null>('kur-bri');
  const [downloading, setDownloading] = useState<boolean>(false);

  // Calculate monthly installment at 6% KUR rate
  const cicilanPerBulan = useMemo(() => {
    return Math.round(anuitas(pinjamanSimulasi, 6, tenorSimulasi));
  }, [pinjamanSimulasi, tenorSimulasi]);

  // Score from reference design: 78
  const scoreValue = 78;

  const handleDownloadPdf = async () => {
    if (!areaRef.current) return;
    setDownloading(true);
    try {
      await exportPdf(
        areaRef.current,
        `CAVA-Rapor-Nilai-Usaha-${todayISO()}.pdf`,
        `CAVA · Rapor Kesiapan Kredit & Nilai Usaha`,
      );
    } catch (e) {
      console.error(e);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="wrap" ref={areaRef}>
      {/* 1. Header matching Nilai_Usaha_2ba3331c.pdf */}
      <header className="pt-6 pb-2">
        <p className="text-xs font-bold text-[#307B8E]">Rapor usaha</p>
        <h1 className="text-2xl font-black text-[#103A57] tracking-tight">Nilai Usaha</h1>
      </header>

      {/* 2. Hero Card (Prussian Blue #103A57) with Circular Score 78 & Status */}
      <Rise delay={0.02}>
        <section className="relative overflow-hidden rounded-[28px] bg-[#103A57] p-5 text-white shadow-xl shadow-[#103A57]/20 border border-white/10">
          <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[#307B8E]/30 blur-2xl" />

          <div className="flex items-center gap-5">
            {/* Score Ring 78 */}
            <div className="relative flex h-24 w-24 shrink-0 items-center justify-center">
              <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="rgba(255,255,255,0.15)"
                  strokeWidth="8"
                  fill="transparent"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="#A9D3C5"
                  strokeWidth="8"
                  strokeDasharray={251.2}
                  strokeDashoffset={251.2 * (1 - scoreValue / 100)}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-3xl font-black tabular-nums text-white leading-none">
                  {scoreValue}
                </span>
              </div>
            </div>

            {/* Status & Recommendation */}
            <div className="min-w-0 flex-1">
              <div className="inline-block rounded-full bg-white/15 px-3 py-1 text-xs font-black text-[#A9D3C5] tracking-wide">
                Hampir siap KUR
              </div>
              <p className="mt-2 text-xs font-medium leading-relaxed text-white/90">
                Catatan 30 hari terakhir sudah cukup rapi. Tambah 6 hari pencatatan lagi.
              </p>
            </div>
          </div>
        </section>
      </Rise>

      {/* 3. Syarat Kesiapan Card (Mughal Green checkmarks #366B2B) */}
      <Rise delay={0.05}>
        <section className="rounded-3xl bg-white p-5 shadow-sm border border-[#307B8E]/10">
          <h2 className="text-sm font-black text-[#103A57] mb-3">Syarat kesiapan</h2>

          <div className="divide-y divide-slate-100">
            {/* Item 1 */}
            <div className="flex items-center gap-3 py-3">
              <CheckCircle2 size={20} className="text-[#366B2B] shrink-0" />
              <span className="text-xs font-bold text-[#103A57]">Pencatatan 24 dari 30 hari</span>
            </div>

            {/* Item 2 */}
            <div className="flex items-center gap-3 py-3">
              <CheckCircle2 size={20} className="text-[#366B2B] shrink-0" />
              <span className="text-xs font-bold text-[#103A57]">Pemasukan stabil 4 minggu</span>
            </div>

            {/* Item 3 */}
            <div className="flex items-center gap-3 py-3">
              <CheckCircle2 size={20} className="text-[#366B2B] shrink-0" />
              <span className="text-xs font-bold text-[#103A57]">Profil usaha lengkap</span>
            </div>

            {/* Item 4 (Uncompleted empty circle) */}
            <div className="flex items-center gap-3 py-3">
              <Circle size={20} className="text-slate-300 shrink-0" />
              <span className="text-xs font-semibold text-slate-500">Laporan 30 hari siap diunduh</span>
            </div>
          </div>
        </section>
      </Rise>

      {/* 4. Simulasi Cicilan Card matching Nilai_Usaha_2ba3331c.pdf */}
      <Rise delay={0.08}>
        <section className="rounded-3xl bg-white p-5 shadow-sm border border-[#307B8E]/10">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-black text-[#103A57]">Simulasi cicilan</h2>
            <div className="flex gap-1.5 bg-[#CEE5D6]/40 p-1 rounded-xl">
              {[12, 24, 36].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTenorSimulasi(t)}
                  className={`px-2.5 py-1 text-[11px] font-black rounded-lg transition ${
                    tenorSimulasi === t ? 'bg-[#103A57] text-white shadow-sm' : 'text-[#103A57]/70'
                  }`}
                >
                  {t} bln
                </button>
              ))}
            </div>
          </div>

          {/* Range Slider */}
          <div className="mt-4">
            <input
              type="range"
              min={1000000}
              max={25000000}
              step={500000}
              value={pinjamanSimulasi}
              onChange={(e) => setPinjamanSimulasi(Number(e.target.value))}
              className="w-full accent-[#103A57]"
            />
          </div>

          {/* Loan vs Monthly Estimate */}
          <div className="mt-4 flex items-center justify-between pt-2 border-t border-slate-100">
            <div>
              <p className="text-[11px] font-bold text-slate-400">Plafon Pinjaman</p>
              <p className="text-sm font-black text-[#103A57] tabular-nums">
                {rupiah(pinjamanSimulasi)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[11px] font-bold text-slate-400">Estimasi Cicilan</p>
              <p className="text-base font-black text-[#103A57] tabular-nums">
                ± {rupiah(cicilanPerBulan)}<span className="text-xs text-slate-400 font-semibold">/bln</span>
              </p>
            </div>
          </div>
        </section>
      </Rise>

      {/* 5. Download Button (Prussian Blue #103A57) */}
      <Rise delay={0.1}>
        <button
          type="button"
          onClick={handleDownloadPdf}
          disabled={downloading}
          className="w-full rounded-2xl bg-[#103A57] py-4 px-5 text-sm font-black text-white shadow-lg shadow-[#103A57]/20 hover:bg-[#103A57]/95 active:scale-[0.98] transition flex items-center justify-center gap-2"
        >
          <Download size={18} />
          {downloading ? 'Menyiapkan Dokumen PDF…' : 'Unduh Rapor PDF'}
        </button>
      </Rise>

      {/* 6. Perbandingan Lembaga Keuangan & Bank */}
      <Rise delay={0.12}>
        <section className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black text-[#103A57]">Pilihan Lembaga Pembiayaan</h2>
            <span className="text-[11px] font-bold text-[#307B8E]">BI Rate: {BI_RATE}%</span>
          </div>

          {mockBanks.map((bank) => {
            const isSelected = terbuka === bank.id;
            const bunga = bank.hitungBunga(BI_RATE);
            const cicilan = Math.round(anuitas(pinjamanSimulasi, bunga, tenorSimulasi));

            return (
              <div
                key={bank.id}
                className="overflow-hidden rounded-2xl bg-white border border-[#307B8E]/12 shadow-sm transition"
              >
                <button
                  type="button"
                  onClick={() => setTerbuka(isSelected ? null : bank.id)}
                  className="w-full p-4 flex items-center justify-between text-left"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-black text-[#103A57]">{bank.nama}</h3>
                      {bank.id === 'kur-bri' && (
                        <span className="rounded-md bg-[#A9D3C5] px-1.5 py-0.5 text-[9px] font-black text-[#103A57]">
                          Direkomendasikan
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] font-semibold text-slate-500 mt-0.5">{bank.jenis}</p>
                  </div>

                  <div className="text-right">
                    <p className="text-sm font-black text-[#103A57] tabular-nums">
                      {bunga}% <span className="text-[10px] text-slate-400 font-bold">/thn</span>
                    </p>
                    <p className="text-[11px] font-semibold text-[#307B8E]">
                      {rupiah(cicilan)}/bln
                    </p>
                  </div>
                </button>

                {isSelected && (
                  <div className="border-t border-slate-100 bg-[#CEE5D6]/20 p-4 text-xs space-y-2">
                    <div className="flex justify-between text-slate-600">
                      <span>Plafon Maksimal:</span>
                      <b className="text-[#103A57]">{rupiah(bank.plafonMax)}</b>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Waktu Proses:</span>
                      <b className="text-[#103A57]">± {bank.prosesHari} Hari Kerja</b>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Agunan:</span>
                      <b className="text-[#103A57]">{bank.agunan ? 'Diperlukan' : 'Tanpa Agunan'}</b>
                    </div>
                    <p className="mt-2 text-[11px] leading-relaxed text-slate-500 italic">
                      {bank.id === 'kur-bri'
                        ? 'Pilihan paling ideal untuk pengembangan usaha modal kecil-menengah dengan subsidi suku bunga pemerintah.'
                        : 'Alternatif pembiayaan mikro syariah dan koperasi dengan proses cepat.'}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </section>
      </Rise>

      <BottomNav />
    </div>
  );
}
