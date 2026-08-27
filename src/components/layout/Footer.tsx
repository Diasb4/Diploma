import React from 'react';
import { ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => (
  <footer className="mt-12 border-t border-slate-200 bg-white py-7 text-sm text-slate-500 dark:border-slate-800 dark:bg-[#141922] dark:text-slate-400">
    <div className="mx-auto flex max-w-7xl flex-col justify-between gap-3 px-4 sm:flex-row sm:items-center sm:px-6">
      <p>AITU Diploma · каталог тем и сопровождение дипломного проекта</p>
      <a href="https://astanait.edu.kz" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 hover:text-[#0b5fff]">Astana IT University <ExternalLink className="h-3.5 w-3.5" /></a>
    </div>
  </footer>
);
