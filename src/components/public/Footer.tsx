import Link from "next/link";
import { BookOpen } from "lucide-react";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                {/* Logo (next/image) */}
                <Image
                  src="/logo.svg"
                  alt="SaranBaca"
                  width={24}
                  height={24}
                  className="w-6 h-6"
                />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                SaranBaca
              </span>
            </Link>
            <p className="text-gray-500 text-sm leading-relaxed max-w-md">
              Temukan artikel terbaik dan rekomendasi bacaan berkualitas. 
              SaranBaca menyajikan konten informatif dan inspiratif untuk pembaca Indonesia.
            </p>
          </div>

          {/* Kategori */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
              Kategori
            </h3>
            <ul className="space-y-2.5">
              {["Teknologi", "Bisnis", "Gaya Hidup", "Pendidikan", "Kesehatan"].map((cat) => (
                <li key={cat}>
                  <Link
                    href={`/kategori/${cat.toLowerCase().replace(/\s+/g, "-")}`}
                    className="text-sm text-gray-500 hover:text-emerald-600 transition-colors"
                  >
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
              Lainnya
            </h3>
            <ul className="space-y-2.5">
              <li>
                <Link href="/sitemap.xml" className="text-sm text-gray-500 hover:text-emerald-600 transition-colors">
                  Sitemap
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-400">
            © {new Date().getFullYear()} SaranBaca. Semua hak dilindungi.
          </p>
          <p className="text-sm text-gray-400">
            Dibuat dengan ❤️ untuk pembaca Indonesia
          </p>
        </div>
      </div>
    </footer>
  );
}
