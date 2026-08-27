import React from 'react';
import { Bell, BookOpen, ClipboardList, Map, Moon, Sun, UserRound, Users } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AppView } from '../../types';

const navigation: Array<{ id: AppView; label: string; icon: React.ComponentType<{ className?: string }> }> = [
  { id: 'topics', label: 'Темы', icon: BookOpen },
  { id: 'professors', label: 'Руководители', icon: Users },
  { id: 'applications', label: 'Заявки', icon: ClipboardList },
  { id: 'roadmap', label: 'План работы', icon: Map }
];

export const Header: React.FC = () => {
  const { activeView, setActiveView, theme, toggleTheme, user, setIsAuthModalOpen, notifications } = useApp();
  const unread = notifications.filter((item) => !item.isRead).length;

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-[#141922]">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:bg-white focus:p-2">К содержимому</a>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 min-h-16 flex flex-wrap items-center gap-x-6 gap-y-2 py-2">
        <button onClick={() => setActiveView('topics')} className="flex items-center gap-3 shrink-0 text-left" aria-label="AITU Diploma — каталог тем">
          <img src="/aitu-mark.svg" alt="" className="h-9 w-9" />
          <span>
            <span className="block text-[15px] font-bold leading-tight">AITU Diploma</span>
            <span className="block text-xs text-slate-500 dark:text-slate-400">2025–2026 учебный год</span>
          </span>
        </button>

        <nav aria-label="Основная навигация" className="order-3 w-full md:order-none md:w-auto md:flex-1 overflow-x-auto">
          <div className="flex min-w-max gap-1" role="tablist">
            {navigation.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                role="tab"
                aria-selected={activeView === id}
                onClick={() => setActiveView(id)}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-150 ${activeView === id ? 'bg-[#eaf1ff] text-[#064fcc] dark:bg-[#1d3157] dark:text-[#9ec0ff]' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'}`}
              >
                <Icon className="h-4 w-4" />
                {label}
                {id === 'applications' && unread > 0 && <span className="min-w-5 rounded bg-[#0b5fff] px-1 text-center text-xs text-white">{unread}</span>}
              </button>
            ))}
          </div>
        </nav>

        <div className="ml-auto flex items-center gap-1">
          {unread > 0 && (
            <button onClick={() => setActiveView('applications')} className="relative rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800" aria-label={`${unread} непрочитанных уведомлений`}>
              <Bell className="h-4 w-4" />
              <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-[#0b5fff]" />
            </button>
          )}
          <button onClick={toggleTheme} className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800" aria-label={theme === 'dark' ? 'Включить светлую тему' : 'Включить тёмную тему'}>
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <button
            onClick={() => user ? setActiveView('profile') : setIsAuthModalOpen(true)}
            className={`ml-1 flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors duration-150 ${activeView === 'profile' ? 'border-[#0b5fff] text-[#0b5fff] dark:text-[#9ec0ff]' : 'border-slate-300 hover:border-slate-400 dark:border-slate-700 dark:hover:border-slate-500'}`}
          >
            <UserRound className="h-4 w-4" />
            <span className="hidden sm:inline">{user ? user.fullName.split(' ')[0] : 'Войти'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
