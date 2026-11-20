'use client';

import React, { useState, useEffect } from 'react';
import { Quote as QuoteIcon, Sparkles, Copy, Share2 } from 'lucide-react';
import { useToast } from '@/components/Toast';

export default function QuotesPage() {
  const { toast } = useToast();
  const [quotes, setQuotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Friendship', 'Dreams', 'Life', 'School', 'Graduation', 'Funny Quotes'];

  useEffect(() => {
    loadQuotes();
  }, [selectedCategory]);

  const loadQuotes = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (selectedCategory && selectedCategory !== 'All') {
      params.set('category', selectedCategory);
    }

    fetch(`/api/quotes?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.quotes) setQuotes(data.quotes);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  const copyQuote = (text: string, author: string) => {
    navigator.clipboard.writeText(`“${text}” — ${author} (SMPN 1 Rajapolah 2027)`);
    toast('Quote berhasil disalin!', 'success');
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-14">
        <div className="inline-flex items-center space-x-2 text-gold-dark text-xs font-bold uppercase tracking-widest mb-3">
          <QuoteIcon className="w-4 h-4" />
          <span>Kumpulan Kutipan Terbaik Siswa</span>
        </div>
        <h1 className="font-serif text-4xl sm:text-5xl font-bold text-navy-950 mb-4">
          Quote Wall Angkatan 2027
        </h1>
        <p className="text-sm sm:text-base text-charcoal font-light leading-relaxed">
          Kutipan favorit, renungan bermakna, dan canda tawa yang dituliskan oleh siswa kelas IX SMPN 1 Rajapolah sebagai kenang-kenangan.
        </p>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center justify-center flex-wrap gap-2 mb-12">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setSelectedCategory(c)}
            className={`px-4 py-2 rounded-full text-xs font-semibold transition ${
              selectedCategory === c
                ? 'bg-navy text-gold shadow-md'
                : 'bg-white text-charcoal hover:bg-navy-50 border border-gray-200'
            }`}
          >
            {c === 'All' ? 'Semua Kategori' : c}
          </button>
        ))}
      </div>

      {/* Quotes Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-44 rounded-3xl bg-gray-200 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quotes.map((q) => (
            <div
              key={q.id}
              className="p-8 rounded-3xl bg-white border border-navy-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between relative group"
            >
              <div className="flex items-center justify-between mb-4">
                <QuoteIcon className="w-8 h-8 text-gold/40 group-hover:text-gold transition-colors" />
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-cream-200 text-navy-950">
                  {q.category}
                </span>
              </div>

              <p className="font-serif italic text-base sm:text-lg text-navy-950 leading-relaxed mb-6">
                “{q.quoteText}”
              </p>

              <div className="pt-4 border-t border-cream-200 flex items-center justify-between text-xs">
                <div>
                  <h4 className="font-semibold text-navy">{q.authorName}</h4>
                  {q.authorClass && (
                    <span className="text-dusty-blue text-[11px]">Kelas {q.authorClass}</span>
                  )}
                </div>

                <button
                  onClick={() => copyQuote(q.quoteText, q.authorName)}
                  className="p-2 rounded-full hover:bg-navy-50 text-gray-400 hover:text-navy transition"
                  title="Salin Quote"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
