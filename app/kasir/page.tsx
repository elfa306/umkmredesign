'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Bell,
  Eye,
  EyeOff,
  Plus,
  Minus,
  QrCode,
  Package,
  TrendingUp,
  AlertTriangle,
  Clock,
  ChevronRight,
  ShoppingBag,
  Sparkles,
  Volume2,
  VolumeX,
  X,
  Check,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { exportExcel } from '@/lib/exportExcel';
import { fetchHari } from '@/lib/data';
import { angka, rupiah, rupiahTanda, summarize, todayISO, tglPanjang, type Product, type Tx } from '@/lib/accounting';
import { ISTILAH, teksBalikModal } from '@/lib/istilah';
import { useQrisRealtime, type TxBaris } from '@/lib/useQrisRealtime';
import { isSoundOn, kaChing, setSoundOn, unlockSound } from '@/lib/sound';
import BottomNav from '@/components/BottomNav';
import RpInput from '@/components/RpInput';
import AnimatedRupiah from '@/components/AnimatedRupiah';
import TrenChart, { type TitikTren } from '@/components/TrenChart';
import { Press, Rise } from '@/components/Motion';
import QuickRecordModal from '@/components/QuickRecordModal';
import { CavaVMark, CavaLogo } from '@/components/CavaLogo';

type Sesi = { id: string; modal_harian: number };
type QrisInvoiceItem = { productId: string; nama: string; harga: number; qty: number; subtotal: number };
type QrisInvoice = {
  id: string;
  invoice_no: string;
  total: number;
  items: QrisInvoiceItem[];
  created_at: string;
  status: 'pending' | 'paid_manual';
  paid_at?: string | null;
  notificationMatch?: boolean;
};

const jam = (iso: string) =>
  new Date(iso).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jakarta' });
const keTx = (r: TxBaris | Tx): Tx => ({ ...(r as Tx), jumlah: Number(r.jumlah) });

// Determine greeting based on Jakarta local hour
function salamWaktu() {
  const jamSekarang = new Date().getHours();
  if (jamSekarang >= 4 && jamSekarang < 11) return 'Selamat pagi';
  if (jamSekarang >= 11 && jamSekarang < 15) return 'Selamat siang';
  if (jamSekarang >= 15 && jamSekarang < 18) return 'Selamat sore';
  return 'Selamat malam';
}

export default function Kasir() {
  const router = useRouter();
  const tanggal = todayISO();
  const [userId, setUserId] = useState<string | null>(null);
  const [namaUsaha, setNamaUsaha] = useState('[Nama Usaha]');
  const [sesi, setSesi] = useState<Sesi | null>(null);
  const [txs, setTxs] = useState<Tx[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [tren, setTren] = useState<TitikTren[]>([]);
  const [metode, setMetode] = useState<'tunai' | 'qris'>('tunai');
  const [jenisQris, setJenisQris] = useState<'statis' | 'dinamis'>('statis');
  const [keranjang, setKeranjang] = useState<Record<string, number>>({});
  const [invoiceQris, setInvoiceQris] = useState<QrisInvoice | null>(null);
  const [confirmQrisType, setConfirmQrisType] = useState<'statis' | 'dinamis' | null>(null);
  const [busyQrisConfirm, setBusyQrisConfirm] = useState(false);
  const [staticQrisConfirmation, setStaticQrisConfirmation] = useState<{ total: number; count: number } | null>(null);
  const staticConfirmationKeyRef = useRef<string | null>(null);
  const [ready, setReady] = useState(false);
  const [err, setErr] = useState('');
  const [toast, setToast] = useState('');
  const [qris, setQris] = useState<{ key: string; jumlah: number; invoiceNo?: string; nominalCocok?: boolean; title?: string; detail?: string } | null>(null);
  const [baruIds, setBaruIds] = useState<Set<string>>(new Set());
  const [hapusTarget, setHapusTarget] = useState<Product | null>(null);
  const [menghapus, setMenghapus] = useState(false);
  const [suara, setSuara] = useState(true);

  // New CAVA UI states
  const [sembunyikanNominal, setSembunyikanNominal] = useState(false);
  const [showCatatModal, setShowCatatModal] = useState(false);
  const [showCatalog, setShowCatalog] = useState(false);
  const [showQrisPreview, setShowQrisPreview] = useState(false);
  const [showNotifModal, setShowNotifModal] = useState(false);

  const sudahDiproses = useRef<Set<string>>(new Set());
  const sesiRef = useRef<Sesi | null>(null);
  const invoiceQrisRef = useRef<QrisInvoice | null>(null);
  sesiRef.current = sesi;
  invoiceQrisRef.current = invoiceQris;

  const cartLines = useMemo(() => Object.entries(keranjang).map(([id, qty]) => {
    const product = products.find((item) => item.id === id);
    return product ? { product, qty } : null;
  }).filter((line): line is { product: Product; qty: number } => line !== null), [keranjang, products]);
  const cartTotal = cartLines.reduce((sum, line) => sum + line.product.harga * line.qty, 0);

  const info = (t: string) => { setToast(t); setTimeout(() => setToast(''), 2500); };

  async function importQris(sesiId: string) {
    const { error } = await supabase.rpc('post_pending_gopay_notifications', {
      p_session_id: sesiId,
    });
    if (error) {
      console.error('Gagal memproses inbox GoPay:', error.message);
      setErr('Ada notifikasi QRIS yang belum berhasil dimasukkan. Muat ulang kasir atau hubungi pengelola.');
    }
  }

  const load = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setUserId('guest');
      setNamaUsaha('[Nama Usaha]');
      setProducts([
        { id: 'sample-1', nama: 'Kopi Cava Latte', harga: 18000, stok: 15, satuan: 'cup', aktif: true, jenis_item: 'finished_good' } as any,
        { id: 'sample-2', nama: 'Roti Bakar Kaya', harga: 15000, stok: 20, satuan: 'porsi', aktif: true, jenis_item: 'finished_good' } as any,
        { id: 'sample-3', nama: 'Gula Pasir Kristal', harga: 17500, stok: 2, stok_minimum: 5, satuan: 'kg', aktif: true, jenis_item: 'merchandise' } as any,
      ]);
      setReady(true);
      return;
    }

    const [p, s] = await Promise.all([
      supabase.from('products').select('id,nama,harga,stok,stok_minimum,satuan').eq('aktif', true).in('jenis_item', ['merchandise', 'finished_good', 'service']).order('created_at'),
      supabase.from('daily_sessions').select('id,modal_harian').eq('tanggal', tanggal).maybeSingle(),
    ]);
    setProducts((p.data ?? []).map((x) => ({ ...x, harga: Number(x.harga) })));
    if (s.data) {
      setSesi({ id: s.data.id, modal_harian: Number(s.data.modal_harian) });
      await importQris(s.data.id);
      const [t, invoiceResult] = await Promise.all([
        supabase.from('transactions').select('*').eq('session_id', s.data.id).order('created_at'),
        supabase.from('qris_invoice_drafts').select('id,invoice_no,total,items,created_at,status,paid_at').eq('session_id', s.data.id).in('status', ['pending', 'paid_manual']).order('created_at', { ascending: false }).limit(1).maybeSingle(),
      ]);
      setTxs((t.data ?? []).map((x) => ({ ...x, jumlah: Number(x.jumlah) })) as Tx[]);
      if (invoiceResult.error) {
        console.error('Gagal memuat draft invoice QRIS:', invoiceResult.error.message);
        setInvoiceQris(null);
      } else if (invoiceResult.data) {
        const saved = invoiceResult.data;
        setMetode('qris');
        setJenisQris('dinamis');
        setInvoiceQris({
          id: saved.id, invoice_no: saved.invoice_no, total: Number(saved.total),
          items: Array.isArray(saved.items) ? saved.items as QrisInvoiceItem[] : [],
          created_at: saved.created_at, status: saved.status as 'pending' | 'paid_manual', paid_at: saved.paid_at, notificationMatch: false,
        });
      } else {
        setInvoiceQris(null);
      }
    } else {
      setInvoiceQris(null);
    }
    setReady(true);
  }, [router, tanggal]);

  useEffect(() => { load(); }, [load]);

  // Listen to quick transaction modal events
  useEffect(() => {
    const handleReload = () => load();
    window.addEventListener('cava:transaction-saved', handleReload);
    return () => window.removeEventListener('cava:transaction-saved', handleReload);
  }, [load]);

  useEffect(() => {
    const t = setInterval(() => { if (!document.hidden) load(); }, 60000);
    const v = () => { if (!document.hidden) load(); };
    document.addEventListener('visibilitychange', v);
    return () => { clearInterval(t); document.removeEventListener('visibilitychange', v); };
  }, [load]);

  useEffect(() => {
    setSuara(isSoundOn());
    const buka = () => unlockSound();
    window.addEventListener('pointerdown', buka, { once: true });
    return () => window.removeEventListener('pointerdown', buka);
  }, []);

  useEffect(() => {
    if (!ready) return;
    const akhir = new Date(tanggal + 'T12:00:00'); akhir.setDate(akhir.getDate() - 1);
    const awal = new Date(akhir); awal.setDate(awal.getDate() - 6);
    fetchHari(awal.toLocaleDateString('en-CA'), akhir.toLocaleDateString('en-CA')).then((h) =>
      setTren([...h].reverse().map((x) => { const sum = summarize(x.modal, x.txs); return { tanggal: x.tanggal, uangMasuk: sum.pendapatan, untung: sum.labaBersih }; }))
    ).catch(() => undefined);
  }, [ready, tanggal]);

  const tampilkanQris = useCallback((r: TxBaris) => {
    if (sudahDiproses.current.has(r.id)) return;
    sudahDiproses.current.add(r.id);
    const tx = keTx(r);
    setTxs((t) => (t.some((x) => x.id === tx.id) ? t : [...t, tx]));
    setBaruIds((s) => new Set(s).add(tx.id));
    setTimeout(() => setBaruIds((s) => { const n = new Set(s); n.delete(tx.id); return n; }), 2600);
    const invoiceNow = invoiceQrisRef.current;
    const nominalCocok = Boolean(invoiceNow && invoiceNow.total === tx.jumlah);
    if (nominalCocok) {
      setInvoiceQris((current) => current ? { ...current, notificationMatch: true } : current);
      info(`🔔 Notifikasi GoPay/MacroDroid ${rupiah(tx.jumlah)} cocok dengan ${invoiceNow?.invoice_no}.`);
    }
    setQris({ key: tx.id, jumlah: tx.jumlah, invoiceNo: nominalCocok ? invoiceNow?.invoice_no : undefined, nominalCocok });
    kaChing();
    setTimeout(() => setQris((q) => (q?.key === tx.id ? null : q)), 4500);
  }, []);

  const status = useQrisRealtime(userId, {
    onQrisMasuk: tampilkanQris,
    onInboxBaru: (m) => { if (!sesiRef.current) { kaChing(); info(`💰 QRIS ${rupiah(Number(m.jumlah))} masuk. Sesi harian belum dimulai.`); } },
    onTersambung: () => { if (sesiRef.current) load(); },
  });

  async function mulaiHari(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const modal = angka(new FormData(e.currentTarget).get('modal'));
    const { error } = await supabase.from('daily_sessions').insert({ tanggal, modal_harian: modal });
    if (error) return setErr(error.message);
    load();
  }

  async function catat(row: { jenis: 'penjualan' | 'biaya'; keterangan: string; jumlah: number; metode: 'tunai' | 'qris' | null }, productId?: string) {
    if (!sesi) {
      const mockTx: Tx = {
        id: crypto.randomUUID(),
        jenis: row.jenis,
        keterangan: row.keterangan,
        jumlah: row.jumlah,
        metode: row.metode,
        qty: 1,
        created_at: new Date().toISOString(),
      };
      setTxs((prev) => [mockTx, ...prev]);
      kaChing();
      info(`✅ ${row.keterangan} (${rupiah(row.jumlah)}) tercatat`);
      return;
    }
    setErr('');
    if (row.jenis === 'penjualan' && productId) {
      const { data, error } = await supabase.rpc('record_inventory_sale', {
        p_session_id: sesi.id,
        p_product_id: productId,
        p_quantity: 1,
        p_method: row.metode ?? 'tunai',
        p_idempotency_key: crypto.randomUUID(),
      });
      if (error) {
        if (error.message.includes('insufficient_stock')) return setErr('Stok produk tidak mencukupi.');
        return setErr(error.message);
      }
      const transaction = data?.transaction;
      if (!transaction) return setErr('Transaksi berhasil diproses tetapi data transaksi tidak ditemukan.');
      setTxs((t) => (t.some((x) => x.id === transaction.id) ? t : [...t, keTx(transaction)]));
      kaChing();
      info(`✅ ${row.keterangan} tercatat`);
      return;
    }
    const { data, error } = await supabase.from('transactions').insert({ ...row, session_id: sesi.id, qty: 1 }).select('*').single();
    if (error) return setErr(error.message);
    setTxs((t) => (t.some((x) => x.id === data.id) ? t : [...t, keTx(data)]));
    kaChing();
    info(row.jenis === 'penjualan' ? `✅ ${row.keterangan} tercatat` : '✅ Pengeluaran tercatat');
  }

  function pilihProduk(p: Product) {
    if (metode === 'qris') {
      if (invoiceQris) { info('Tutup invoice QRIS yang terbuka sebelum membuat baru.'); return; }
      staticConfirmationKeyRef.current = null;
      setStaticQrisConfirmation(null);
      setKeranjang((current) => ({ ...current, [p.id]: (current[p.id] ?? 0) + 1 }));
      return;
    }
    void catat({ jenis: 'penjualan', keterangan: p.nama, jumlah: p.harga, metode: 'tunai' }, p.id);
  }

  function ubahJumlahKeranjang(productId: string, delta: number) {
    setKeranjang((current) => {
      const next = { ...current };
      const value = (next[productId] ?? 0) + delta;
      if (value <= 0) delete next[productId]; else next[productId] = value;
      return next;
    });
  }

  // Ringkasan memakai catatan aktual. Tidak ada angka contoh yang ditampilkan sebagai data usaha.
  const modalHarian = sesi?.modal_harian ?? 0;
  const liveSummary = summarize(modalHarian, txs);
  const untungBersih = liveSummary.labaBersih;
  const totalMasuk = liveSummary.pendapatan;
  const totalKeluar = liveSummary.beban;
  const sisaModal = modalHarian > 0
    ? Math.max(0, modalHarian - (totalMasuk - totalKeluar))
    : 0;
  const persenBalik = modalHarian > 0
    ? Math.min(100, Math.max(0, Math.round(((modalHarian - sisaModal) / modalHarian) * 100)))
    : 0;

  // Progres misi dihitung dari transaksi yang benar-benar tercatat hari ini.
  const missionProgress = Math.min(3, txs.length);

  // Check low stock
  const lowStockItem = products.find((p) => typeof (p as any).stok === 'number' && (p as any).stok <= ((p as any).stok_minimum || 5));

  function gantiSuara() {
    const on = !suara;
    setSuara(on);
    setSoundOn(on);
    unlockSound();
    if (on) kaChing();
  }

  if (!ready) {
    return (
      <div className="wrap">
        <div className="header-app">
          <p className="text-sm font-bold text-[#307B8E]">Memuat CAVA…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="wrap">
      {/* 1. Header (Greeting + Name + Bell Icon) */}
      <header className="flex items-center justify-between gap-3 pt-5 pb-2">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white p-2 shadow-sm ring-1 ring-[#307B8E]/10">
            <CavaVMark size={30} />
          </div>
          <div className="min-w-0">
            <CavaLogo variant="horizontal" height={20} />
            <p className="mt-1 text-[11px] font-semibold text-[#307B8E]">{salamWaktu()},</p>
            <h1 className="truncate text-lg font-black tracking-tight text-[#103A57]">{namaUsaha}</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={gantiSuara}
            className="grid h-10 w-10 place-items-center rounded-full bg-white text-[#103A57] shadow-sm border border-[#307B8E]/15 hover:bg-slate-50 transition"
            aria-label="Toggle sound"
          >
            {suara ? <Volume2 size={18} className="text-[#103A57]" /> : <VolumeX size={18} className="text-slate-400" />}
          </button>
          <button
            type="button"
            onClick={() => setShowNotifModal(true)}
            className="relative grid h-10 w-10 place-items-center rounded-full bg-white text-[#103A57] shadow-sm border border-[#307B8E]/15 hover:bg-slate-50 transition"
            aria-label="Notifikasi"
          >
            <Bell size={18} />
            <span className="absolute top-2 right-2.5 h-2 w-2 rounded-full bg-[#307B8E]" />
          </button>
        </div>
      </header>

      {err && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-xs font-bold text-[#991B1B]">
          {err}
        </div>
      )}

      {/* 2. Hero Card (Prussian Blue #103A57) - Exact design from Beranda_5bca6021.pdf */}
      <Rise delay={0.02}>
        <section className="relative overflow-hidden rounded-[28px] bg-[#103A57] p-5 text-white shadow-xl shadow-[#103A57]/20 border border-white/10">
          {/* Subtle curved background overlay */}
          <div className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-[#307B8E]/25 blur-2xl" />

          {/* Title & Privacy Eye Toggle */}
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold tracking-widest text-[#A9D3C5] uppercase">
              UNTUNG BERSIH HARI INI
            </span>
            <button
              type="button"
              onClick={() => setSembunyikanNominal(!sembunyikanNominal)}
              className="text-[#A9D3C5] hover:text-white transition p-1"
              aria-label={sembunyikanNominal ? 'Tampilkan saldo' : 'Sembunyikan saldo'}
            >
              {sembunyikanNominal ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* Big Profit Amount */}
          <div className="mt-2">
            <span className="text-3xl sm:text-4xl font-black tabular-nums tracking-tight text-white">
              {sembunyikanNominal ? 'Rp •••••••' : rupiah(untungBersih)}
            </span>
          </div>

          {/* Progress Bar & Subtext */}
          <div className="mt-3">
            <div className="h-2 w-full rounded-full bg-white/15 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${persenBalik}%` }}
                transition={{ duration: 0.9, ease: 'easeOut' }}
                className="h-full rounded-full bg-[#A9D3C5]"
              />
            </div>
            <p className="mt-2 text-xs font-bold text-white/90">
              {modalHarian > 0
                ? `${persenBalik}% balik modal · kurang ${rupiah(sisaModal)}`
                : 'Isi modal harian untuk mulai menghitung progres balik modal.'}
            </p>
          </div>

          {/* 3 Metric Columns: MASUK, KELUAR, MODAL */}
          <div className="mt-4 grid grid-cols-3 gap-2 pt-3 border-t border-white/10">
            <div className="rounded-xl bg-white/[0.07] p-2.5 text-left">
              <p className="text-xs font-black tabular-nums text-white">
                {sembunyikanNominal ? 'Rp •••' : rupiah(totalMasuk)}
              </p>
              <span className="text-[10px] font-extrabold tracking-wider text-[#A9D3C5] uppercase">MASUK</span>
            </div>
            <div className="rounded-xl bg-white/[0.07] p-2.5 text-left">
              <p className="text-xs font-black tabular-nums text-white">
                {sembunyikanNominal ? 'Rp •••' : rupiah(totalKeluar)}
              </p>
              <span className="text-[10px] font-extrabold tracking-wider text-[#A9D3C5] uppercase">KELUAR</span>
            </div>
            <div className="rounded-xl bg-white/[0.07] p-2.5 text-left">
              <p className="text-xs font-black tabular-nums text-white">
                {sembunyikanNominal ? 'Rp •••' : rupiah(modalHarian)}
              </p>
              <span className="text-[10px] font-extrabold tracking-wider text-[#A9D3C5] uppercase">MODAL</span>
            </div>
          </div>
        </section>
      </Rise>

      {/* 3. Aksi Cepat (5 round quick action buttons in Pastel Blue #A9D3C5) */}
      <Rise delay={0.05}>
        <section className="rounded-3xl bg-white p-4 shadow-sm border border-[#307B8E]/10">
          <div className="flex items-center justify-between mb-3 px-1">
            <h2 className="text-sm font-black text-[#103A57]">Aksi Cepat</h2>
            <Link href="/lainnya" className="text-xs font-bold text-[#307B8E] hover:underline">
              Lihat Semua
            </Link>
          </div>

          <div className="grid grid-cols-5 gap-2 text-center">
            {/* 1. Jual */}
            <button
              type="button"
              onClick={() => setShowCatatModal(true)}
              className="flex flex-col items-center gap-1.5 group"
            >
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#A9D3C5] text-[#103A57] font-black group-hover:scale-105 transition shadow-sm">
                <Plus size={20} strokeWidth={2.5} />
              </span>
              <span className="text-[11px] font-bold text-[#103A57]">Jual</span>
            </button>

            {/* 2. Keluar */}
            <button
              type="button"
              onClick={() => setShowCatatModal(true)}
              className="flex flex-col items-center gap-1.5 group"
            >
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#A9D3C5] text-[#103A57] font-black group-hover:scale-105 transition shadow-sm">
                <Minus size={20} strokeWidth={2.5} />
              </span>
              <span className="text-[11px] font-bold text-[#103A57]">Keluar</span>
            </button>

            {/* 3. QRIS */}
            <button
              type="button"
              onClick={() => setShowQrisPreview(true)}
              className="flex flex-col items-center gap-1.5 group"
            >
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#A9D3C5] text-[#103A57] group-hover:scale-105 transition shadow-sm">
                <QrCode size={19} strokeWidth={2.2} />
              </span>
              <span className="text-[11px] font-bold text-[#103A57]">QRIS</span>
            </button>

            {/* 4. Stok */}
            <Link href="/inventaris" className="flex flex-col items-center gap-1.5 group">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#A9D3C5] text-[#103A57] group-hover:scale-105 transition shadow-sm">
                <Package size={19} strokeWidth={2.2} />
              </span>
              <span className="text-[11px] font-bold text-[#103A57]">Stok</span>
            </Link>

            {/* 5. Harga */}
            <Link href="/harga" className="flex flex-col items-center gap-1.5 group">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#A9D3C5] text-[#103A57] group-hover:scale-105 transition shadow-sm">
                <TrendingUp size={19} strokeWidth={2.2} />
              </span>
              <span className="text-[11px] font-bold text-[#103A57]">Harga</span>
            </Link>
          </div>
        </section>
      </Rise>

      {/* Responsive Grid for Alerts & Missions on larger screens */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 4. Pengingat Usaha (Business Alerts) */}
        <Rise delay={0.08} className="h-full">
          <section className="rounded-3xl bg-white p-4 shadow-sm border border-[#307B8E]/10 space-y-3 h-full">
            <h2 className="text-sm font-black text-[#103A57]">Pengingat Usaha</h2>

            {/* Alert 1: Low stock alert */}
            <div className="flex items-start gap-3 rounded-2xl bg-[#CEE5D6]/35 p-3.5 border border-[#307B8E]/15">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-amber-100 text-amber-800">
                <AlertTriangle size={18} />
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="text-xs font-black text-[#103A57]">
                  {lowStockItem
                    ? `Stok ${lowStockItem.nama} tinggal ${(lowStockItem as any).stok} ${(lowStockItem as any).satuan || 'item'}`
                    : products.length > 0 ? 'Tidak ada stok kritis' : 'Data stok belum tersedia'}
                </h3>
                <p className="mt-0.5 text-[11px] font-semibold text-[#307B8E]">
                  {lowStockItem
                    ? 'Periksa persediaan dan rencanakan pengisian ulang.'
                    : products.length > 0 ? 'Persediaan berada di atas batas minimum.' : 'Tambahkan produk melalui menu Inventaris.'}
                </p>
              </div>
            </div>

            {/* Alert 2: Balik modal */}
            <div className="flex items-start gap-3 rounded-2xl bg-[#CEE5D6]/35 p-3.5 border border-[#307B8E]/15">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#A9D3C5] text-[#103A57]">
                <Clock size={18} />
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="text-xs font-black text-[#103A57]">
                  {modalHarian > 0 ? `Balik modal tinggal ${rupiah(sisaModal)}` : 'Sesi harian belum dimulai'}
                </h3>
                <p className="mt-0.5 text-[11px] font-semibold text-[#307B8E]">
                  {modalHarian > 0 ? 'Pantau perubahan berdasarkan transaksi hari ini.' : 'Mulai sesi harian untuk menetapkan modal usaha.'}
                </p>
              </div>
            </div>
          </section>
        </Rise>

        {/* 5. Misi Hari Ini (Teal Blue Card #307B8E) */}
        <Rise delay={0.1} className="h-full">
          <section className="rounded-3xl bg-[#307B8E] p-5 text-white shadow-md border border-white/20 h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-black tracking-wide">
                  Misi hari ini: catat 3 transaksi
                </span>
                <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-[11px] font-black">
                  {missionProgress}/3
                </span>
              </div>
              <p className="text-[11px] text-white/80 mt-1">
                Tercatat {missionProgress} dari 3 target transaksi harian untuk mempertahankan skor kelayakan kredit Anda.
              </p>
            </div>
            <div className="mt-4">
              <div className="h-2.5 w-full rounded-full bg-black/20 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(missionProgress / 3) * 100}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className="h-full rounded-full bg-[#A9D3C5]"
                />
              </div>
            </div>
          </section>
        </Rise>
      </div>

      {/* 6. Katalog POS & Keranjang Kasir (Expandable / Direct Access) */}
      <Rise delay={0.12}>
        <section className="rounded-3xl bg-white p-4 shadow-sm border border-[#307B8E]/10">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-black text-[#103A57]">Katalog Kasir</h2>
              <p className="text-[11px] font-semibold text-[#307B8E]">Pilih produk untuk dicatat langsung</p>
            </div>
            <button
              type="button"
              onClick={() => setShowCatalog(!showCatalog)}
              className="text-xs font-extrabold text-[#307B8E] hover:underline"
            >
              {showCatalog ? 'Sembunyikan' : 'Buka Kasir'}
            </button>
          </div>

          {showCatalog && (
            <div className="pt-3 space-y-3">
              {/* Payment toggle */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => { setMetode('tunai'); setKeranjang({}); }}
                  className={`flex-1 rounded-xl py-2 text-xs font-black transition ${
                    metode === 'tunai' ? 'bg-[#103A57] text-white shadow-sm' : 'bg-slate-100 text-[#103A57]'
                  }`}
                >
                  💵 Tunai
                </button>
                <button
                  type="button"
                  onClick={() => setMetode('qris')}
                  className={`flex-1 rounded-xl py-2 text-xs font-black transition ${
                    metode === 'qris' ? 'bg-[#307B8E] text-white shadow-sm' : 'bg-slate-100 text-[#103A57]'
                  }`}
                >
                  📱 QRIS
                </button>
              </div>

              {/* Product tiles */}
              <div className="grid grid-cols-2 gap-2">
                {products.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => pilihProduk(p)}
                    className="flex flex-col justify-between rounded-2xl bg-[#CEE5D6]/30 p-3 text-left border border-[#307B8E]/15 hover:bg-[#CEE5D6]/50 active:scale-95 transition"
                  >
                    <b className="text-xs font-black text-[#103A57] truncate">{p.nama}</b>
                    <span className="mt-2 text-xs font-extrabold text-[#307B8E] tabular-nums">
                      {rupiah(p.harga)}
                    </span>
                    {metode === 'qris' && keranjang[p.id] && (
                      <span className="mt-1 text-[10px] font-bold text-[#103A57]">
                        Terpilih: {keranjang[p.id]}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Cart Drawer for QRIS */}
              {metode === 'qris' && cartLines.length > 0 && (
                <div className="rounded-2xl bg-[#103A57] p-3.5 text-white">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold">Total Keranjang ({cartLines.length} item)</span>
                    <strong className="text-sm font-black">{rupiah(cartTotal)}</strong>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowQrisPreview(true)}
                    className="mt-2.5 w-full rounded-xl bg-[#A9D3C5] py-2 text-xs font-black text-[#103A57]"
                  >
                    TAMPILKAN QRIS BAYAR
                  </button>
                </div>
              )}
            </div>
          )}
        </section>
      </Rise>

      {/* QRIS Modal Preview */}
      <AnimatePresence>
        {showQrisPreview && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#103A57]/60 backdrop-blur-sm p-4">
            <div className="w-full max-w-sm rounded-3xl bg-white p-5 text-center shadow-2xl border border-slate-100">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-xs font-black text-[#103A57]">QRIS TOKO · CAVA</span>
                <button onClick={() => setShowQrisPreview(false)} className="text-slate-400 hover:text-slate-700">✕</button>
              </div>
              <p className="mt-2 text-xs font-bold text-[#307B8E]">{namaUsaha}</p>
              <img
                src="/qris-contoh.png"
                alt="QRIS toko"
                className="mx-auto my-3 aspect-square w-56 rounded-2xl border border-slate-200 bg-white object-contain p-2 shadow-sm"
              />
              <p className="text-[11px] font-semibold text-slate-500 leading-relaxed">
                Scan via GoPay, BCA, Mandiri, OVO, atau aplikasi mobile banking apa pun. Uang masuk akan langsung terdeteksi otomatis.
              </p>
              <button
                type="button"
                onClick={() => {
                  kaChing();
                  info('✅ Simulasi QRIS berhasil dicatat');
                  setShowQrisPreview(false);
                }}
                className="mt-3 w-full rounded-xl bg-[#103A57] py-2.5 text-xs font-black text-white"
              >
                TUTUP
              </button>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Notification Toast */}
      {toast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-[#103A57] text-white px-4 py-2.5 rounded-2xl text-xs font-extrabold shadow-xl z-50 border border-white/20">
          {toast}
        </div>
      )}

      {/* Real-time QRIS incoming toast */}
      <AnimatePresence>
        {qris && (
          <motion.div
            key={qris.key}
            initial={{ y: -90, x: '-50%', opacity: 0 }}
            animate={{ y: 0, x: '-50%', opacity: 1 }}
            exit={{ y: -90, x: '-50%', opacity: 0 }}
            className="fixed top-5 left-1/2 -translate-x-1/2 z-[110] w-[90%] max-w-sm rounded-2xl bg-[#103A57] text-white p-4 shadow-2xl border border-[#A9D3C5]/40 flex items-center gap-3"
          >
            <span className="text-2xl">🔔</span>
            <div>
              <p className="text-[10px] font-bold text-[#A9D3C5] uppercase tracking-wider">UANG MASUK QRIS</p>
              <p className="text-lg font-black tabular-nums">{rupiah(qris.jumlah)}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick Record Bottom Sheet Modal */}
      <QuickRecordModal
        isOpen={showCatatModal}
        onClose={() => setShowCatatModal(false)}
        onSuccess={() => load()}
      />

      <BottomNav />
    </div>
  );
}
