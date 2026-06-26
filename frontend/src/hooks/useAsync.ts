import { useState, useEffect, useCallback, useRef } from 'preact/hooks';
import { ApiError } from '@/api/client';

interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

/**
 * Jalankan async function dan lacak loading/error/data, dengan `reload()`.
 * Otomatis dijalankan saat mount dan saat `deps` berubah.
 */
export function useAsync<T>(fn: () => Promise<T>, deps: unknown[] = []) {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  const fnRef = useRef(fn);
  fnRef.current = fn;

  const reload = useCallback(() => {
    setState((s) => ({ ...s, loading: true, error: null }));
    fnRef
      .current()
      .then((data) => setState({ data, loading: false, error: null }))
      .catch((e) =>
        setState({
          data: null,
          loading: false,
          error: e instanceof ApiError ? e.message : 'Terjadi kesalahan',
        }),
      );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    reload();
  }, [reload]);

  return { ...state, reload };
}
