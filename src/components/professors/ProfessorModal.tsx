import React, { useState } from 'react';
import { Copy, Mail, MapPin, Phone, Send } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../common/Modal';

export const ProfessorModal: React.FC = () => {
  const { selectedProfessor, setSelectedProfessor } = useApp();
  const [copied, setCopied] = useState(false);
  if (!selectedProfessor) return null;
  const professor = selectedProfessor;
  const copy = async () => { await navigator.clipboard.writeText(professor.email); setCopied(true); window.setTimeout(() => setCopied(false), 1800); };

  return (
    <Modal title={professor.name} description={`${professor.position} · ${professor.department}`} onClose={() => setSelectedProfessor(null)} footer={<><button onClick={() => setSelectedProfessor(null)} className="rounded-lg px-4 py-2 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800">Закрыть</button><a href={`mailto:${professor.email}?subject=Дипломное руководство`} className="inline-flex items-center gap-2 rounded-lg bg-[#0b5fff] px-4 py-2 text-sm font-semibold text-white"><Mail className="h-4 w-4" />Написать</a></>}>
      <div className="space-y-7">
        <p className={`text-sm font-semibold ${professor.freeSlots > 0 ? 'text-[#087443] dark:text-[#65d49b]' : 'text-slate-500'}`}>{professor.freeSlots > 0 ? `${professor.freeSlots} из ${professor.totalSlots} мест свободно` : 'Свободных мест для новых команд нет'}</p>
        <section><h3 className="text-base font-bold">Научные интересы</h3><p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{professor.interests.join(' · ') || 'Информация уточняется'}</p></section>
        {professor.courses.length > 0 && <section><h3 className="text-base font-bold">Дисциплины</h3><ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-600 dark:text-slate-300">{professor.courses.map((course) => <li key={course}>{course}</li>)}</ul></section>}
        <section className="border-t border-slate-200 pt-5 dark:border-slate-700"><h3 className="text-base font-bold">Контакты</h3><div className="mt-3 space-y-3 text-sm">
          <div className="flex flex-wrap items-center gap-2"><Mail className="h-4 w-4 text-slate-500" /><a href={`mailto:${professor.email}`} className="text-[#0b5fff] hover:underline">{professor.email}</a><button onClick={() => void copy()} className="rounded p-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="Скопировать почту"><Copy className="h-4 w-4" /></button>{copied && <span className="text-xs text-slate-500">Скопировано</span>}</div>
          {professor.telegram && <a href={`https://t.me/${professor.telegram.replace('@', '')}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-[#0b5fff] hover:underline"><Send className="h-4 w-4 text-slate-500" />{professor.telegram}</a>}
          {professor.phone && <p className="flex items-center gap-2"><Phone className="h-4 w-4 text-slate-500" />{professor.phone}</p>}
          {professor.office && <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-slate-500" />{professor.office}</p>}
        </div></section>
      </div>
    </Modal>
  );
};
