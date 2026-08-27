import React, { useEffect, useState } from 'react';
import { LogOut } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { schoolsList } from '../../services/dataService';

export const ProfileView: React.FC = () => {
  const { user, setIsAuthModalOpen, updateProfile, logout } = useApp();
  const [form, setForm] = useState({ fullName: '', school: 'SIS', track: '', gpa: '0', skills: '', bio: '', githubUrl: '', linkedinUrl: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => { if (user) setForm({ fullName: user.fullName, school: user.school, track: user.track, gpa: String(user.gpa), skills: user.skills.join(', '), bio: user.bio || '', githubUrl: user.githubUrl || '', linkedinUrl: user.linkedinUrl || '' }); }, [user]);
  if (!user) return <div className="mx-auto max-w-xl rounded-lg border border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-[#141922]"><h1 className="text-3xl font-bold">Профиль студента</h1><p className="mt-3 text-sm text-slate-500">Войдите через корпоративную почту, чтобы сохранить данные команды и видеть заявки.</p><button onClick={() => setIsAuthModalOpen(true)} className="mt-5 rounded-lg bg-[#0b5fff] px-4 py-2.5 text-sm font-semibold text-white">Войти через AITU</button></div>;

  const save = async (event: React.FormEvent) => {
    event.preventDefault(); setSaving(true); setError('');
    try { await updateProfile({ ...form, gpa: Number(form.gpa), skills: form.skills.split(',').map((item) => item.trim()).filter(Boolean) }); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Не удалось сохранить профиль.'); }
    finally { setSaving(false); }
  };
  const field = (name: keyof typeof form, value: string) => setForm((current) => ({ ...current, [name]: value }));

  return (
    <div className="mx-auto max-w-3xl animate-fade-in"><div className="flex flex-wrap items-end justify-between gap-4"><div><h1 className="text-3xl font-bold tracking-tight">Профиль</h1><p className="mt-2 text-sm text-slate-500">{user.email} · Student ID {user.studentId}</p></div><button onClick={logout} className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium dark:border-slate-700"><LogOut className="h-4 w-4" />Выйти</button></div>
      <form onSubmit={save} className="mt-6 grid gap-5 rounded-lg border border-slate-200 bg-white p-5 sm:grid-cols-2 dark:border-slate-800 dark:bg-[#141922]">
        <label className="text-sm font-medium">ФИО<input required value={form.fullName} onChange={(event) => field('fullName', event.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 dark:border-slate-700 dark:bg-[#0f131a]" /></label>
        <label className="text-sm font-medium">Школа<select value={form.school} onChange={(event) => field('school', event.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 dark:border-slate-700 dark:bg-[#0f131a]">{schoolsList.filter((item) => item.id !== 'ALL').map((item) => <option key={item.id} value={item.id}>{item.code} · {item.shortName}</option>)}</select></label>
        <label className="text-sm font-medium">Образовательная программа<input value={form.track} onChange={(event) => field('track', event.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 dark:border-slate-700 dark:bg-[#0f131a]" /></label>
        <label className="text-sm font-medium">GPA<input type="number" min="0" max="4" step="0.01" value={form.gpa} onChange={(event) => field('gpa', event.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 dark:border-slate-700 dark:bg-[#0f131a]" /></label>
        <label className="sm:col-span-2 text-sm font-medium">Навыки через запятую<input value={form.skills} onChange={(event) => field('skills', event.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 dark:border-slate-700 dark:bg-[#0f131a]" /></label>
        <label className="sm:col-span-2 text-sm font-medium">О себе<textarea rows={4} value={form.bio} onChange={(event) => field('bio', event.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 dark:border-slate-700 dark:bg-[#0f131a]" /></label>
        <label className="text-sm font-medium">GitHub<input type="url" value={form.githubUrl} onChange={(event) => field('githubUrl', event.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 dark:border-slate-700 dark:bg-[#0f131a]" /></label>
        <label className="text-sm font-medium">LinkedIn<input type="url" value={form.linkedinUrl} onChange={(event) => field('linkedinUrl', event.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 dark:border-slate-700 dark:bg-[#0f131a]" /></label>
        {error && <p role="alert" className="sm:col-span-2 rounded-lg border border-slate-300 p-3 text-sm"><strong>Ошибка:</strong> {error}</p>}
        <div className="sm:col-span-2 flex justify-end"><button disabled={saving} className="rounded-lg bg-[#0b5fff] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60">{saving ? 'Сохраняем…' : 'Сохранить профиль'}</button></div>
      </form>
    </div>
  );
};
