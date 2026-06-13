"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { BookOpen, Menu, X } from "lucide-react";
import Image from "next/image";

const navLinks = [
  { label: "Beranda", href: "/" },
  { label: "Kontak", href: "/kontak" },
  { label: "Teknologi", href: "/kategori/teknologi" },
  { label: "Bisnis", href: "/kategori/bisnis" },
  { label: "Gaya Hidup", href: "/kategori/gaya-hidup" },
  { label: "Pendidikan", href: "/kategori/pendidikan" },
  { label: "Kesehatan", href: "/kategori/kesehatan" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
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

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive =
                pathname === link.href ||
                (link.href !== "/" && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "text-emerald-600 bg-emerald-50"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            
            {/* Nav Icon / Button untuk Tentang Kami */}
            <Link
              href="/tentang-kami"
              className="ml-4 px-5 py-2 rounded-full text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition-all duration-200"
            >
              Tentang Kami
            </Link>
          </nav>

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
          >
            {mobileOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <nav className="md:hidden py-3 border-t border-gray-100 space-y-1">
            {navLinks.map((link) => {
              const isActive =
                pathname === link.href ||
                (link.href !== "/" && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "text-emerald-600 bg-emerald-50"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            <div className="pt-2 pb-1 px-4 border-t border-gray-100 mt-2">
              <Link
                href="/tentang-kami"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center w-full px-4 py-2.5 rounded-lg text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 transition-colors"
              >
                Tentang Kami
              </Link>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
