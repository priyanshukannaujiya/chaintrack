import React from 'react';
import { Card } from './Card';
import { X } from 'lucide-react';

export const Modal: React.FC<{ isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <Card className="w-full max-w-md relative animate-fade-in shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 text-textMuted hover:text-textMain transition-colors">
          <X size={20} />
        </button>
        <h2 className="text-xl font-bold text-textMain mb-4">{title}</h2>
        {children}
      </Card>
    </div>
  );
};
