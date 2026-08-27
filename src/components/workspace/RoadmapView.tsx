import React from 'react';
import { Check } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const RoadmapView: React.FC = () => {
  const { milestones, user, setIsAuthModalOpen, updateMilestone } = useApp();
  const total = milestones.reduce((sum, item) => sum + item.progress * item.weight / 100, 0);
  const setProgress = async (id: string, progress: number) => {
    const status = progress >= 100 ? 'completed' : progress > 0 ? 'in_progress' : 'pending';
    try { await updateMilestone(id, progress, status); } catch { /* auth modal is opened by context */ }
  };

  return (
    <div className="space-y-7 animate-fade-in">
      <div className="flex flex-wrap items-end justify-between gap-4"><div><h1 className="text-3xl font-bold tracking-tight">План дипломного проекта</h1><p className="mt-2 text-sm text-slate-500">Этапы 2025–2026 учебного года и индивидуальный прогресс.</p></div><div className="text-right"><p className="text-3xl font-bold tabular-nums">{Math.round(total)}%</p><p className="text-xs text-slate-500">взвешенный прогресс</p></div></div>
      <div className="h-2 overflow-hidden rounded bg-slate-200 dark:bg-slate-800"><div className="h-full bg-[#0b5fff] transition-[width] duration-150" style={{ width: `${total}%` }} /></div>
      {!user && <div className="rounded-lg border border-slate-300 bg-white p-4 text-sm dark:border-slate-700 dark:bg-[#141922]">Прогресс доступен для просмотра. <button onClick={() => setIsAuthModalOpen(true)} className="font-semibold text-[#0b5fff] hover:underline">Войдите</button>, чтобы обновлять значения.</div>}
      <ol className="space-y-4">
        {milestones.map((milestone) => (
          <li key={milestone.id} className="grid gap-4 rounded-lg border border-slate-200 bg-white p-5 sm:grid-cols-[48px_minmax(0,1fr)] dark:border-slate-800 dark:bg-[#141922]">
            <div className={`flex h-10 w-10 items-center justify-center rounded-lg font-bold ${milestone.status === 'completed' ? 'bg-[#0b5fff] text-white' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'}`}>{milestone.status === 'completed' ? <Check className="h-5 w-5" /> : milestone.phaseId}</div>
            <div><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs text-slate-500">{milestone.phaseName} · {new Date(milestone.startDate).toLocaleDateString('ru-RU')}–{new Date(milestone.endDate).toLocaleDateString('ru-RU')}</p><h2 className="mt-1 text-xl font-bold">{milestone.title}</h2></div><span className="font-semibold tabular-nums">{milestone.progress}%</span></div><p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{milestone.description}</p><ul className="mt-3 grid gap-1 text-sm text-slate-500 sm:grid-cols-2">{milestone.requirements.map((item) => <li key={item}>· {item}</li>)}</ul>{user && <label className="mt-5 block text-xs font-medium text-slate-500">Прогресс этапа<input type="range" min="0" max="100" step="5" value={milestone.progress} onChange={(event) => void setProgress(milestone.id, Number(event.target.value))} className="mt-2 w-full accent-[#0b5fff]" /></label>}</div>
          </li>
        ))}
      </ol>
    </div>
  );
};
