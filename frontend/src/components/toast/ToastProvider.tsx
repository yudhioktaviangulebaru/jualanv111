import { createContext } from 'preact';
import { useContext, useState, useCallback, useMemo, useRef } from 'preact/hooks';
import type { ComponentChildren } from 'preact';
import {
  RiCheckboxCircleFill,
  RiErrorWarningFill,
  RiInformationFill,
  RiCloseLine,
} from '@remixicon/react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastApi {
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastApi | null>(null);

const ICONS = {
  success: RiCheckboxCircleFill,
  error: RiErrorWarningFill,
  info: RiInformationFill,
} as const;

const ACCENT = {
  success: 'text-emerald-500',
  error: 'text-red-500',
  info: 'text-indigo-500',
} as const;

const DURATION = 3500;

export function ToastProvider({ children }: { children: ComponentChildren }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const idRef = useRef(0);

  const remove = useCallback((id: number) => {
    setToasts((list) => list.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (message: string, type: ToastType) => {
      const id = ++idRef.current;
      setToasts((list) => [...list, { id, message, type }]);
      setTimeout(() => remove(id), DURATION);
    },
    [remove],
  );

  const api = useMemo<ToastApi>(
    () => ({
      success: (m) => push(m, 'success'),
      error: (m) => push(m, 'error'),
      info: (m) => push(m, 'info'),
    }),
    [push],
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div class="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex flex-col items-center gap-2 p-4 sm:items-end">
        {toasts.map((t) => {
          const Icon = ICONS[t.type];
          return (
            <div
              key={t.id}
              role="status"
              class="animate-toast-in pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-lg border border-line bg-elevated px-4 py-3 shadow-xl"
            >
              <Icon size={20} className={`mt-0.5 shrink-0 ${ACCENT[t.type]}`} />
              <p class="m-0 flex-1 text-sm text-ink">{t.message}</p>
              <button
                onClick={() => remove(t.id)}
                class="shrink-0 text-muted hover:text-ink"
                aria-label="Tutup"
              >
                <RiCloseLine size={18} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return ctx;
}
