import type { ComponentChildren } from 'preact';
import { useLocation } from 'preact-iso';

interface LayoutProps {
  children: ComponentChildren;
}

export function Layout({ children }: LayoutProps) {
  const { path } = useLocation();

  return (
    <div class="layout">
      <header class="layout__header">
        <a href="/" class="layout__brand">
          JualanApp
        </a>
        <nav class="layout__nav">
          <a href="/" aria-current={path === '/' ? 'page' : undefined}>
            Home
          </a>
        </nav>
      </header>
      <main class="layout__main">{children}</main>
    </div>
  );
}
