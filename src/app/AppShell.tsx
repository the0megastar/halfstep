import React, { type ReactNode } from 'react';

export interface AppShellProps {
  navActions?: ReactNode;
  children: ReactNode;
}

export function AppShell({ navActions, children }: AppShellProps) {
  return (
    <div className="site glyph">
      {/* Top navigation bar */}
      <header className="topbar" role="banner">
        <div className="topbar-inner">
          <div className="brand">
            <span className="brand-mark" aria-hidden="true">½</span>
            <span className="brand-name">
              halfstep<span className="brand-dot">.</span>
            </span>
          </div>

          <div className="nav-actions">
            {navActions}
          </div>
        </div>
      </header>

      {/* Main content container */}
      <main className="workspace">
        {children}
      </main>
    </div>
  );
}
