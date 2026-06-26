import { useLocation } from 'preact-iso';
import { NAV_ITEMS } from '@/config/nav';
import { usePermissions } from '@/hooks/usePermissions';

interface SidebarProps {
  open: boolean;
  onNavigate: () => void;
}

export function Sidebar({ open, onNavigate }: SidebarProps) {
  const { path } = useLocation();
  const { can } = usePermissions();
  const items = NAV_ITEMS.filter((item) => can(item.menu));

  return (
    <aside
      class={`fixed top-0 z-40 flex h-screen w-62 flex-shrink-0 flex-col border-r border-line bg-elevated transition-transform md:sticky md:translate-x-0 ${
        open ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div class="flex h-15 items-center gap-2.5 border-b border-line px-5">
        <span class="grid h-8 w-8 place-items-center rounded-lg bg-indigo-500 text-sm font-bold text-white">
          JA
        </span>
        <span class="text-lg font-bold">JualanApp</span>
      </div>

      <nav class="flex flex-1 flex-col gap-1 p-3">
        {items.map(({ path: to, label, icon: Icon }) => {
          const active = path === to;
          return (
            <a
              key={to}
              href={to}
              aria-current={active ? 'page' : undefined}
              onClick={onNavigate}
              class={`flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-[0.95rem] no-underline transition-colors ${
                active
                  ? 'bg-indigo-500 text-white hover:bg-indigo-600'
                  : 'text-muted hover:bg-black/5 hover:text-ink dark:hover:bg-white/5'
              }`}
            >
              <Icon size={20} className="shrink-0" />
              <span>{label}</span>
            </a>
          );
        })}
      </nav>

      <div class="border-t border-line px-5 py-4 text-xs text-muted">
        v0.0.0
      </div>
    </aside>
  );
}
