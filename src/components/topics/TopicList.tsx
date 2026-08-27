import React from 'react';
import { ArrowRight, Bookmark, RefreshCw, Search } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { schoolsList } from '../../services/dataService';

export const TopicList: React.FC = () => {
  const {
    filteredTopics, searchQuery, setSearchQuery, selectedSchool, bookmarkedIds, toggleBookmark,
    setSelectedTopic, topicSort, setTopicSort, loading, error, refreshCatalogs
  } = useApp();
  const school = schoolsList.find((item) => item.id === selectedSchool);

  if (loading) return <div className="rounded-lg border border-slate-200 bg-white p-8 text-sm text-slate-500 dark:border-slate-800 dark:bg-[#141922]">Загружаем каталог тем…</div>;
  if (error) return (
    <div className="rounded-lg border border-slate-300 bg-white p-6 dark:border-slate-700 dark:bg-[#141922]">
      <h2 className="text-lg font-bold">Каталог временно недоступен</h2><p className="mt-2 text-sm text-slate-500">{error}</p>
      <button onClick={() => void refreshCatalogs()} className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#0b5fff] px-3 py-2 text-sm font-semibold text-white"><RefreshCw className="h-4 w-4" />Повторить</button>
    </div>
  );

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Темы дипломных проектов</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">Сравните требования, свободные места и компетенции руководителя. Бронирование создаёт официальную заявку для команды.</p>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-[#141922]">
        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_180px]">
          <label className="relative"><span className="sr-only">Поиск тем</span><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input type="search" value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Название, технология или руководитель" className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-sm focus:border-[#0b5fff] focus:outline-none dark:border-slate-700 dark:bg-[#0f131a]" /></label>
          <label><span className="sr-only">Сортировка тем</span><select value={topicSort} onChange={(event) => setTopicSort(event.target.value)} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-[#0f131a]"><option value="school">По школе</option><option value="title">По названию</option><option value="slots">Сначала свободные</option></select></label>
        </div>
        <p className="mt-3 text-xs text-slate-500">{school?.name || 'Все школы'} · найдено {filteredTopics.length}</p>
      </div>

      {filteredTopics.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 p-10 text-center dark:border-slate-700"><h2 className="text-lg font-bold">Ничего не найдено</h2><p className="mt-2 text-sm text-slate-500">Измените запрос или снимите часть фильтров.</p></div>
      ) : (
        <div className="space-y-3">
          {filteredTopics.map((topic) => {
            const saved = bookmarkedIds.has(topic.id);
            const available = topic.availableSlots > 0;
            return (
              <article key={topic.id} className="rounded-lg border border-slate-200 bg-white p-5 transition-colors duration-150 hover:border-slate-400 dark:border-slate-800 dark:bg-[#141922] dark:hover:border-slate-600">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400"><span className="font-mono">{topic.school}</span> · {topic.track} · {topic.difficulty}</p>
                    <button onClick={() => setSelectedTopic(topic)} className="mt-2 text-left text-lg font-bold leading-6 hover:text-[#0b5fff]">{topic.title}</button>
                  </div>
                  <button onClick={() => toggleBookmark(topic.id)} aria-pressed={saved} aria-label={saved ? 'Удалить тему из сохранённых' : 'Сохранить тему'} className={`shrink-0 rounded-lg p-2 transition-colors duration-150 ${saved ? 'bg-[#eaf1ff] text-[#0b5fff] dark:bg-[#1d3157]' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}><Bookmark className={`h-4 w-4 ${saved ? 'fill-current' : ''}`} /></button>
                </div>
                <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{topic.description}</p>
                <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-500 dark:text-slate-400">
                  <span><strong className="text-slate-700 dark:text-slate-200">Руководитель:</strong> {topic.supervisorName}</span>
                  <span><strong className="text-slate-700 dark:text-slate-200">Стек:</strong> {topic.techStack.slice(0, 4).join(', ')}</span>
                </div>
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4 dark:border-slate-800">
                  <span className={`text-sm font-semibold ${available ? 'text-[#087443] dark:text-[#65d49b]' : 'text-slate-500'}`}>{available ? `${topic.availableSlots} из ${topic.maxStudents} мест свободно` : 'Свободных мест нет'}</span>
                  <button onClick={() => setSelectedTopic(topic)} className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-[#0b5fff] hover:bg-[#eef4ff] dark:hover:bg-[#1d3157]">Подробнее <ArrowRight className="h-4 w-4" /></button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};
