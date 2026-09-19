import type { ReactNode } from 'react';

export interface AppShellProps {
  navActions?: ReactNode;
  children: ReactNode;
  withBottomTabs?: boolean;
  /** Brand mark acts as Home → Calculate (Apple/Material app-icon home pattern). */
  onBrandClick?: () => void;
}

export function AppShell({
  navActions,
  children,
  withBottomTabs = false,
  onBrandClick,
}: AppShellProps) {
  const brandInner = (
    <>
      <span className="brand-mark" aria-hidden="true">
        ½
      </span>
      <span className="brand-name">
        halfstep<span className="brand-dot">.</span>
      </span>
    </>
  );

  return (
    <div className={`site glyph${withBottomTabs ? ' has-bottom-tabs' : ''}`}>
      <header className="topbar" role="banner">
        <div className="topbar-inner">
          {onBrandClick ? (
            <button
              type="button"
              className="brand brand--button"
              onClick={onBrandClick}
              aria-label="Halfstep home, Calculate"
            >
              {brandInner}
            </button>
          ) : (
            <div className="brand">{brandInner}</div>
          )}

          <div className="nav-actions">{navActions}</div>
        </div>
      </header>

      <main className="workspace">{children}</main>
    </div>
  );
}
