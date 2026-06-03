import { useState } from 'preact/hooks';

export function Home() {
  const [count, setCount] = useState(0);

  return (
    <section class="page">
      <h1>Selamat datang di JualanApp</h1>
      <p>Base project Preact + TypeScript siap dikembangkan.</p>

      <button class="button" onClick={() => setCount((c) => c + 1)}>
        Count: {count}
      </button>
    </section>
  );
}
