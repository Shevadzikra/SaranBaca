import type { Metadata } from "next";
import { SITE_NAME } from "@/lib/seo";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export const metadata: Metadata = {
  title: `Syarat dan Ketentuan (Terms of Service)`,
  description: `Syarat dan ketentuan penggunaan situs web ${SITE_NAME}.`,
};

export default function TermsOfServicePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:py-16">
      <div className="prose prose-lg prose-emerald max-w-none">
        <nav className="flex items-center gap-2 text-sm text-gray-400 py-6 overflow-x-auto">
          <Link href="/" className="hover:text-emerald-600 transition-colors shrink-0">
            Beranda
          </Link>
          <ChevronRight className="w-3.5 h-3.5 shrink-0" />
          <p>
            Terms of Service
          </p>
        </nav>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">Syarat dan Ketentuan (Terms of Service)</h1>
        
        <p className="text-md font-bold text-gray-700 mb-12">Terakhir diperbarui: 13 Juni 2026</p>

        <p className="mb-12">
          Selamat datang di <strong>{SITE_NAME}</strong>. Dengan mengakses dan menggunakan situs web ini, Anda menerima dan menyetujui untuk terikat oleh syarat dan ketentuan penggunaan berikut. Jika Anda tidak setuju dengan bagian mana pun dari syarat dan ketentuan ini, harap jangan gunakan situs web kami.
        </p>

        <h2 className="text-2xl text-gray-900 mb-4 font-bold">1. Penggunaan Konten</h2>
        <p className="mb-12">
          Konten yang disediakan di {SITE_NAME} adalah untuk informasi umum dan penggunaan pribadi Anda saja. Konten ini dapat berubah sewaktu-waktu tanpa pemberitahuan sebelumnya. Kami tidak memberikan jaminan atau garansi terkait keakuratan, ketepatan waktu, kinerja, kelengkapan, atau kesesuaian informasi dan materi yang ditemukan atau ditawarkan di situs web ini.
        </p>

        <h2 className="text-2xl text-gray-900 mb-4 font-bold">2. Hak Cipta dan Kekayaan Intelektual</h2>
        <p className="mb-12">
          Situs web ini berisi materi yang dimiliki oleh atau dilisensikan kepada kami. Materi ini termasuk, namun tidak terbatas pada, desain, tata letak, tampilan, grafik, dan artikel teks. Reproduksi dalam bentuk apa pun dilarang selain sesuai dengan pemberitahuan hak cipta, yang merupakan bagian dari syarat dan ketentuan ini.
        </p>

        <h2 className="text-2xl text-gray-900 mb-4 font-bold">3. Tautan ke Situs Web Lain</h2>
        <p className="mb-12">
          Dari waktu ke waktu, situs web ini mungkin juga menyertakan tautan ke situs web lain. Tautan ini disediakan demi kenyamanan Anda untuk memberikan informasi lebih lanjut. Hal ini tidak berarti bahwa kami mendukung situs web tersebut. Kami tidak bertanggung jawab atas konten dari situs web yang ditautkan.
        </p>

        <h2 className="text-2xl text-gray-900 mb-4 font-bold">4. Penggunaan yang Dilarang</h2>
        <p className="mb-12">
          Anda dilarang menggunakan situs web ini dengan cara yang menyebabkan, atau dapat menyebabkan, kerusakan pada situs web atau penurunan ketersediaan maupun aksesibilitas situs web; atau dengan cara apa pun yang melanggar hukum, ilegal, menipu, atau berbahaya, atau sehubungan dengan tujuan atau aktivitas apa pun yang melanggar hukum, ilegal, menipu, atau berbahaya.
        </p>

        <h2 className="text-2xl text-gray-900 mb-4 font-bold">5. Perubahan Syarat dan Ketentuan</h2>
        <p className="mb-12">
          {SITE_NAME} berhak merevisi syarat dan ketentuan ini sewaktu-waktu. Dengan menggunakan situs web ini, Anda diharapkan untuk meninjau syarat dan ketentuan ini secara berkala untuk memastikan Anda memahami semua syarat dan ketentuan yang mengatur penggunaan situs web ini.
        </p>

        <p>
          Jika Anda memiliki pertanyaan tentang Syarat dan Ketentuan ini, silakan hubungi kami melalui halaman <a href="/contact">Hubungi Kami</a>.
        </p>
      </div>
    </div>
  );
}
