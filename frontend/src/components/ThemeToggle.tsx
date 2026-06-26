import { RiSunLine, RiMoonLine } from '@remixicon/react';
import { useTheme } from '@/theme/ThemeProvider';

export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const dark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? 'Beralih ke tema terang' : 'Beralih ke tema gelap'}
      title={dark ? 'Tema terang' : 'Tema gelap'}
      class="grid h-9 w-9 cursor-pointer place-items-center rounded-lg border border-line bg-surface text-ink transition-colors hover:bg-black/5 dark:hover:bg-white/5"
    >
      {dark ? <RiSunLine size={18} /> : <RiMoonLine size={18} />}
    </button>
  );
}
