import type { Metadata } from "next";
import { SITE_NAME, SITE_DESCRIPTION } from "@/lib/seo";
import { 
  Target, 
  Lightbulb, 
  ShieldCheck, 
  BookOpen, 
  Award, 
  Users, 
  Sparkles,
  ArrowRight
} from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: `Tentang Kami — ${SITE_NAME}`,
  description: `Pelajari lebih lanjut tentang misi, visi, dan tim di balik ${SITE_NAME}.`,
};

export default function AboutPage() {
  return (
    <div className="relative min-h-screen bg-white overflow-hidden pb-12">
      {/* Background Decor */}
      <div className="absolute top-0 inset-x-0 h-[500px] bg-gradient-to-b from-emerald-50/50 to-transparent pointer-events-none" />
      <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 pointer-events-none">
        <div className="w-[300px] h-[300px] md:w-[600px] md:h-[600px] rounded-full bg-emerald-100/40 blur-3xl" />
      </div>
      <div className="absolute top-40 left-0 -translate-x-1/3 pointer-events-none">
        <div className="w-[250px] h-[250px] md:w-[500px] md:h-[500px] rounded-full bg-teal-50/60 blur-3xl" />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-10">
        
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-24">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 text-emerald-600 text-sm font-semibold mb-6 shadow-sm border border-emerald-100/50">
            <Sparkles className="w-4 h-4" />
            Mengenal Lebih Dekat
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 tracking-tight mb-8">
            Menghadirkan Wawasan <br />
            <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
              Berkualitas & Terpercaya
            </span>
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed">
            Selamat datang di <strong>{SITE_NAME}</strong>. {SITE_DESCRIPTION} Kami hadir untuk menjawab kebutuhan informasi Anda di tengah derasnya arus digital.
          </p>
        </div>

        {/* Visi & Misi Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-24">
          {/* Visi */}
          <div className="group relative bg-white p-8 md:p-10 rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/20 hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-500 overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity duration-500">
              <Lightbulb className="w-32 h-32 text-emerald-600" />
            </div>
            <div className="relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-100 to-emerald-50 flex items-center justify-center text-emerald-600 mb-6 group-hover:scale-110 transition-transform duration-500">
                <Lightbulb className="w-7 h-7" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Visi Kami</h2>
              <p className="text-gray-600 text-lg leading-relaxed">
                Menjadi platform literasi digital dan sumber wawasan terdepan di Indonesia yang menginspirasi, mendidik, serta mendukung pertumbuhan intelektual masyarakat secara berkelanjutan.
              </p>
            </div>
          </div>

          {/* Misi */}
          <div className="group relative bg-white p-8 md:p-10 rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/20 hover:shadow-2xl hover:shadow-teal-500/10 transition-all duration-500 overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity duration-500">
              <Target className="w-32 h-32 text-teal-600" />
            </div>
            <div className="relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-100 to-teal-50 flex items-center justify-center text-teal-600 mb-6 group-hover:scale-110 transition-transform duration-500">
                <Target className="w-7 h-7" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Misi Kami</h2>
              <p className="text-gray-600 text-lg leading-relaxed">
                Menyajikan informasi yang akurat, relevan, dan mendalam. Kami berkomitmen untuk melawan misinformasi dengan menyaring setiap fakta dan menyampaikan konten edukatif yang mudah dicerna.
              </p>
            </div>
          </div>
        </div>

        {/* E-E-A-T Section */}
        <div className="mb-24">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Standar Kualitas Kami</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Setiap artikel yang kami terbitkan dikurasi secara ketat berdasarkan prinsip inti Google: <strong>E-E-A-T</strong>.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: "Experience",
                desc: "Konten ditulis berdasarkan pengalaman nyata dan observasi langsung di lapangan.",
                icon: Users,
                color: "text-blue-600",
                bg: "bg-blue-50"
              },
              {
                title: "Expertise",
                desc: "Ditulis oleh individu yang memiliki keahlian dan pengetahuan mendalam di bidangnya.",
                icon: Award,
                color: "text-emerald-600",
                bg: "bg-emerald-50"
              },
              {
                title: "Authoritativeness",
                desc: "Kami membangun otoritas dengan menyajikan referensi silang dan kutipan ahli terpercaya.",
                icon: BookOpen,
                color: "text-purple-600",
                bg: "bg-purple-50"
              },
              {
                title: "Trustworthiness",
                desc: "Transparansi, akurasi, dan kejujuran adalah harga mati bagi setiap publikasi kami.",
                icon: ShieldCheck,
                color: "text-rose-600",
                bg: "bg-rose-50"
              }
            ].map((item, idx) => (
              <div key={idx} className="bg-white p-6 rounded-2xl border border-gray-100 hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
                <div className={`w-12 h-12 rounded-xl ${item.bg} ${item.color} flex items-center justify-center mb-5`}>
                  <item.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="relative rounded-3xl overflow-hidden bg-gray-900 py-16 px-8 md:px-16 text-center shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/20 to-teal-600/20" />
          
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Mulai Jelajahi Artikel Kami
            </h2>
            <p className="text-gray-300 text-lg mb-8">
              Jadikan {SITE_NAME} sebagai referensi bacaan harian Anda untuk menambah wawasan dan memperbarui pengetahuan.
            </p>
            <Link href="/" className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white px-8 py-4 rounded-full font-semibold transition-colors duration-300">
              Baca Artikel Terbaru <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
