'use client';

import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const toggleVisible = () => {
      setVisible(window.scrollY > 300);
    };
    window.addEventListener('scroll', toggleVisible);
    return () => window.removeEventListener('scroll', toggleVisible);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  if (!visible) return null;

  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-6 right-6 z-40 p-3 rounded-full bg-gold hover:bg-gold-light text-navy-950 shadow-xl transition-all duration-300 transform hover:scale-110 active:scale-95 no-print"
      title="Kembali ke Atas"
      aria-label="Back to Top"
    >
      <ArrowUp className="w-5 h-5 font-bold" />
    </button>
  );
}
