import React from 'react';
import { Bookmark, RotateCcw, School } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { schoolsList } from '../../services/dataService';

export const Sidebar: React.FC = () => {
  const {
    activeView, selectedSchool, setSelectedSchool, studentSchool, setIsSchoolModalOpen,
    onlyAvailable, setOnlyAvailable, bookmarkedOnly, setBookmarkedOnly, topics
  } = useApp();
  const currentSchool = schoolsList.find((school) => school.id === studentSchool);

  return (
    <aside className="space-y-6" aria-label="Фильтры каталога">
      <section>
        <div className="mb-2 flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold">Моя школа</h2>
          <button onClick={() => setIsSchoolModalOpen(true)} className="text-xs font-medium text-[#0b5fff] hover:underline">Изменить</button>
        </div>
        <button onClick={() => currentSchool && setSelectedSchool(currentSchool.id)} className="w-full rounded-lg border border-slate-200 bg-white p-3 text-left hover:border-slate-400 dark:border-slate-800 dark:bg-[#141922] dark:hover:border-slate-600">
          <span className="flex items-center gap-2 text-sm font-medium"><School className="h-4 w-4 text-slate-500" />{currentSchool?.code || 'Не выбрана'}</span>
          <span className="mt-1 block text-xs leading-5 text-slate-500 dark:text-slate-400">{currentSchool?.name || 'Укажите школу, чтобы быстрее находить подходящие темы.'}</span>
        </button>
      </section>

      {activeView === 'topics' && (
        <section>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-semibold">Школы</h2>
            {selectedSchool !== 'ALL' && <button onClick={() => setSelectedSchool('ALL')} className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white"><RotateCcw className="h-3 w-3" />Сбросить</button>}
          </div>
          <div className="space-y-1">
            {schoolsList.map((school) => {
              const count = school.id === 'ALL' ? topics.length : topics.filter((topic) => topic.school === school.id).length;
              return (
                <button key={school.id} onClick={() => setSelectedSchool(school.id)} aria-pressed={selectedSchool === school.id} className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-colors duration-150 ${selectedSchool === school.id ? 'bg-[#0b5fff] text-white' : 'hover:bg-white dark:hover:bg-[#1b2230]'}`}>
                  <span className="flex items-center justify-between gap-2"><span className="truncate">{school.shortName}</span><span className="text-xs tabular-nums opacity-70">{count}</span></span>
                </button>
              );
            })}
          </div>
        </section>
      )}

      <section className="space-y-3 border-t border-slate-200 pt-5 dark:border-slate-800">
        <label className="flex cursor-pointer items-center justify-between gap-3 text-sm">
          <span>Только со свободными местами</span>
          <input type="checkbox" checked={onlyAvailable} onChange={(event) => setOnlyAvailable(event.target.checked)} className="h-4 w-4 rounded border-slate-300 text-[#0b5fff] focus:ring-[#0b5fff]" />
        </label>
        {activeView === 'topics' && (
          <label className="flex cursor-pointer items-center justify-between gap-3 text-sm">
            <span className="flex items-center gap-2"><Bookmark className="h-4 w-4" />Только сохранённые</span>
            <input type="checkbox" checked={bookmarkedOnly} onChange={(event) => setBookmarkedOnly(event.target.checked)} className="h-4 w-4 rounded border-slate-300 text-[#0b5fff] focus:ring-[#0b5fff]" />
          </label>
        )}
      </section>
    </aside>
  );
};
