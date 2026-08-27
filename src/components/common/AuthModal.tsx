import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Modal } from './Modal';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, setIsAuthModalOpen, login } = useApp();
  const [email, setEmail] = useState('student.2026@astanait.edu.kz');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  if (!isAuthModalOpen) return null;

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    try { await login(email); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Не удалось войти.'); }
    finally { setSubmitting(false); }
  };

  return (
    <Modal title="Вход в AITU Diploma" description="Используйте корпоративную почту университета. Для демонстрации поле уже заполнено." onClose={() => setIsAuthModalOpen(false)} width="md">
      <form onSubmit={submit} className="space-y-4">
        <label className="block text-sm font-medium">Почта AITU
          <input data-modal-autofocus type="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm focus:border-[#0b5fff] focus:outline-none dark:border-slate-700 dark:bg-[#0f131a]" placeholder="student@astanait.edu.kz" />
        </label>
        {error && <p role="alert" className="rounded-lg border border-slate-300 bg-slate-50 p-3 text-sm dark:border-slate-700 dark:bg-[#11161f]"><strong>Ошибка:</strong> {error}</p>}
        <button disabled={submitting} className="w-full rounded-lg bg-[#0b5fff] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#064fcc] disabled:opacity-60">{submitting ? 'Вход…' : 'Продолжить'}</button>
      </form>
    </Modal>
  );
};
