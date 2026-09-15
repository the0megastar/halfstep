import type { ReactNode } from 'react';

export interface AppShellProps {
  navActions?: ReactNode;
  children: ReactNode;
  withBottomTabs?: boolean;
}

export function AppShell({ navActions, children, withBottomTabs = false }: AppShellProps) {
  return (
    <div className={`site glyph${withBottomTabs ? ' has-bottom-tabs' : ''}`}>
      <header className="topbar" role="banner">
        <div className="topbar-inner">
          <div className="brand">
            <span className="brand-mark" aria-hidden="true">½</span>
            <span className="brand-name">
              halfstep<span className="brand-dot">.</span>
            </span>
          </div>

          <div className="nav-actions">{navActions}</div>
        </div>
      </header>

      <main className="workspace">{children}</main>
    </div>
  );
}
