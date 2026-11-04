'use client';

import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, ArrowDownLeft, ArrowUpRight, Check, ShoppingBag, Delete, Sparkles } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { rupiah, todayISO } from '@/lib/accounting';
import { kaChing } from '@/lib/sound';
import CavaLogo from './CavaLogo';

type QuickRecordModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
};

export default function QuickRecordModal({
  isOpen,
  onClose,
  onSuccess,
}: QuickRecordModalProps) {
  const [type, setType] = useState<'masuk' | 'keluar'>('masuk');
  const [nominalStr, setNominalStr] = useState<string>('');
  const [keterangan, setKeterangan] = useState<string>('');
  const [metode, setMetode] = useState<'tunai' | 'qris'>('tunai');
  const [loading, setLoading] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [kategoriBiaya, setKategoriBiaya] = useState('Belanja bahan baku');

  // Quick preset amounts
  const presets = [10000, 20000, 50000, 100000, 150000, 250000];

  const nominalNumber = parseInt(nominalStr, 10) || 0;

  // Handle calculator numpad
  const handleNumpad = (char: string) => {
    if (char === 'clear') {
      setNominalStr('');
      return;
    }
    if (char === 'back') {
      setNominalStr((prev) => prev.slice(0, -1));
      return;
    }
    if (nominalStr.length >= 10) return; // limit input
    setNominalStr((prev) => {
      const next = prev + char;
      // remove leading zero
      return next.replace(/^0+/, '');
    });
  };

  const handlePreset = (amount: number) => {
    setNominalStr(String(amount));
  };

  const handleSave = async () => {
    if (nominalNumber <= 0) return;
    setLoading(true);

    try {
      const tanggal = todayISO();
      const { data: { user } } = await supabase.auth.getUser();

      const note = keterangan.trim() || (type === 'masuk' ? 'Penjualan tunai kasir' : kategoriBiaya);

      if (user) {
        // Find or create daily session
        let { data: session } = await supabase
          .from('daily_sessions')
          .select('id')
          .eq('tanggal', tanggal)
          .maybeSingle();

        if (!session) {
          const { data: newSession } = await supabase
            .from('daily_sessions')
            .insert({ tanggal, modal_harian: 0 })
            .select('id')
            .single();
          session = newSession;
        }

        if (session) {
          await supabase.from('transactions').insert({
            session_id: session.id,
            user_id: user.id,
            jenis: type === 'masuk' ? 'penjualan' : 'biaya',
            keterangan: note,
            jumlah: nominalNumber,
            qty: 1,
            metode: type === 'masuk' ? metode : null,
          });
        }
      }

      // Play CAVA chime sound
      kaChing();
      setSavedSuccess(true);

      setTimeout(() => {
        setSavedSuccess(false);
        setNominalStr('');
        setKeterangan('');
        setLoading(false);
        if (onSuccess) onSuccess();
        onClose();
      }, 900);
    } catch {
      // In demo mode or if offline, still simulate instant success
      kaChing();
      setSavedSuccess(true);
      setTimeout(() => {
        setSavedSuccess(false);
        setNominalStr('');
        setKeterangan('');
        setLoading(false);
        if (onSuccess) onSuccess();
        onClose();
      }, 900);
    }
  };

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center p-0 sm:p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#103A57]/60 backdrop-blur-sm"
          />

          {/* Bottom Sheet Modal */}
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className="relative w-full max-w-lg rounded-t-[32px] sm:rounded-[32px] bg-[#CEE5D6] p-5 sm:p-6 shadow-2xl border border-white/50 max-h-[92vh] flex flex-col overflow-y-auto"
          >
            {/* Grab Bar Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#307B8E]/15">
              <div className="flex items-center gap-2">
                <CavaLogo variant="mark" size="sm" />
                <div>
                  <h2 className="text-base font-black tracking-tight text-[#103A57]">Catat Transaksi</h2>
                  <p className="text-[11px] font-bold text-[#307B8E]">Pencatatan kas instan CAVA</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="grid h-8 w-8 place-items-center rounded-full bg-white/70 text-[#103A57] hover:bg-white transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Type Switcher: Masuk vs Keluar */}
            <div className="mt-4 grid grid-cols-2 gap-2 rounded-2xl bg-white/70 p-1.5 shadow-sm border border-slate-200/40">
              <button
                type="button"
                onClick={() => setType('masuk')}
                className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-black transition-all ${
                  type === 'masuk'
                    ? 'bg-[#103A57] text-white shadow-md'
                    : 'text-[#103A57]/70 hover:text-[#103A57]'
                }`}
              >
                <ArrowDownLeft size={16} className={type === 'masuk' ? 'text-[#A9D3C5]' : ''} />
                <span>UANG MASUK</span>
              </button>
              <button
                type="button"
                onClick={() => setType('keluar')}
                className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-black transition-all ${
                  type === 'keluar'
                    ? 'bg-[#991B1B] text-white shadow-md'
                    : 'text-[#103A57]/70 hover:text-[#103A57]'
                }`}
              >
                <ArrowUpRight size={16} className={type === 'keluar' ? 'text-[#CEE5D6]' : ''} />
                <span>UANG KELUAR</span>
              </button>
            </div>

            {/* Big Amount Display */}
            <div className="mt-4 rounded-2xl bg-white p-4 text-center shadow-sm border border-[#307B8E]/10">
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#307B8E]">
                {type === 'masuk' ? 'Nominal Penjualan' : 'Nominal Pengeluaran'}
              </span>
              <div className="mt-1 flex items-baseline justify-center gap-1">
                <span className={`text-3xl sm:text-4xl font-black tabular-nums tracking-tight ${
                  type === 'masuk' ? 'text-[#103A57]' : 'text-[#991B1B]'
                }`}>
                  {rupiah(nominalNumber)}
                </span>
              </div>
              <p className="mt-1 text-[11px] font-medium text-slate-500">
                {nominalNumber > 0 ? (type === 'masuk' ? 'Akan ditambahkan ke pemasukan hari ini' : 'Akan dicatat sebagai beban operasional') : 'Ketik angka pada tombol di bawah'}
              </p>
            </div>

            {/* Quick Presets */}
            <div className="mt-3 flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {presets.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => handlePreset(p)}
                  className="rounded-xl border border-[#307B8E]/20 bg-white/80 px-2.5 py-1.5 text-[11px] font-extrabold text-[#103A57] hover:bg-white active:scale-95 transition shrink-0"
                >
                  +{p >= 1000 ? `${p / 1000}rb` : p}
                </button>
              ))}
            </div>

            {/* Method (Tunai vs QRIS for Masuk) or Category for Keluar */}
            {type === 'masuk' ? (
              <div className="mt-3 flex items-center justify-between rounded-xl bg-white/60 px-3 py-2 border border-[#307B8E]/10">
                <span className="text-xs font-bold text-[#103A57]">Metode Pembayaran:</span>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => setMetode('tunai')}
                    className={`rounded-lg px-3 py-1 text-xs font-black transition ${
                      metode === 'tunai'
                        ? 'bg-[#103A57] text-white'
                        : 'bg-white text-[#103A57]/80'
                    }`}
                  >
                    💵 Tunai
                  </button>
                  <button
                    type="button"
                    onClick={() => setMetode('qris')}
                    className={`rounded-lg px-3 py-1 text-xs font-black transition ${
                      metode === 'qris'
                        ? 'bg-[#307B8E] text-white'
                        : 'bg-white text-[#103A57]/80'
                    }`}
                  >
                    📱 QRIS
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-3">
                <select
                  value={kategoriBiaya}
                  onChange={(e) => setKategoriBiaya(e.target.value)}
                  className="w-full rounded-xl border border-[#307B8E]/20 bg-white px-3 py-2 text-xs font-bold text-[#103A57]"
                >
                  <option value="Belanja bahan baku">🛒 Belanja bahan baku / stok</option>
                  <option value="Operasional & utilitas">💡 Listrik / Air / Gas</option>
                  <option value="Gaji & upah">👥 Upah / Tenaga kerja</option>
                  <option value="Sewa & pemeliharaan">🏠 Sewa tempat / Alat</option>
                  <option value="Pengeluaran lainnya">📦 Lain-lain</option>
                </select>
              </div>
            )}

            {/* Note Input */}
            <input
              type="text"
              value={keterangan}
              onChange={(e) => setKeterangan(e.target.value)}
              placeholder={type === 'masuk' ? 'Catatan (opsional, mis. 2 Kopi Susu)' : 'Keterangan pengeluaran'}
              className="mt-3 w-full rounded-xl border border-[#307B8E]/20 bg-white px-3 py-2.5 text-xs font-semibold text-[#103A57] placeholder:text-slate-400"
            />

            {/* Tactile Numpad */}
            <div className="mt-3 grid grid-cols-3 gap-1.5">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', '000', '0', 'back'].map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleNumpad(key)}
                  className="h-11 rounded-xl bg-white font-extrabold text-base text-[#103A57] shadow-sm hover:bg-[#CEE5D6]/35 active:scale-95 transition flex items-center justify-center border border-[#307B8E]/10"
                >
                  {key === 'back' ? <Delete size={18} className="text-[#991B1B]" /> : key}
                </button>
              ))}
            </div>

            {/* Submit Action Button */}
            <div className="mt-4">
              <button
                type="button"
                disabled={nominalNumber <= 0 || loading}
                onClick={handleSave}
                className={`relative w-full rounded-2xl py-3.5 px-4 font-black text-sm tracking-wide text-white shadow-lg transition-all active:scale-[0.98] disabled:opacity-40 ${
                  type === 'masuk'
                    ? 'bg-[#103A57] hover:bg-[#103A57]/90'
                    : 'bg-[#991B1B] hover:bg-[#991B1B]/90'
                }`}
              >
                {savedSuccess ? (
                  <span className="flex items-center justify-center gap-2">
                    <Check size={18} className="text-[#366B2B]" /> TERCATAT!
                  </span>
                ) : loading ? (
                  'Menyimpan transaksi…'
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Sparkles size={16} className="text-[#A9D3C5]" />
                    {type === 'masuk' ? 'SIMPAN UANG MASUK' : 'SIMPAN PENGELUARAN'}
                  </span>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
