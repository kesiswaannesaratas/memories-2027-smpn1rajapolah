import React from 'react';
import { FolderOpen } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export default function EmptyState({
  title = 'Belum Ada Data',
  description = 'Saat ini belum ada data yang dapat ditampilkan di halaman ini.',
  actionText,
  onAction,
  icon,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-16 h-16 rounded-full bg-navy-100 flex items-center justify-center text-navy-400 mb-4 border border-navy-200/60 shadow-inner">
        {icon || <FolderOpen className="w-8 h-8 text-gold" />}
      </div>
      <h3 className="font-serif text-lg font-bold text-navy-900 mb-1">{title}</h3>
      <p className="text-sm text-charcoal-light max-w-sm mb-6 leading-relaxed">
        {description}
      </p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="px-5 py-2.5 rounded-full bg-gold hover:bg-gold-light text-navy-950 font-semibold text-sm transition shadow-sm"
        >
          {actionText}
        </button>
      )}
    </div>
  );
}
