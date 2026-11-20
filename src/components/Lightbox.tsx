'use client';

import React, { useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Calendar, User } from 'lucide-react';

interface LightboxProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  title?: string;
  caption?: string;
  category?: string;
  date?: string;
  uploader?: string;
  onNext?: () => void;
  onPrev?: () => void;
}

export default function Lightbox({
  isOpen,
  onClose,
  imageUrl,
  title,
  caption,
  category,
  date,
  uploader,
  onNext,
  onPrev,
}: LightboxProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight' && onNext) onNext();
      if (e.key === 'ArrowLeft' && onPrev) onPrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, onNext, onPrev]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/95 backdrop-blur-md p-4 sm:p-6 no-print">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-5 right-5 z-50 p-2.5 rounded-full bg-navy-800/80 text-white hover:bg-gold hover:text-navy-950 transition"
        title="Tutup (Esc)"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Prev button */}
      {onPrev && (
        <button
          onClick={onPrev}
          className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full bg-navy-800/80 text-white hover:bg-gold hover:text-navy-950 transition"
          title="Foto Sebelumnya"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      )}

      {/* Next button */}
      {onNext && (
        <button
          onClick={onNext}
          className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full bg-navy-800/80 text-white hover:bg-gold hover:text-navy-950 transition"
          title="Foto Selanjutnya"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      )}

      {/* Content Container */}
      <div className="max-w-4xl w-full max-h-[90vh] flex flex-col items-center">
        <div className="relative w-full flex items-center justify-center overflow-hidden rounded-2xl bg-black/40 shadow-2xl border border-navy-800">
          <img
            src={imageUrl}
            alt={title || 'Memory Photo'}
            className="max-h-[70vh] w-auto max-w-full object-contain"
          />
        </div>

        {/* Caption & Metadata Bar */}
        {(title || caption || category || date || uploader) && (
          <div className="w-full mt-4 bg-navy-900/90 border border-navy-800 p-4 rounded-xl text-white">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
              <h3 className="font-serif text-lg font-bold text-warm-white">
                {title || 'Kenangan Bersama'}
              </h3>
              {category && (
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-gold/20 text-gold border border-gold/30">
                  {category}
                </span>
              )}
            </div>
            {caption && (
              <p className="text-xs sm:text-sm text-cream-200 leading-relaxed mb-2">
                {caption}
              </p>
            )}
            <div className="flex items-center space-x-4 text-[11px] text-dusty-blue">
              {uploader && (
                <span className="flex items-center space-x-1">
                  <User className="w-3.5 h-3.5 text-gold" />
                  <span>{uploader}</span>
                </span>
              )}
              {date && (
                <span className="flex items-center space-x-1">
                  <Calendar className="w-3.5 h-3.5 text-gold" />
                  <span>{date}</span>
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
