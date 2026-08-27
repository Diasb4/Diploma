import React, { useEffect, useState } from 'react';
import { Bookmark, Mail, Minus, Plus } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { TeamMember, TeamRole } from '../../types';
import { Modal } from '../common/Modal';

const roles: TeamRole[] = ['Капитан', 'ML/AI Engineer', 'Frontend Dev', 'Backend Dev', 'Data Analyst', 'Cybersecurity', 'Embedded/IoT'];
const emptyMember = (): TeamMember => ({ fullName: '', studentId: '', school: 'SIS', track: '', email: '', role: 'Frontend Dev' });

export const TopicModal: React.FC = () => {
  const { selectedTopic, setSelectedTopic, bookmarkedIds, toggleBookmark, user, reserveTopic, setIsAuthModalOpen } = useApp();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!selectedTopic) return;
    setMembers(user ? [{ fullName: user.fullName, studentId: user.studentId, school: user.school, track: user.track, email: user.email, role: 'Капитан' }] : []);
    setDescription('');
    setError('');
  }, [selectedTopic?.id, user?.id]);

  if (!selectedTopic) return null;
  const topic = selectedTopic;
  const saved = bookmarkedIds.has(topic.id);
  const available = topic.availableSlots > 0;

  const updateMember = (index: number, field: keyof TeamMember, value: string) => setMembers((current) => current.map((member, memberIndex) => memberIndex === index ? { ...member, [field]: value } : member));
  const submit = async () => {
    setSubmitting(true);
    setError('');
    try { await reserveTopic(topic.id, members, description); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Не удалось отправить заявку.'); }
    finally { setSubmitting(false); }
  };

  return (
    <Modal title={topic.title} description={`${topic.code} · ${topic.track}`} onClose={() => setSelectedTopic(null)} footer={<><button onClick={() => setSelectedTopic(null)} className="rounded-lg px-4 py-2 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800">Закрыть</button>{available && user && <button onClick={() => void submit()} disabled={submitting || !members.length} className="rounded-lg bg-[#0b5fff] px-4 py-2 text-sm font-semibold text-white hover:bg-[#064fcc] disabled:opacity-60">{submitting ? 'Отправляем…' : 'Отправить заявку'}</button>}</>}>
      <div className="space-y-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className={`text-sm font-semibold ${available ? 'text-[#087443] dark:text-[#65d49b]' : 'text-slate-500'}`}>{available ? `${topic.availableSlots} из ${topic.maxStudents} мест свободно` : 'Все места заняты'}</p>
          <button onClick={() => toggleBookmark(topic.id)} aria-pressed={saved} className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"><Bookmark className={`h-4 w-4 ${saved ? 'fill-current text-[#0b5fff]' : ''}`} />{saved ? 'Сохранена' : 'Сохранить'}</button>
        </div>

        <section><h3 className="text-base font-bold">О проекте</h3><p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{topic.description}</p></section>
        <section><h3 className="text-base font-bold">Ожидаемый результат</h3><ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-slate-600 dark:text-slate-300">{topic.expectedResults.map((item) => <li key={item}>{item}</li>)}</ul></section>
        <section><h3 className="text-base font-bold">Технологии</h3><p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{topic.techStack.join(' · ')}</p></section>
        <section className="border-t border-slate-200 pt-5 dark:border-slate-700"><h3 className="text-base font-bold">Научный руководитель</h3><p className="mt-2 text-sm">{topic.supervisorName}</p>{topic.supervisorEmail && <a href={`mailto:${topic.supervisorEmail}`} className="mt-2 inline-flex items-center gap-2 text-sm text-[#0b5fff] hover:underline"><Mail className="h-4 w-4" />{topic.supervisorEmail}</a>}</section>

        {available && !user && <section className="rounded-lg border border-slate-300 bg-slate-50 p-4 dark:border-slate-700 dark:bg-[#11161f]"><h3 className="font-bold">Войдите, чтобы забронировать тему</h3><p className="mt-1 text-sm text-slate-500">Профиль автоматически подставит данные капитана команды.</p><button onClick={() => setIsAuthModalOpen(true)} className="mt-3 rounded-lg bg-[#0b5fff] px-3 py-2 text-sm font-semibold text-white">Войти через AITU</button></section>}

        {available && user && (
          <section className="border-t border-slate-200 pt-5 dark:border-slate-700">
            <div className="flex items-center justify-between gap-3"><div><h3 className="text-base font-bold">Команда</h3><p className="mt-1 text-sm text-slate-500">Капитан должен учиться в школе {topic.school}.</p></div>{members.length < Math.min(topic.maxStudents, topic.availableSlots) && <button onClick={() => setMembers((current) => [...current, emptyMember()])} className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-2.5 py-1.5 text-sm dark:border-slate-700"><Plus className="h-4 w-4" />Участник</button>}</div>
            <div className="mt-4 space-y-4">
              {members.map((member, index) => (
                <fieldset key={index} className="grid gap-3 border-t border-slate-200 pt-4 first:border-0 first:pt-0 sm:grid-cols-2 dark:border-slate-700">
                  <legend className="col-span-full mb-2 flex w-full items-center justify-between text-sm font-semibold">{index === 0 ? 'Капитан' : `Участник ${index + 1}`}{index > 0 && <button onClick={() => setMembers((current) => current.filter((_, memberIndex) => memberIndex !== index))} aria-label={`Удалить участника ${index + 1}`} className="rounded p-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"><Minus className="h-4 w-4" /></button>}</legend>
                  {(['fullName', 'studentId', 'email', 'track'] as const).map((field) => <label key={field} className="text-sm font-medium">{{ fullName: 'ФИО', studentId: 'Student ID', email: 'Почта', track: 'Программа' }[field]}<input required value={member[field]} disabled={index === 0} onChange={(event) => updateMember(index, field, event.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm disabled:bg-slate-100 dark:border-slate-700 dark:bg-[#0f131a] dark:disabled:bg-slate-800" /></label>)}
                  <label className="text-sm font-medium">Школа<select value={member.school} disabled={index === 0} onChange={(event) => updateMember(index, 'school', event.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-[#0f131a]"><option>SIS</option><option>SAIDS</option><option>SSE</option><option>SCY</option><option>SCI</option><option>SDPA</option><option>SGED</option></select></label>
                  <label className="text-sm font-medium">Роль<select value={member.role} disabled={index === 0} onChange={(event) => updateMember(index, 'role', event.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-[#0f131a]">{roles.map((role) => <option key={role}>{role}</option>)}</select></label>
                </fieldset>
              ))}
            </div>
            <label className="mt-5 block text-sm font-medium">Краткое описание идеи команды<textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={3} className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-[#0f131a]" /></label>
            {error && <p role="alert" className="mt-3 rounded-lg border border-slate-300 p-3 text-sm"><strong>Ошибка:</strong> {error}</p>}
          </section>
        )}
      </div>
    </Modal>
  );
};
