'use client';

import { useTheme } from 'next-themes';
import { Sun, Moon, Search } from 'lucide-react';
import { NotificationsDropdown } from './notifications-dropdown';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  const { theme, setTheme } = useTheme();

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30">
      <div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h2>
        {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-2">
        {/* Search */}
        <div className="hidden md:flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl">
          <Search className="h-4 w-4 text-slate-400" />
          <input
            className="bg-transparent text-sm outline-none placeholder:text-slate-400 w-40 text-slate-900 dark:text-white"
            placeholder="Search…"
          />
        </div>

        {/* Dark mode toggle */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          aria-label="Toggle theme"
        >
          {theme === 'dark'
            ? <Sun className="h-5 w-5 text-slate-600 dark:text-slate-300" />
            : <Moon className="h-5 w-5 text-slate-600" />}
        </button>

        {/* Notifications */}
        <NotificationsDropdown />
      </div>
    </header>
  );
}
