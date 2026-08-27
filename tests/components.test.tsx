// @vitest-environment happy-dom
import React from 'react';
import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Modal } from '../src/components/common/Modal';
import { Header } from '../src/components/layout/Header';
import { AppProvider } from '../src/context/AppContext';

describe('accessible interface components', () => {
  beforeEach(() => {
    localStorage.clear();
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockReturnValue({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() })
    });
    Object.defineProperty(window, 'scrollTo', { writable: true, value: vi.fn() });
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('exposes modal semantics, closes with Escape and restores focus', () => {
    const close = vi.fn();
    const trigger = document.createElement('button');
    trigger.textContent = 'Открыть';
    document.body.appendChild(trigger);
    trigger.focus();
    const { unmount } = render(<Modal title="Проверка" description="Описание" onClose={close}><button>Действие</button></Modal>);
    const dialog = screen.getByRole('dialog', { name: 'Проверка' });
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAccessibleDescription('Описание');
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(close).toHaveBeenCalledOnce();
    unmount();
    expect(trigger).toHaveFocus();
    trigger.remove();
  });

  it('renders semantic tabs and changes the active navigation item', async () => {
    vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      const payload = url.includes('/topics') ? { total: 0, topics: [] }
        : url.includes('/professors') ? { total: 0, professors: [] }
          : [];
      return new Response(JSON.stringify(payload), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }));
    render(<AppProvider><Header /></AppProvider>);
    const topics = await screen.findByRole('tab', { name: 'Темы' });
    const roadmap = screen.getByRole('tab', { name: 'План работы' });
    expect(topics).toHaveAttribute('aria-selected', 'true');
    fireEvent.click(roadmap);
    await waitFor(() => expect(roadmap).toHaveAttribute('aria-selected', 'true'));
    expect(topics).toHaveAttribute('aria-selected', 'false');
  });
});
