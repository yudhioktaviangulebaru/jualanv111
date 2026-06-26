import { useEffect, useRef, useState } from 'preact/hooks';
import { RiGoogleFill } from '@remixicon/react';
import { loadGsi } from '@/lib/gsi';
import type { CredentialResponse } from '@/types/google-accounts';

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? '';

interface GoogleSignInButtonProps {
  /** Called with the Google ID token (JWT) when the user signs in. */
  onCredential: (idToken: string) => void;
}

/**
 * Tombol login outline custom dengan ikon Remix.
 *
 * GIS hanya mengeluarkan id_token lewat tombol yang dia render sendiri, jadi
 * tombol Google asli di-render transparan lalu ditumpuk persis di atas tombol
 * tampilan kita. Klik user mengenai tombol Google → callback id_token jalan.
 */
export function GoogleSignInButton({ onCredential }: GoogleSignInButtonProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  // Keep the latest callback without re-initializing GIS on every render.
  const callbackRef = useRef(onCredential);
  callbackRef.current = onCredential;

  useEffect(() => {
    if (!CLIENT_ID) {
      setError('ERR something');
      return;
    }

    let cancelled = false;

    loadGsi()
      .then(() => {
        if (cancelled || !overlayRef.current || !window.google) return;

        window.google.accounts.id.initialize({
          client_id: CLIENT_ID,
          callback: (res: CredentialResponse) => callbackRef.current(res.credential),
          cancel_on_tap_outside: false,
        });

        // Lebar tombol Google disamakan dengan tombol tampilan agar menutupi penuh.
        const width = wrapRef.current?.offsetWidth ?? 320;
        window.google.accounts.id.renderButton(overlayRef.current, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          text: 'continue_with',
          width,
        });
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Gagal memuat Google Sign-In');
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (error) return <p class="mt-4 text-red-400">{error}</p>;

  return (
    <div ref={wrapRef} class="relative w-full">
      <button
        type="button"
        class="flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-line bg-transparent px-4 text-ink transition-colors hover:bg-black/5 dark:hover:bg-white/5"
      >
        <RiGoogleFill size={20} />
        <span>Masuk dengan Google</span>
      </button>

      {/* Tombol Google asli (transparan) menutupi tombol di atas. */}
      <div
        ref={overlayRef}
        class="absolute inset-0 z-10 overflow-hidden opacity-0"
        aria-hidden="true"
      />
    </div>
  );
}
