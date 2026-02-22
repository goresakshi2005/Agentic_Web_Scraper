import React from 'react';
import Header from './Header';
import Footer from './Footer';

export default function Layout({ children, busy = false }) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300 flex flex-col">
      <Header />
      <main role="main" aria-busy={busy} className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}
