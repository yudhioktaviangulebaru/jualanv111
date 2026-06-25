import { useState, useEffect, useRef } from 'preact/hooks';
import { useLocation } from 'preact-iso';
import { RiMenuLine, RiLogoutBoxRLine } from '@remixicon/react';
import { useAuth } from '@/auth/AuthContext';
import { titleForPath } from '@/config/nav';
import { ThemeToggle } from './ThemeToggle';

interface NavbarProps {
  onToggleSidebar: () => void;
}

export function Navbar({ onToggleSidebar }: NavbarProps) {
  const { path } = useLocation();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Tutup dropdown saat klik di luar.
  useEffect(() => {
    if (!menuOpen) return;
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [menuOpen]);

  return (
    <header class="sticky top-0 z-20 flex h-15 items-center gap-3 border-b border-line bg-surface px-5">
      <button
        class="cursor-pointer border-0 bg-transparent p-1 text-ink md:hidden"
        onClick={onToggleSidebar}
        aria-label="Buka menu"
      >
        <RiMenuLine size={22} />
      </button>

      <h1 class="m-0 text-lg font-semibold">{titleForPath(path)}</h1>

      <div class="flex-1" />

      <ThemeToggle />

      <div class="relative" ref={menuRef}>
        <button
          class="flex cursor-pointer items-center gap-2.5 rounded-full border border-transparent bg-transparent px-2 py-1.5 text-ink hover:bg-black/5 dark:hover:bg-white/5"
          onClick={() => setMenuOpen((o) => !o)}
        >
          {user?.picture ? (
            <img
              class="h-8 w-8 rounded-full object-cover"
              src={user.picture}
              alt=""
              referrerpolicy="no-referrer"
            />
          ) : (
            <span class="grid h-8 w-8 place-items-center rounded-full bg-indigo-500 text-sm font-semibold text-white">
              {(user?.name ?? user?.email ?? '?').charAt(0).toUpperCase()}
            </span>
          )}
          <span class="hidden max-w-40 overflow-hidden text-ellipsis whitespace-nowrap text-sm sm:block">
            {user?.name ?? user?.email}
          </span>
        </button>

        {menuOpen && (
          <div class="absolute right-0 top-[calc(100%+0.5rem)] min-w-50 overflow-hidden rounded-lg border border-line bg-elevated shadow-xl">
            <div class="border-b border-line px-4 py-3 text-xs break-all text-muted">
              {user?.email}
            </div>
            <button
              class="flex w-full cursor-pointer items-center gap-2.5 border-0 bg-transparent px-4 py-2.5 text-left text-sm text-ink hover:bg-black/5 dark:hover:bg-white/5"
              onClick={logout}
            >
              <RiLogoutBoxRLine size={18} />
              Keluar
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
