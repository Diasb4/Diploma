import React, { useState } from 'react';
import { Bell, Download, FileSearch, Trash2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { schoolsList } from '../../services/dataService';
import { SimilarityResult } from '../../types';

const statusLabels = {
  PENDING_SUPERVISOR: 'Ожидает руководителя',
  PENDING_DEANERY: 'Ожидает согласования школ',
  APPROVED: 'Утверждена',
  REJECTED: 'Отклонена'
};

export const ApplicationsView: React.FC = () => {
  const {
    user, applications, notifications, setIsAuthModalOpen, cancelApplication, markAllNotificationsRead,
    checkSimilarity, proposeTopic, exportApplication
  } = useApp();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [school, setSchool] = useState(user?.school || 'SIS');
  const [track, setTrack] = useState('');
  const [techStack, setTechStack] = useState('');
  const [result, setResult] = useState<SimilarityResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const analyze = async () => {
    setBusy(true); setError('');
    try { setResult(await checkSimilarity(title, description)); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Не удалось проверить тему.'); }
    finally { setBusy(false); }
  };

  const propose = async () => {
    setBusy(true); setError('');
    try {
      await proposeTopic({ title, description, school, track, techStack: techStack.split(',').map((item) => item.trim()).filter(Boolean), studentId: user?.studentId });
      setTitle(''); setDescription(''); setTrack(''); setTechStack(''); setResult(null);
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Не удалось отправить тему.'); }
    finally { setBusy(false); }
  };

  if (!user) return (
    <div className="mx-auto max-w-2xl rounded-lg border border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-[#141922]">
      <h1 className="text-3xl font-bold">Заявки и инициативные темы</h1>
      <p className="mt-3 text-sm leading-6 text-slate-500">Войдите, чтобы бронировать темы, собирать команду, получать уведомления и отправлять собственную формулировку.</p>
      <button onClick={() => setIsAuthModalOpen(true)} className="mt-5 rounded-lg bg-[#0b5fff] px-4 py-2.5 text-sm font-semibold text-white">Войти через AITU</button>
    </div>
  );

  return (
    <div className="space-y-9 animate-fade-in">
      <div><h1 className="text-3xl font-bold tracking-tight">Заявки</h1><p className="mt-2 text-sm text-slate-500">Статусы бронирования, уведомления и проверка инициативной темы.</p></div>

      {notifications.length > 0 && (
        <section className="rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-[#141922]">
          <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-5 py-4 dark:border-slate-800"><h2 className="flex items-center gap-2 text-lg font-bold"><Bell className="h-5 w-5" />Уведомления</h2>{notifications.some((item) => !item.isRead) && <button onClick={() => void markAllNotificationsRead()} className="text-sm font-medium text-[#0b5fff] hover:underline">Прочитать все</button>}</div>
          <div className="divide-y divide-slate-200 dark:divide-slate-800">{notifications.map((notification) => <article key={notification.id} className={`px-5 py-4 ${notification.isRead ? '' : 'bg-[#f7faff] dark:bg-[#17233a]'}`}><div className="flex items-center justify-between gap-3"><h3 className="text-sm font-semibold">{notification.title}</h3><time className="text-xs text-slate-500">{new Date(notification.createdAt).toLocaleDateString('ru-RU')}</time></div><p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">{notification.message}</p></article>)}</div>
        </section>
      )}

      <section>
        <h2 className="text-xl font-bold">Мои заявки</h2>
        {applications.length === 0 ? <div className="mt-3 rounded-lg border border-dashed border-slate-300 p-8 text-center dark:border-slate-700"><p className="font-semibold">Активных заявок нет</p><p className="mt-1 text-sm text-slate-500">Откройте каталог тем и выберите «Отправить заявку».</p></div> : <div className="mt-3 space-y-3">{applications.map((application) => <article key={application.id} className="rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-[#141922]"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="font-mono text-xs text-slate-500">{application.topicCode} · {application.id}</p><h3 className="mt-2 text-lg font-bold">{application.topicTitle}</h3></div><span className="rounded bg-slate-100 px-2 py-1 text-xs font-semibold dark:bg-slate-800">{statusLabels[application.status]}</span></div><dl className="mt-4 grid gap-3 text-sm sm:grid-cols-3"><div><dt className="text-slate-500">Руководитель</dt><dd className="mt-1 font-medium">{application.supervisorName}</dd></div><div><dt className="text-slate-500">Команда</dt><dd className="mt-1 font-medium">{application.members.length} участник(а)</dd></div><div><dt className="text-slate-500">Код проверки</dt><dd className="mt-1 font-mono text-xs">{application.verificationCode}</dd></div></dl><div className="mt-5 flex flex-wrap justify-end gap-2 border-t border-slate-200 pt-4 dark:border-slate-800"><button onClick={() => void exportApplication(application.id)} className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium dark:border-slate-700"><Download className="h-4 w-4" />Экспорт</button><button onClick={() => { if (window.confirm('Отменить заявку и вернуть места в каталог?')) void cancelApplication(application.id); }} className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-[#a33a3a] hover:bg-slate-100 dark:text-[#ff9b9b] dark:hover:bg-slate-800"><Trash2 className="h-4 w-4" />Отменить</button></div></article>)}</div>}
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-[#141922]">
        <div className="flex items-start gap-3"><FileSearch className="mt-1 h-5 w-5 text-[#0b5fff]" /><div><h2 className="text-xl font-bold">Инициативная тема</h2><p className="mt-1 text-sm leading-6 text-slate-500">Сначала сравните формулировку с каталогом. При приемлемом результате отправьте её школе.</p></div></div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="sm:col-span-2 text-sm font-medium">Название<input value={title} onChange={(event) => { setTitle(event.target.value); setResult(null); }} minLength={10} className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 dark:border-slate-700 dark:bg-[#0f131a]" /></label>
          <label className="sm:col-span-2 text-sm font-medium">Описание<textarea value={description} onChange={(event) => { setDescription(event.target.value); setResult(null); }} rows={5} minLength={30} className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 dark:border-slate-700 dark:bg-[#0f131a]" /></label>
          <label className="text-sm font-medium">Школа<select value={school} onChange={(event) => setSchool(event.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 dark:border-slate-700 dark:bg-[#0f131a]">{schoolsList.filter((item) => item.id !== 'ALL').map((item) => <option key={item.id} value={item.id}>{item.code} · {item.shortName}</option>)}</select></label>
          <label className="text-sm font-medium">Направление<input value={track} onChange={(event) => setTrack(event.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 dark:border-slate-700 dark:bg-[#0f131a]" /></label>
          <label className="sm:col-span-2 text-sm font-medium">Технологии через запятую<input value={techStack} onChange={(event) => setTechStack(event.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 dark:border-slate-700 dark:bg-[#0f131a]" /></label>
        </div>
        {error && <p role="alert" className="mt-4 rounded-lg border border-slate-300 p-3 text-sm"><strong>Ошибка:</strong> {error}</p>}
        {result && <div className="mt-5 border-t border-slate-200 pt-5 dark:border-slate-700"><p className="text-sm font-bold">Результат: {result.score}% · {result.verdict === 'SAFE' ? 'существенных совпадений нет' : result.verdict === 'WARNING' ? 'нужно уточнение' : 'вероятный дубликат'}</p><p className="mt-2 text-sm leading-6 text-slate-500">{result.message}</p>{result.matchedTopics.length > 0 && <ul className="mt-3 space-y-2 text-sm">{result.matchedTopics.slice(0, 3).map((topic) => <li key={topic.topicId}><strong>{topic.similarity}%</strong> · {topic.title}</li>)}</ul>}</div>}
        <div className="mt-5 flex flex-wrap justify-end gap-2"><button onClick={() => void analyze()} disabled={busy || title.length < 10 || description.length < 30} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold disabled:opacity-50 dark:border-slate-700">Проверить сходство</button>{result && result.verdict !== 'DUPLICATE' && <button onClick={() => void propose()} disabled={busy} className="rounded-lg bg-[#0b5fff] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">Отправить школе</button>}</div>
      </section>
    </div>
  );
};
