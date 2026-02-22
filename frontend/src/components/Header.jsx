import React from 'react';
import { Sparkles } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

export default function Header() {
  return (
    <header className="w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800" role="banner">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600 text-white rounded-md" aria-hidden>
            <Sparkles size={18} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-800 dark:text-slate-100 leading-tight">Agentic Insight Scraper</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">Research automation + concise summaries</p>
          </div>
        </div>
        <nav className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-4" aria-label="Primary navigation">
          <a className="hidden sm:inline mr-4" href="#">Docs</a>
          <a className="hidden sm:inline" href="#">About</a>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
