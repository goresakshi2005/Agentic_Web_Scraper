import React from 'react';

export default function Footer(){
  return (
    <footer className="w-full mt-8 border-t border-slate-100 dark:border-slate-800 bg-transparent">
      <div className="max-w-7xl mx-auto px-4 py-6 text-sm text-slate-500 dark:text-slate-400 flex justify-between items-center">
        <div>© {new Date().getFullYear()} Agentic Insight</div>
        <div className="flex items-center gap-4">
          <a className="hover:underline" href="#">Privacy</a>
          <a className="hover:underline" href="#">Feedback</a>
        </div>
      </div>
    </footer>
  );
}
