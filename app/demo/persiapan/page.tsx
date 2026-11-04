import Link from 'next/link';
import { ArrowLeft, CheckCircle2, Database, ShieldCheck } from 'lucide-react';
import DemoStartButton from '@/components/demo/DemoStartButton';
import type { Metadata } from 'next';

type SearchParams = Promise<{ jenis?: string; mode?: string }>;

const JENIS: Record<string, { nama: string; deskripsi: string; fokus: string }> = {
  retail: {
    nama: 'Retail / Perdagangan',
    deskripsi: 'Contoh usaha warung, toko sembako, atau toko pakaian.',
    fokus: 'Kasir, pembelian barang, persediaan, dan harga pokok penjualan.',
  },
  manufaktur: {
    nama: 'Manufaktur / Produksi',
    deskripsi: 'Contoh usaha yang mengolah bahan baku menjadi barang jadi.',
    fokus: 'Bahan baku, proses produksi, biaya produksi, dan persediaan barang jadi.',
  },
  jasa: {
    nama: 'Jasa',
    deskripsi: 'Contoh barbershop, laundry, bengkel, atau jasa desain.',
    fokus: 'Pesanan layanan, pendapatan jasa, dan biaya operasional.',
  },
  campuran: {
    nama: 'Usaha Campuran',
    deskripsi: 'Contoh kedai kopi atau bakery yang memproduksi dan menjual barang dagangan.',
    fokus: 'Penjualan, persediaan, produksi, dan biaya sesuai aktivitas usaha.',
  },
};

export const metadata: Metadata = {
  title: 'Persiapan Interactive Demo | CAVA',
  description: 'Ringkasan pilihan pengalaman demonstrasi CAVA.',
};

export default async function DemoPreparationPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const jenis = params.jenis ?? '';
  const mode = params.mode === 'guided' ? 'guided' : params.mode === 'eksplorasi' ? 'eksplorasi' : '';
  const usaha = JENIS[jenis];

  if (!usaha || !mode) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#CEE5D6] px-4 py-10">
        <section className="w-full max-w-lg rounded-3xl border border-[#307B8E]/15 bg-white p-7 text-center shadow-sm">
          <h1 className="text-xl font-black text-[#103A57]">Pilihan demo belum lengkap</h1>
          <p className="mt-2 text-sm leading-6 text-[#486577]">Pilih jenis usaha dan cara mencoba terlebih dahulu.</p>
          <Link href="/demo" className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#103A57] px-5 py-3 text-sm font-extrabold text-white"><ArrowLeft size={16} /> Kembali memilih</Link>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#CEE5D6] px-4 py-8 text-[#103A57] sm:px-6">
      <div className="mx-auto max-w-2xl">
        <Link href="/demo" className="inline-flex items-center gap-2 text-sm font-bold text-[#486577] hover:text-[#307B8E]"><ArrowLeft size={16} /> Ubah pilihan demo</Link>
        <section className="mt-5 overflow-hidden rounded-3xl border border-[#307B8E]/15 bg-white shadow-sm">
          <div className="bg-gradient-to-br from-[#103A57] to-[#307B8E] px-6 py-7 text-white sm:px-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[11px] font-extrabold tracking-wide text-[#CEE5D6]">DEMO MODE · TAHAP PERSIAPAN</div>
            <h1 className="mt-4 text-2xl font-black tracking-tight sm:text-3xl">Pilihan demonstrasimu sudah siap.</h1>
            <p className="mt-2 text-sm leading-6 text-white/85">Berikut konfigurasi pengalaman yang kamu pilih untuk usaha Anda.</p>
          </div>
          <div className="grid gap-5 p-6 sm:p-8">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-[#CEE5D6] p-4">
                <p className="text-[11px] font-extrabold uppercase tracking-wider text-[#486577]/65">Jenis usaha</p>
                <h2 className="mt-2 text-base font-black text-[#103A57]">{usaha.nama}</h2>
                <p className="mt-1 text-xs leading-5 text-[#486577]">{usaha.deskripsi}</p>
              </div>
              <div className="rounded-2xl bg-[#CEE5D6] p-4">
                <p className="text-[11px] font-extrabold uppercase tracking-wider text-[#486577]/65">Cara mencoba</p>
                <h2 className="mt-2 text-base font-black text-[#103A57]">{mode === 'guided' ? 'Guided Demo' : 'Eksplorasi Bebas'}</h2>
                <p className="mt-1 text-xs leading-5 text-[#486577]">{mode === 'guided' ? 'Mengikuti misi dari aktivitas usaha sampai laporan.' : 'Menjelajahi fitur tanpa urutan tertentu.'}</p>
              </div>
            </div>

            <div className="rounded-2xl border border-[#307B8E]/15 bg-[#CEE5D6]/50 p-4">
              <div className="flex items-center gap-2 text-sm font-extrabold text-[#103A57]"><CheckCircle2 size={18} /> Fokus demonstrasi</div>
              <p className="mt-2 text-sm leading-6 text-[#486577]">{usaha.fokus}</p>
            </div>

            <div className="rounded-2xl border border-[#307B8E]/20 bg-[#CEE5D6]/45 p-4">
              <div className="flex items-center gap-2 text-sm font-extrabold text-[#103A57]"><CheckCircle2 size={18} /> Ruang demo pribadi</div>
              <p className="mt-2 text-xs leading-5 text-[#486577]">Sistem akan membuat sesi terpisah untuk browser ini, mengisi contoh produk sesuai jenis usaha, dan menghapus sesi beserta data demonstrasinya ketika diakhiri atau di-reset.</p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="flex items-start gap-3 rounded-xl border border-[#307B8E]/15 p-3">
                <ShieldCheck size={19} className="mt-0.5 shrink-0 text-[#307B8E]" />
                <div><p className="text-xs font-extrabold text-[#103A57]">Terpisah dari akun asli</p><p className="mt-1 text-[11px] leading-5 text-[#486577]">Data demonstrasi dirancang agar tidak bercampur dengan transaksi UMKM sungguhan.</p></div>
              </div>
              <div className="flex items-start gap-3 rounded-xl border border-[#307B8E]/15 p-3">
                <Database size={19} className="mt-0.5 shrink-0 text-[#307B8E]" />
                <div><p className="text-xs font-extrabold text-[#103A57]">Tanpa uang sungguhan</p><p className="mt-1 text-[11px] leading-5 text-[#486577]">Pembayaran demo nantinya menggunakan simulasi, bukan transfer atau pembayaran nyata.</p></div>
              </div>
            </div>

            <DemoStartButton businessType={jenis as 'retail' | 'manufaktur' | 'jasa' | 'campuran'} mode={mode as 'eksplorasi' | 'guided'} />
            <Link href="/demo" className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#307B8E]/15 px-5 py-3 text-sm font-extrabold text-[#486577] transition hover:bg-[#CEE5D6]">Kembali ke pilihan demo <ArrowLeft size={16} /></Link>
          </div>
        </section>
      </div>
    </main>
  );
}
