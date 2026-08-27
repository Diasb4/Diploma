import React, { useEffect, useState } from 'react';
import { ArrowRight, Copy, RefreshCw, Search } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const PAGE_SIZE = 30;

export const ProfessorList: React.FC = () => {
  const { filteredProfessors, searchQuery, setSearchQuery, professorSort, setProfessorSort, setSelectedProfessor, loading, error, refreshCatalogs } = useApp();
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [copied, setCopied] = useState('');
  useEffect(() => setVisible(PAGE_SIZE), [searchQuery, professorSort, filteredProfessors.length]);

  const copy = async (email: string) => {
    await navigator.clipboard.writeText(email);
    setCopied(email);
    window.setTimeout(() => setCopied(''), 1800);
  };

  if (loading) return <div className="rounded-lg border border-slate-200 bg-white p-8 text-sm text-slate-500 dark:border-slate-800 dark:bg-[#141922]">Загружаем каталог руководителей…</div>;
  if (error) return <div className="rounded-lg border border-slate-300 bg-white p-6 dark:border-slate-700 dark:bg-[#141922]"><h2 className="text-lg font-bold">Каталог временно недоступен</h2><p className="mt-2 text-sm text-slate-500">{error}</p><button onClick={() => void refreshCatalogs()} className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#0b5fff] px-3 py-2 text-sm font-semibold text-white"><RefreshCw className="h-4 w-4" />Повторить</button></div>;

  return (
    <div className="space-y-5 animate-fade-in">
      <div><h1 className="text-3xl font-bold tracking-tight">Научные руководители</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">Поиск по преподавателям, научным интересам и дисциплинам. Каталог показывает доступную квоту на руководство.</p></div>
      <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-[#141922]">
        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_180px]">
          <label className="relative"><span className="sr-only">Поиск руководителей</span><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input type="search" value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="ФИО, кафедра или область исследований" className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-sm focus:border-[#0b5fff] focus:outline-none dark:border-slate-700 dark:bg-[#0f131a]" /></label>
          <select value={professorSort} onChange={(event) => setProfessorSort(event.target.value)} aria-label="Сортировка руководителей" className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-[#0f131a]"><option value="name">По имени</option><option value="slots">По свободным местам</option></select>
        </div>
        <p className="mt-3 text-xs text-slate-500">Найдено {filteredProfessors.length}; показано {Math.min(visible, filteredProfessors.length)}</p>
      </div>

      {filteredProfessors.length === 0 ? <div className="rounded-lg border border-dashed border-slate-300 p-10 text-center dark:border-slate-700"><h2 className="text-lg font-bold">Руководители не найдены</h2><p className="mt-2 text-sm text-slate-500">Измените запрос или отключите фильтр свободных мест.</p></div> : (
        <div className="grid gap-3 xl:grid-cols-2">
          {filteredProfessors.slice(0, visible).map((professor) => (
            <article key={professor.id} className="flex flex-col rounded-lg border border-slate-200 bg-white p-5 transition-colors duration-150 hover:border-slate-400 dark:border-slate-800 dark:bg-[#141922] dark:hover:border-slate-600">
              <div className="flex items-start justify-between gap-4"><div><button onClick={() => setSelectedProfessor(professor)} className="text-left text-lg font-bold hover:text-[#0b5fff]">{professor.name}</button><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{professor.position} · {professor.department}</p></div><span className={`shrink-0 text-sm font-semibold ${professor.freeSlots > 0 ? 'text-[#087443] dark:text-[#65d49b]' : 'text-slate-500'}`}>{professor.freeSlots > 0 ? `${professor.freeSlots} мест` : 'Нет мест'}</span></div>
              <p className="mt-4 line-clamp-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{professor.interests.slice(0, 5).join(' · ') || 'Научные интересы уточняются'}</p>
              <div className="mt-auto flex items-center justify-between gap-3 border-t border-slate-200 pt-4 dark:border-slate-800">
                <button onClick={() => void copy(professor.email)} className="inline-flex min-w-0 items-center gap-2 text-sm text-slate-500 hover:text-[#0b5fff]"><Copy className="h-4 w-4 shrink-0" /><span className="truncate">{copied === professor.email ? 'Почта скопирована' : professor.email}</span></button>
                <button onClick={() => setSelectedProfessor(professor)} aria-label={`Подробнее о ${professor.name}`} className="rounded-lg p-2 text-[#0b5fff] hover:bg-[#eef4ff] dark:hover:bg-[#1d3157]"><ArrowRight className="h-4 w-4" /></button>
              </div>
            </article>
          ))}
        </div>
      )}
      {visible < filteredProfessors.length && <div className="text-center"><button onClick={() => setVisible((count) => count + PAGE_SIZE)} className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold hover:border-slate-500 dark:border-slate-700 dark:bg-[#141922]">Показать ещё {Math.min(PAGE_SIZE, filteredProfessors.length - visible)}</button></div>}
    </div>
  );
};
