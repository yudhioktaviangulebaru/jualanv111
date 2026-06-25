export function NotFound() {
  return (
    <section class="flex min-h-screen flex-col items-center justify-center gap-3 p-4 text-center">
      <h1 class="m-0 text-5xl font-bold">404</h1>
      <p class="text-muted">Halaman tidak ditemukan.</p>
      <a
        class="rounded-lg bg-indigo-500 px-5 py-2.5 text-white no-underline transition-colors hover:bg-indigo-600"
        href="/"
      >
        Kembali ke Beranda
      </a>
    </section>
  );
}
