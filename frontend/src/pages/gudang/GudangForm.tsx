import { useState } from 'preact/hooks';
import type { WarehouseInput } from '@/types/warehouse';
import { buttonClass, inputClass } from '@/components/ui';

interface GudangFormProps {
  initial?: { name: string };
  submitting?: boolean;
  submitLabel?: string;
  onSubmit: (values: WarehouseInput) => void;
  onCancel: () => void;
}

export function GudangForm({
  initial,
  submitting = false,
  submitLabel = 'Simpan',
  onSubmit,
  onCancel,
}: GudangFormProps) {
  const [name, setName] = useState(initial?.name ?? '');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: Event) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Nama wajib diisi.');
      return;
    }
    setError(null);
    onSubmit({ name: name.trim() });
  };

  return (
    <form class="flex flex-col gap-5" onSubmit={handleSubmit} novalidate>
      <div>
        <label class="mb-1.5 block text-sm font-medium" for="name">
          Nama gudang
        </label>
        <input
          id="name"
          class={inputClass}
          value={name}
          onInput={(e) => setName((e.target as HTMLInputElement).value)}
          placeholder="mis. Gudang Pusat"
          disabled={submitting}
        />
        {error && <p class="mt-1 text-sm text-red-400">{error}</p>}
      </div>

      <div class="flex gap-3 pt-2">
        <button type="submit" class={buttonClass('primary')} disabled={submitting}>
          {submitting ? 'Menyimpan…' : submitLabel}
        </button>
        <button
          type="button"
          class={buttonClass('outline')}
          onClick={onCancel}
          disabled={submitting}
        >
          Batal
        </button>
      </div>
    </form>
  );
}
