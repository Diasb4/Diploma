import React from 'react';
import { Check } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { schoolsList } from '../../services/dataService';
import { Modal } from './Modal';

export const SchoolSelectModal: React.FC = () => {
  const { isSchoolModalOpen, setIsSchoolModalOpen, studentSchool, setStudentSchool, topics } = useApp();
  if (!isSchoolModalOpen) return null;

  const select = (school: string | null) => {
    setStudentSchool(school);
    setIsSchoolModalOpen(false);
  };

  return (
    <Modal title="Выберите свою школу" description="Каталог сразу откроет темы вашей образовательной программы." onClose={() => setIsSchoolModalOpen(false)} width="md" footer={<button onClick={() => select(null)} className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800">Смотреть все школы</button>}>
      <div className="space-y-2">
        {schoolsList.filter((school) => school.id !== 'ALL').map((school) => {
          const selected = studentSchool === school.id;
          const count = topics.filter((topic) => topic.school === school.id).length;
          return (
            <button key={school.id} onClick={() => select(school.id)} aria-pressed={selected} className={`flex w-full items-center justify-between gap-4 rounded-lg border p-3 text-left transition-colors duration-150 ${selected ? 'border-[#0b5fff] bg-[#eef4ff] dark:bg-[#1b2b49]' : 'border-slate-200 hover:border-slate-400 dark:border-slate-700 dark:hover:border-slate-500'}`}>
              <span><span className="block text-sm font-semibold">{school.code} · {school.shortName}</span><span className="mt-0.5 block text-xs text-slate-500 dark:text-slate-400">{count} тем</span></span>
              {selected && <Check className="h-5 w-5 text-[#0b5fff]" />}
            </button>
          );
        })}
      </div>
    </Modal>
  );
};
