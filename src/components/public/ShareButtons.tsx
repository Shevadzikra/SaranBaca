"use client";

import { MessageSquare, Send, Share2, LinkIcon, Check } from "lucide-react";
import { useState } from "react";

interface ShareButtonsProps {
  url: string;
  title: string;
}

export default function ShareButtons({ url, title }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  function copyLink() {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const buttons = [
    {
      label: "WhatsApp",
      href: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
      icon: MessageSquare,
      color: "bg-green-100 text-green-700 hover:bg-green-200",
    },
    {
      label: "Twitter/X",
      href: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
      icon: Send,
      color: "bg-sky-100 text-sky-700 hover:bg-sky-200",
    },
    {
      label: "Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      icon: Share2,
      color: "bg-blue-100 text-blue-700 hover:bg-blue-200",
    },
  ];

  return (
    <div className="flex flex-wrap items-center gap-2">
      {buttons.map((btn) => (
        <a
          key={btn.label}
          href={btn.href}
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${btn.color}`}
        >
          <btn.icon className="w-4 h-4" />
          {btn.label}
        </a>
      ))}
      <button
        onClick={copyLink}
        className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
          copied
            ? "bg-emerald-100 text-emerald-700"
            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
        }`}
      >
        {copied ? <Check className="w-4 h-4" /> : <LinkIcon className="w-4 h-4" />}
        {copied ? "Tersalin!" : "Copy"}
      </button>
    </div>
  );
}
