import { useMemo, useState } from 'preact/hooks';
import { useAuth } from '@/auth/AuthContext';
import { normalizeRole, creatableRoles } from '@/auth/permissions';
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
  worksheet_url?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Form tambah pengguna. Role yang bisa dipilih bergantung pada role pembuat:
 * - Admin boleh menambah owner/kasir/gudang dan WAJIB mengisi link spreadsheet
 *   toko (worksheet_url) tujuan.
 * - Owner boleh menambah kasir/gudang; worksheet_url-nya diisi otomatis dari
 *   worksheet Owner (lihat useCreateUser) sehingga field disembunyikan.
 */
export function PenggunaForm({
  submitting = false,
  submitLabel = 'Simpan',
  onSubmit,
  onCancel,
}: PenggunaFormProps) {
  const { user } = useAuth();
  const creatorRole = normalizeRole(user?.role);
  const roleOptions = useMemo(() => creatableRoles(creatorRole), [creatorRole]);
  const isAdmin = creatorRole === 'admin';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<string>(roleOptions[0]?.value ?? 'kasir');
  const [worksheetUrl, setWorksheetUrl] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});

  const handleSubmit = (e: Event) => {
    e.preventDefault();
    const errs: FieldErrors = {};
    if (!name.trim()) errs.name = 'Nama wajib diisi.';
    if (!EMAIL_RE.test(email.trim())) errs.email = 'Email tidak valid.';
    // Admin menentukan toko tujuan lewat link spreadsheet.
    if (isAdmin && !worksheetUrl.trim())
      errs.worksheet_url = 'Link spreadsheet toko wajib diisi.';

    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    onSubmit({
      name: name.trim(),
      email: email.trim(),
      role,
      // Hanya admin yang mengirim worksheet_url; owner dibiarkan kosong agar
      // backend mengisinya otomatis dari worksheet Owner.
      ...(isAdmin ? { worksheet_url: worksheetUrl.trim() } : {}),
    });
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
          {roleOptions.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>
      </div>

      {isAdmin && (
        <div>
          <label class="mb-1.5 block text-sm font-medium" for="worksheet_url">
            Link spreadsheet toko
          </label>
          <input
            id="worksheet_url"
            class={inputClass}
            value={worksheetUrl}
            onInput={(e) => setWorksheetUrl((e.target as HTMLInputElement).value)}
            placeholder="https://docs.google.com/spreadsheets/d/…"
            disabled={submitting}
          />
          <p class="mt-1 text-xs text-muted">
            {role === 'owner'
              ? 'Spreadsheet milik toko Owner baru ini.'
              : 'Spreadsheet toko (milik Owner) tempat user ini bekerja.'}
          </p>
          {errors.worksheet_url && (
            <p class="mt-1 text-sm text-red-400">{errors.worksheet_url}</p>
          )}
        </div>
      )}

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
