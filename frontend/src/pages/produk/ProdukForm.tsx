import { useState } from 'preact/hooks';
import type { ProductInput } from '@/types/product';
import { buttonClass, inputClass } from '@/components/ui';

interface ProdukFormProps {
  initial?: { name: string; price: number | string; sell_price: number | string };
  submitting?: boolean;
  submitLabel?: string;
  onSubmit: (values: ProductInput) => void;
  onCancel: () => void;
}

interface FieldErrors {
  name?: string;
  price?: string;
  sell_price?: string;
}

export function ProdukForm({
  initial,
  submitting = false,
  submitLabel = 'Simpan',
  onSubmit,
  onCancel,
}: ProdukFormProps) {
  const [name, setName] = useState(initial?.name ?? '');
  const [price, setPrice] = useState(
    initial?.price != null && initial.price !== '' ? String(initial.price) : '',
  );
  const [sellPrice, setSellPrice] = useState(
    initial?.sell_price != null && initial.sell_price !== ''
      ? String(initial.sell_price)
      : '',
  );
  const [errors, setErrors] = useState<FieldErrors>({});

  const handleSubmit = (e: Event) => {
    e.preventDefault();
    const errs: FieldErrors = {};

    if (!name.trim()) errs.name = 'Nama wajib diisi.';

    const p = Number(price);
    if (price === '' || Number.isNaN(p) || p < 0)
      errs.price = 'Harga modal harus angka ≥ 0.';

    const s = Number(sellPrice);
    if (sellPrice === '' || Number.isNaN(s) || s < 0)
      errs.sell_price = 'Harga jual harus angka ≥ 0.';

    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    onSubmit({ name: name.trim(), price: p, sell_price: s });
  };

  return (
    <form class="flex flex-col gap-5" onSubmit={handleSubmit} novalidate>
      <div>
        <label class="mb-1.5 block text-sm font-medium" for="name">
          Nama produk
        </label>
        <input
          id="name"
          class={inputClass}
          value={name}
          onInput={(e) => setName((e.target as HTMLInputElement).value)}
          placeholder="mis. Kopi Susu"
          disabled={submitting}
        />
        {errors.name && <p class="mt-1 text-sm text-red-400">{errors.name}</p>}
      </div>

      <div class="grid gap-5 sm:grid-cols-2">
        <div>
          <label class="mb-1.5 block text-sm font-medium" for="price">
            Harga modal (Rp)
          </label>
          <input
            id="price"
            type="number"
            min="0"
            inputMode="numeric"
            class={inputClass}
            value={price}
            onInput={(e) => setPrice((e.target as HTMLInputElement).value)}
            placeholder="0"
            disabled={submitting}
          />
          {errors.price && (
            <p class="mt-1 text-sm text-red-400">{errors.price}</p>
          )}
        </div>

        <div>
          <label class="mb-1.5 block text-sm font-medium" for="sell_price">
            Harga jual (Rp)
          </label>
          <input
            id="sell_price"
            type="number"
            min="0"
            inputMode="numeric"
            class={inputClass}
            value={sellPrice}
            onInput={(e) => setSellPrice((e.target as HTMLInputElement).value)}
            placeholder="0"
            disabled={submitting}
          />
          {errors.sell_price && (
            <p class="mt-1 text-sm text-red-400">{errors.sell_price}</p>
          )}
        </div>
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
