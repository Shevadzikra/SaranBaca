"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Search, X, Clock, Loader2, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";

interface SearchResult {
  slug: string;
  title: string;
  excerpt: string;
  readingTime?: number | null;
  publishedAt?: string | null;
  category?: { name: string; slug: string } | null;
}

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);
  const router = useRouter();

  const fetchResults = useCallback(async (searchQuery: string) => {
    if (searchQuery.trim().length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(
        `/api/search?q=${encodeURIComponent(searchQuery.trim())}`
      );
      const data = await res.json();
      setResults(data.articles || []);
      setIsOpen(true);
    } catch {
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setActiveIndex(-1);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      fetchResults(value);
    }, 300);
  };

  const clearSearch = () => {
    setQuery("");
    setResults([]);
    setIsOpen(false);
    setActiveIndex(-1);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || results.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActiveIndex((prev) =>
          prev < results.length - 1 ? prev + 1 : 0
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setActiveIndex((prev) =>
          prev > 0 ? prev - 1 : results.length - 1
        );
        break;
      case "Enter":
        e.preventDefault();
        if (activeIndex >= 0 && results[activeIndex]) {
          router.push(`/artikel/${results[activeIndex].slug}`);
          setIsOpen(false);
        }
        break;
      case "Escape":
        setIsOpen(false);
        setActiveIndex(-1);
        break;
    }
  };

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
        setActiveIndex(-1);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Scroll active item into view
  useEffect(() => {
    if (activeIndex >= 0) {
      const el = document.getElementById(`search-result-${activeIndex}`);
      el?.scrollIntoView({ block: "nearest" });
    }
  }, [activeIndex]);

  const highlightMatch = (text: string, keyword: string) => {
    if (!keyword.trim()) return text;
    const regex = new RegExp(
      `(${keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
      "gi"
    );
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark
          key={i}
          className="bg-emerald-100 text-emerald-800 rounded px-0.5"
        >
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-2xl mx-auto mt-8">
      {/* Search Input */}
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-2xl blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
        <div className="relative flex items-center">
          <div className="absolute left-4 text-gray-400 group-focus-within:text-emerald-500 transition-colors duration-300">
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Search className="w-5 h-5" />
            )}
          </div>
          <input
            ref={inputRef}
            id="home-search-bar"
            type="text"
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              if (results.length > 0) setIsOpen(true);
            }}
            placeholder="Cari artikel, topik, atau kata kunci..."
            className="w-full pl-12 pr-12 py-4 rounded-2xl border border-gray-200 bg-white/80 backdrop-blur-sm text-gray-900 placeholder:text-gray-400 text-base outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-300 shadow-sm hover:shadow-md focus:shadow-lg"
            autoComplete="off"
            aria-label="Cari artikel"
            aria-expanded={isOpen}
            aria-haspopup="listbox"
            aria-controls="search-results-list"
            aria-activedescendant={
              activeIndex >= 0 ? `search-result-${activeIndex}` : undefined
            }
          />
          {query && (
            <button
              onClick={clearSearch}
              className="absolute right-4 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
              aria-label="Hapus pencarian"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Results Dropdown */}
      {isOpen && (
        <div
          id="search-results-list"
          role="listbox"
          className="absolute z-50 top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-gray-100 shadow-2xl shadow-gray-200/50 overflow-hidden animate-fade-in-up"
          style={{ animationDuration: "0.2s" }}
        >
          {results.length > 0 ? (
            <div className="max-h-[420px] overflow-y-auto overscroll-contain">
              <div className="px-4 py-2.5 text-xs font-medium text-gray-400 uppercase tracking-wider border-b border-gray-50">
                {results.length} hasil ditemukan
              </div>
              {results.map((article, index) => (
                <Link
                  key={article.slug}
                  id={`search-result-${index}`}
                  href={`/artikel/${article.slug}`}
                  role="option"
                  aria-selected={activeIndex === index}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-start gap-3.5 px-4 py-3.5 transition-colors duration-150 border-b border-gray-50 last:border-0 ${
                    activeIndex === index
                      ? "bg-emerald-50"
                      : "hover:bg-gray-50"
                  }`}
                >

                  {/* Content */}
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 line-clamp-1 group-hover:text-emerald-700">
                      {highlightMatch(article.title, query)}
                    </p>
                    <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">
                      {highlightMatch(article.excerpt, query)}
                    </p>
                    <div className="flex items-center gap-3 mt-1.5 text-[11px] text-gray-400">
                      {article.category && (
                        <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-600 font-medium">
                          {article.category.name}
                        </span>
                      )}
                      {article.publishedAt && (
                        <span>
                          {format(
                            new Date(article.publishedAt),
                            "dd MMM yyyy",
                            { locale: localeId }
                          )}
                        </span>
                      )}
                      {article.readingTime && (
                        <span className="flex items-center gap-0.5">
                          <Clock className="w-3 h-3" />
                          {article.readingTime} menit
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Arrow */}
                  <div className="shrink-0 self-center text-gray-300">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="px-6 py-10 text-center">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                <Search className="w-5 h-5 text-gray-400" />
              </div>
              <p className="text-sm text-gray-500 font-medium">
                Tidak ada artikel ditemukan
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Coba kata kunci lain atau periksa ejaan
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
