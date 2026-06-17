import type { Metadata } from "next";
import { SITE_NAME } from "@/lib/seo";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export const metadata: Metadata = {
  title: `Kebijakan Privasi (Privacy Policy)`,
  description: `Kebijakan privasi dan perlindungan data pengunjung di ${SITE_NAME}.`,
};

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:py-16">
      <div className="prose prose-lg prose-emerald max-w-none">
        <nav className="flex items-center gap-2 text-sm text-gray-400 py-6 overflow-x-auto">
          <Link href="/" className="hover:text-emerald-600 transition-colors shrink-0">
            Beranda
          </Link>
          <ChevronRight className="w-3.5 h-3.5 shrink-0" />
          <p>
            Privacy Policy
          </p>
        </nav>
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 mb-2">Kebijakan Privasi (Privacy Policy)</h1>

        <p className="text-md font-bold text-gray-700 mb-12">Terakhir diperbarui: 13 Juni 2026</p>

        <p className="mb-12">
          Privasi pengunjung kami di <strong>{SITE_NAME}</strong> adalah hal yang sangat penting bagi kami. Dokumen kebijakan privasi ini menguraikan jenis informasi pribadi yang diterima dan dikumpulkan oleh {SITE_NAME} serta bagaimana informasi tersebut digunakan.
        </p>

        <h2 className="text-2xl text-gray-900 mb-4 font-bold">1. File Log</h2>
        <p className="mb-12">
          Seperti banyak situs web lain, {SITE_NAME} menggunakan file log. Informasi di dalam file log meliputi alamat protokol internet (IP), jenis browser, Internet Service Provider (ISP), cap tanggal/waktu, halaman rujukan/keluar, dan mungkin jumlah klik. Informasi ini digunakan untuk menganalisis tren, mengelola situs, melacak pergerakan pengguna di sekitar situs, dan mengumpulkan informasi demografis. Alamat IP dan informasi lainnya tersebut tidak terkait dengan informasi apa pun yang dapat diidentifikasi secara pribadi.
        </p>

        <h2 className="text-2xl text-gray-900 mb-4 font-bold">2. Cookies dan Web Beacons</h2>
        <p className="mb-12">
          {SITE_NAME} menggunakan <em>cookies</em> untuk menyimpan informasi tentang preferensi pengunjung, merekam informasi spesifik pengguna di halaman mana situs diakses atau dikunjungi, menyesuaikan konten halaman web berdasarkan jenis browser pengunjung atau informasi lain yang dikirim pengunjung melalui browser mereka.
        </p>

        <h2 className="text-2xl text-gray-900 mb-4 font-bold">3. Google DoubleClick DART Cookie (AdSense)</h2>
        <ul className="mb-12 list-disc">
          <li>Google, sebagai vendor pihak ketiga, menggunakan cookies untuk menayangkan iklan di {SITE_NAME}.</li>
          <li>Penggunaan cookie DART oleh Google memungkinkannya untuk menayangkan iklan kepada pengguna kami berdasarkan kunjungan mereka ke {SITE_NAME} dan situs lainnya di Internet.</li>
          <li>Pengguna dapat memilih keluar dari penggunaan cookie DART dengan mengunjungi <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener noreferrer">kebijakan privasi jaringan iklan dan konten Google</a>.</li>
        </ul>

        <h2 className="text-2xl text-gray-900 mb-4 font-bold">4. Persetujuan</h2>
        <p className="mb-12">
          Dengan menggunakan situs web kami, Anda dengan ini menyetujui kebijakan privasi kami dan menyetujui ketentuan-ketentuannya.
        </p>

        <p>
          Jika Anda memerlukan informasi lebih lanjut atau memiliki pertanyaan tentang kebijakan privasi kami, jangan ragu untuk menghubungi kami melalui halaman <a href="/contact">Hubungi Kami</a>.
        </p>
      </div>
    </div>
  );
}
