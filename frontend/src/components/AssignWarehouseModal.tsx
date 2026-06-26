import { useMemo, useState } from 'preact/hooks';
import { listWarehouses } from '@/api/warehouse';
import { useAsync } from '@/hooks/useAsync';
import { useAssignWarehouse } from '@/hooks/useStocks';
import { useToast } from '@/components/toast/ToastProvider';
import { Modal } from './Modal';
import { buttonClass, inputClass, Spinner, ErrorState } from './ui';
import type { Product } from '@/types/product';

interface AssignWarehouseModalProps {
  product: Pick<Product, 'id' | 'name'>;
  /** Gudang yang sudah tertaut — disembunyikan dari pilihan. */
  assignedWarehouseIds?: Array<string | number>;
  onClose: () => void;
  /** Dipanggil setelah berhasil menautkan (mis. untuk reload daftar). */
  onAssigned?: () => void;
}

/** Modal "Assign Warehouse": pilih gudang lalu tautkan ke product (stok 0). */
export function AssignWarehouseModal({
  product,
  assignedWarehouseIds = [],
  onClose,
  onAssigned,
}: AssignWarehouseModalProps) {
  const toast = useToast();
  const { data: warehouses, loading, error, reload } = useAsync(listWarehouses, []);
  const { assign, submitting, error: assignError } = useAssignWarehouse();

  const [warehouseId, setWarehouseId] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const assignedSet = useMemo(
    () => new Set(assignedWarehouseIds.map(String)),
    [assignedWarehouseIds],
  );
  const options = useMemo(
    () => (warehouses ?? []).filter((w) => !assignedSet.has(String(w.id))),
    [warehouses, assignedSet],
  );

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    if (!warehouseId) {
      setValidationError('Silakan pilih gudang.');
      return;
    }
    setValidationError(null);
    try {
      await assign(product.id, warehouseId);
      toast.success('Gudang berhasil ditautkan.');
      onAssigned?.();
      onClose();
    } catch {
      // Pesan kegagalan ditampilkan lewat `assignError`.
    }
  };

  return (
    <Modal title="Assign Warehouse" onClose={onClose}>
      <p class="mt-0 mb-4 text-sm text-muted">
        Tautkan <span class="font-medium text-ink">{product.name}</span> ke sebuah
        gudang.
      </p>

      {loading ? (
        <Spinner />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : (
        <form class="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div>
            <label class="mb-1.5 block text-sm font-medium" for="warehouse">
              Pilih gudang
            </label>
            <select
              id="warehouse"
              class={inputClass}
              value={warehouseId}
              onChange={(e) =>
                setWarehouseId((e.target as HTMLSelectElement).value)
              }
              disabled={submitting || options.length === 0}
            >
              <option value="">— Pilih gudang —</option>
              {options.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </select>
            {options.length === 0 && (
              <p class="mt-1 text-sm text-muted">
                Semua gudang sudah tertaut ke produk ini.
              </p>
            )}
          </div>

          {(validationError || assignError) && (
            <p class="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">
              {validationError ?? assignError}
            </p>
          )}

          <div class="flex justify-end gap-3 pt-1">
            <button
              type="button"
              class={buttonClass('outline')}
              onClick={onClose}
              disabled={submitting}
            >
              Batal
            </button>
            <button
              type="submit"
              class={buttonClass('primary')}
              disabled={submitting || options.length === 0}
            >
              {submitting ? 'Menautkan…' : 'Assign'}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
