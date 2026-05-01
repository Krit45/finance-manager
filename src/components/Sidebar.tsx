import React from 'react';
import { LayoutDashboard, ListOrdered, PlusCircle, LogOut, Moon, Sun, Wallet, Settings } from 'lucide-react';
import { useApp } from '../App';
import { logout } from '../firebase';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: any[]) {
  return twMerge(clsx(inputs));
}

interface SidebarProps {
  activeTab: 'dashboard' | 'transactions' | 'add' | 'settings';
  setActiveTab: (tab: 'dashboard' | 'transactions' | 'add' | 'settings') => void;
}

export default function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const { theme, setTheme, profile } = useApp();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'transactions', label: 'Transactions', icon: ListOrdered },
    { id: 'add', label: 'Add Entry', icon: PlusCircle },
    { id: 'settings', label: 'Settings', icon: Settings },
  ] as const;

  return (
    <aside className="w-20 md:w-64 flex flex-col h-screen bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 transition-all duration-300">
      <div className="p-6 flex items-center gap-3">
        <div className="p-2 bg-emerald-500 rounded-xl">
          <Wallet className="h-6 w-6 text-white" />
        </div>
        <span className="hidden md:block font-bold text-xl tracking-tight text-emerald-600 dark:text-emerald-400">
          FinanceFlow
        </span>
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
              activeTab === item.id
                ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium"
                : "text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800"
            )}
          >
            <item.icon className={cn(
              "h-5 w-5",
              activeTab === item.id ? "text-emerald-600 dark:text-emerald-400" : "group-hover:text-zinc-700 dark:group-hover:text-zinc-200"
            )} />
            <span className="hidden md:block">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 space-y-2">
        <button
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all duration-200"
        >
          {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          <span className="hidden md:block">{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
        </button>

        <div className="hidden md:flex items-center gap-3 px-4 py-3 mb-2">
          <div className="h-8 w-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold text-sm">
            {profile?.displayName?.[0] || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{profile?.displayName || 'User'}</p>
            <p className="text-xs text-zinc-500 truncate">{profile?.email}</p>
          </div>
        </div>

        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all duration-200"
        >
          <LogOut className="h-5 w-5" />
          <span className="hidden md:block font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
}
