import type { Metadata } from "next";
import { SITE_NAME } from "@/lib/seo";
import { Mail, MapPin, Phone } from "lucide-react";

export const metadata: Metadata = {
  title: `Hubungi Kami — ${SITE_NAME}`,
  description: `Hubungi tim ${SITE_NAME} untuk pertanyaan, kerja sama, atau masukan.`,
};

export default function ContactPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:py-16">
      <div className="prose prose-lg prose-emerald max-w-none mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-4">Hubungi Kami</h1>
        <p>
          Kami selalu terbuka untuk mendengar pertanyaan, saran, maupun peluang kerja sama dari Anda. Jangan ragu untuk menghubungi kami melalui informasi di bawah ini.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Informasi Kontak</h3>
          
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="bg-white p-3 rounded-full shadow-sm text-emerald-600">
                <Mail className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Email</p>
                <a href="mailto:hello@saranbaca.com" className="text-gray-900 font-medium hover:text-emerald-600 transition-colors">
                  hello@saranbaca.com
                </a>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="bg-white p-3 rounded-full shadow-sm text-emerald-600">
                <Phone className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Telepon / WhatsApp</p>
                <p className="text-gray-900 font-medium">+62 812 3456 7890</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="bg-white p-3 rounded-full shadow-sm text-emerald-600">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Alamat</p>
                <p className="text-gray-900 font-medium leading-relaxed">
                  Gedung Inovasi Digital Lt. 4<br />
                  Jl. Teknologi No. 88, Jakarta Selatan<br />
                  Indonesia 12345
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Kirim Pesan</h3>
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
              <input type="text" className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all" placeholder="John Doe" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all" placeholder="john@example.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pesan</label>
              <textarea rows={4} className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all resize-none" placeholder="Bagaimana kami bisa membantu Anda?"></textarea>
            </div>
            <button type="button" className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors">
              Kirim Pesan
            </button>
            <p className="text-xs text-gray-500 text-center mt-2">Ini adalah formulir demonstrasi.</p>
          </form>
        </div>
      </div>
    </div>
  );
}
