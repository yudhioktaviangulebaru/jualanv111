import type { ComponentChildren } from 'preact';
import { useEffect } from 'preact/hooks';
import { RiCloseLine } from '@remixicon/react';

interface ModalProps {
  title: string;
  onClose: () => void;
  children: ComponentChildren;
}

/** Dialog overlay sederhana — tutup via tombol ✕, klik backdrop, atau Escape. */
export function Modal({ title, onClose, children }: ModalProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      class="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        class="w-full max-w-md rounded-lg border border-line bg-surface shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div class="flex items-center justify-between border-b border-line px-5 py-4">
          <h3 class="m-0 text-lg font-semibold">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            class="text-muted hover:text-ink"
            aria-label="Tutup"
          >
            <RiCloseLine size={20} />
          </button>
        </div>
        <div class="p-5">{children}</div>
      </div>
    </div>
  );
}
