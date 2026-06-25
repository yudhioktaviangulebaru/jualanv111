import { useState } from 'preact/hooks';
import { ROLE_OPTIONS } from '@/auth/permissions';
import { buttonClass, inputClass } from '@/components/ui';
import type { UserInput } from '@/types/auth';

interface PenggunaFormProps {
  submitting?: boolean;
  submitLabel?: string;
  onSubmit: (values: UserInput) => void;
  onCancel: () => void;
}

interface FieldErrors {
  name?: string;
  email?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Form tambah pengguna. Catatan: worksheet_url sengaja TIDAK ada di sini —
 * diisi otomatis dari user yang mendaftarkan (lihat useCreateUser).
 */
export function PenggunaForm({
  submitting = false,
  submitLabel = 'Simpan',
  onSubmit,
  onCancel,
}: PenggunaFormProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<string>(ROLE_OPTIONS[0].value);
  const [errors, setErrors] = useState<FieldErrors>({});

  const handleSubmit = (e: Event) => {
    e.preventDefault();
    const errs: FieldErrors = {};
    if (!name.trim()) errs.name = 'Nama wajib diisi.';
    if (!EMAIL_RE.test(email.trim())) errs.email = 'Email tidak valid.';

    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    onSubmit({ name: name.trim(), email: email.trim(), role });
  };

  return (
    <form class="flex flex-col gap-5" onSubmit={handleSubmit} novalidate>
      <div>
        <label class="mb-1.5 block text-sm font-medium" for="name">
          Nama
        </label>
        <input
          id="name"
          class={inputClass}
          value={name}
          onInput={(e) => setName((e.target as HTMLInputElement).value)}
          placeholder="mis. Budi Santoso"
          disabled={submitting}
        />
        {errors.name && <p class="mt-1 text-sm text-red-400">{errors.name}</p>}
      </div>

      <div>
        <label class="mb-1.5 block text-sm font-medium" for="email">
          Email
        </label>
        <input
          id="email"
          type="email"
          class={inputClass}
          value={email}
          onInput={(e) => setEmail((e.target as HTMLInputElement).value)}
          placeholder="mis. budi@gmail.com"
          disabled={submitting}
        />
        {errors.email && <p class="mt-1 text-sm text-red-400">{errors.email}</p>}
      </div>

      <div>
        <label class="mb-1.5 block text-sm font-medium" for="role">
          Role
        </label>
        <select
          id="role"
          class={inputClass}
          value={role}
          onChange={(e) => setRole((e.target as HTMLSelectElement).value)}
          disabled={submitting}
        >
          {ROLE_OPTIONS.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>
      </div>

      <div class="flex gap-3 pt-1">
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
