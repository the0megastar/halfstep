import type { ReactNode } from 'react';

export interface PageHeaderProps {
  /** Page title — string or rich node (e.g. name + accent dot). */
  title: ReactNode;
  /** One muted supporting sentence under the title. */
  intro: string;
  /** Optional id for the h1 (Settings aria-labelledby, etc.). */
  titleId?: string;
  className?: string;
}

/**
 * Shared tab-root header: title + muted intro.
 * Use on Calculate, History, Settings (and any future tab) so left edge,
 * type, and spacing stay identical without copy-pasting markup.
 */
export function PageHeader({ title, intro, titleId, className = '' }: PageHeaderProps) {
  return (
    <header className={`page-header${className ? ` ${className}` : ''}`}>
      <div className="page-header-text">
        <h1 id={titleId} className="page-header-title">
          {title}
        </h1>
        <p className="page-header-intro text-copy-14">{intro}</p>
      </div>
    </header>
  );
}
