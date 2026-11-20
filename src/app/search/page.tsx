'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, Users, School, Camera, MessageSquare, Quote, ArrowRight } from 'lucide-react';
import EmptyState from '@/components/EmptyState';

export default function GlobalSearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{
    students: any[];
    classes: any[];
    memories: any[];
    quotes: any[];
  }>({
    students: [],
    classes: [],
    memories: [],
    quotes: [],
  });
  const [hasSearched, setHasSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setHasSearched(true);

    try {
      const [stuRes, clsRes, memRes, qRes] = await Promise.all([
        fetch(`/api/students?public=true&search=${encodeURIComponent(query)}`).then((r) => r.json()),
        fetch(`/api/classes`).then((r) => r.json()),
        fetch(`/api/memories?public=true&search=${encodeURIComponent(query)}`).then((r) => r.json()),
        fetch(`/api/quotes`).then((r) => r.json()),
      ]);

      const filteredClasses = (clsRes.classes || []).filter(
        (c: any) =>
          c.className.toLowerCase().includes(query.toLowerCase()) ||
          (c.classMotto && c.classMotto.toLowerCase().includes(query.toLowerCase()))
      );

      const filteredQuotes = (qRes.quotes || []).filter(
        (q: any) =>
          q.quoteText.toLowerCase().includes(query.toLowerCase()) ||
          q.authorName.toLowerCase().includes(query.toLowerCase())
      );

      setResults({
        students: stuRes.students || [],
        classes: filteredClasses,
        memories: memRes.memories || [],
        quotes: filteredQuotes,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const totalResults =
    results.students.length +
    results.classes.length +
    results.memories.length +
    results.quotes.length;

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="inline-flex items-center space-x-2 text-gold-dark text-xs font-bold uppercase tracking-widest mb-3">
          <Search className="w-4 h-4" />
          <span>Pencarian Global Buku Kenangan</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-navy-950 mb-3">
          Cari Semua Kenangan
        </h1>
        <p className="text-xs sm:text-sm text-charcoal font-light">
          Ketik nama siswa, nama kelas, judul foto, cerita kenangan, atau quotes.
        </p>
      </div>

      {/* Search Input Box */}
      <form onSubmit={handleSearch} className="mb-12">
        <div className="relative shadow-md rounded-full overflow-hidden">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ketik kata kunci pencarian..."
            className="w-full pl-12 pr-28 py-4 text-sm sm:text-base outline-none border border-navy-200 focus:border-gold"
          />
          <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2.5 rounded-full bg-gold hover:bg-gold-light text-navy-950 font-bold text-xs sm:text-sm transition shadow-sm"
          >
            {loading ? 'Mencari...' : 'Cari'}
          </button>
        </div>
      </form>

      {/* Results Display */}
      {hasSearched && (
        <div className="space-y-10">
          <div className="border-b border-navy-100 pb-3 text-xs text-charcoal">
            Ditemukan <strong>{totalResults}</strong> hasil untuk kata kunci “<strong>{query}</strong>”
          </div>

          {/* Students Results */}
          {results.students.length > 0 && (
            <div>
              <h3 className="font-serif text-xl font-bold text-navy-950 flex items-center space-x-2 mb-4">
                <Users className="w-5 h-5 text-gold-dark" />
                <span>Siswa ({results.students.length})</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {results.students.map((st) => (
                  <Link
                    key={st.id}
                    href={`/students/${st.slug}`}
                    className="p-4 rounded-2xl bg-white border border-navy-100 shadow-sm hover:shadow-md transition flex items-center space-x-3"
                  >
                    <img
                      src={st.profilePhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'}
                      alt={st.fullName}
                      className="w-12 h-12 rounded-full object-cover border border-gold/40"
                    />
                    <div className="overflow-hidden">
                      <h4 className="font-serif font-bold text-sm text-navy truncate">{st.fullName}</h4>
                      <span className="text-[11px] text-dusty-blue">Kelas {st.class?.className} ({st.nickname})</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Classes Results */}
          {results.classes.length > 0 && (
            <div>
              <h3 className="font-serif text-xl font-bold text-navy-950 flex items-center space-x-2 mb-4">
                <School className="w-5 h-5 text-gold-dark" />
                <span>Kelas ({results.classes.length})</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {results.classes.map((cls) => (
                  <Link
                    key={cls.id}
                    href={`/classes/${cls.classSlug}`}
                    className="p-4 rounded-2xl bg-white border border-navy-100 shadow-sm hover:shadow-md transition flex items-center justify-between"
                  >
                    <div>
                      <h4 className="font-serif font-bold text-base text-navy">Kelas {cls.className}</h4>
                      <p className="text-xs text-charcoal-light italic mt-0.5">{cls.classMotto}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gold-dark" />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Memories Results */}
          {results.memories.length > 0 && (
            <div>
              <h3 className="font-serif text-xl font-bold text-navy-950 flex items-center space-x-2 mb-4">
                <Camera className="w-5 h-5 text-gold-dark" />
                <span>Foto Kenangan ({results.memories.length})</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {results.memories.map((m) => (
                  <Link
                    key={m.id}
                    href="/memories"
                    className="rounded-2xl overflow-hidden bg-white border border-navy-100 shadow-sm block"
                  >
                    <div className="aspect-[4/3] overflow-hidden bg-navy-900">
                      <img src={m.imageUrl} alt={m.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="p-3">
                      <h5 className="font-serif font-bold text-xs text-navy line-clamp-1">{m.title}</h5>
                      <span className="text-[10px] text-dusty-blue">{m.category}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Quotes Results */}
          {results.quotes.length > 0 && (
            <div>
              <h3 className="font-serif text-xl font-bold text-navy-950 flex items-center space-x-2 mb-4">
                <Quote className="w-5 h-5 text-gold-dark" />
                <span>Quotes ({results.quotes.length})</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {results.quotes.map((q) => (
                  <div key={q.id} className="p-4 rounded-2xl bg-white border border-navy-100 shadow-sm">
                    <p className="font-serif italic text-xs sm:text-sm text-navy mb-2">“{q.quoteText}”</p>
                    <span className="text-[11px] font-semibold text-gold-dark">— {q.authorName}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {totalResults === 0 && (
            <EmptyState
              title="Tidak Ditemukan Hasil"
              description={`Tidak ada siswa, kelas, foto, atau kutipan yang cocok dengan "${query}". Coba kata kunci lainnya.`}
            />
          )}
        </div>
      )}

    </div>
  );
}
