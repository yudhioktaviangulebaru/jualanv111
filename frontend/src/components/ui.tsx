import type { ComponentChildren } from 'preact';
import { RiLoader4Line, RiErrorWarningLine, RiInboxLine } from '@remixicon/react';

export type ButtonVariant = 'primary' | 'outline' | 'danger' | 'ghost';

const VARIANTS: Record<ButtonVariant, string> = {
  primary: 'bg-indigo-500 text-white hover:bg-indigo-600',
  outline: 'border border-line text-ink hover:bg-black/5 dark:hover:bg-white/5',
  danger: 'bg-red-500 text-white hover:bg-red-600',
  ghost: 'text-ink hover:bg-black/5 dark:hover:bg-white/5',
};

/** Class tombol konsisten — pakai di <button> maupun <a>. */
export function buttonClass(variant: ButtonVariant = 'primary', extra = ''): string {
  return `inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium no-underline transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${VARIANTS[variant]} ${extra}`.trim();
}

/** Class input/textarea/select konsisten. */
export const inputClass =
  'w-full rounded-lg border border-line bg-canvas px-3 py-2 text-ink outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30';

export function Card({
  children,
  class: extra = '',
}: {
  children: ComponentChildren;
  class?: string;
}) {
  return (
    <div class={`rounded-lg border border-line bg-surface ${extra}`}>{children}</div>
  );
}

export function Spinner({ label = 'Memuat…' }: { label?: string }) {
  return (
    <div class="flex items-center justify-center gap-2 py-12 text-muted">
      <RiLoader4Line size={20} className="animate-spin" />
      <span>{label}</span>
    </div>
  );
}

export function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div class="flex flex-col items-center justify-center gap-3 py-12 text-center">
      <RiErrorWarningLine size={36} className="text-red-400" />
      <p class="m-0 text-muted">{message}</p>
      {onRetry && (
        <button class={buttonClass('outline')} onClick={onRetry}>
          Coba lagi
        </button>
      )}
    </div>
  );
}

export function EmptyState({
  message,
  children,
}: {
  message: string;
  children?: ComponentChildren;
}) {
  return (
    <div class="flex flex-col items-center justify-center gap-3 py-12 text-center">
      <RiInboxLine size={36} className="text-muted" />
      <p class="m-0 text-muted">{message}</p>
      {children}
    </div>
  );
}
