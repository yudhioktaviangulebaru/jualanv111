import { useState } from 'preact/hooks';
import { useLocation } from 'preact-iso';
import { useAuth } from '@/auth/AuthContext';
import { GoogleSignInButton } from '@/components/GoogleSignInButton';
import { LoginDoodle } from '@/components/LoginDoodle';
import { ThemeToggle } from '@/components/ThemeToggle';
import { ApiError } from '@/api/client';

export function Login() {
  const { user, loginWithGoogle } = useAuth();
  const { route } = useLocation();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  // Already signed in: send them home.
  if (user) {
    route('/', true);
    return null;
  }

  const handleCredential = async (idToken: string) => {
    setPending(true);
    setError(null);
    try {
      await loginWithGoogle(idToken);
      route('/', true);
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'Login gagal, coba lagi.';
      setError(message);
    } finally {
      setPending(false);
    }
  };

  return (
    <section class="relative flex min-h-screen items-center justify-center overflow-hidden p-4">
      <LoginDoodle />

      <div class="absolute top-4 right-4 z-20">
        <ThemeToggle />
      </div>

      <div class="relative z-10 w-full max-w-sm rounded-2xl border border-line bg-surface px-8 py-10 text-center shadow-xl">
        <div class="mx-auto mb-5 grid h-12 w-12 place-items-center rounded-xl bg-indigo-500 text-lg font-bold text-white">
          JA
        </div>
        <h1 class="mb-2 text-2xl font-semibold">Masuk ke JualanApp</h1>
        <p class="mb-7 text-muted">Gunakan akun Google Anda untuk melanjutkan.</p>

        <div class="flex min-h-11 justify-center">
          <GoogleSignInButton onCredential={handleCredential} />
        </div>

        {pending && <p class="mt-4 text-muted">Memproses…</p>}
        {error && <p class="mt-4 text-red-400">{error}</p>}
      </div>
    </section>
  );
}
