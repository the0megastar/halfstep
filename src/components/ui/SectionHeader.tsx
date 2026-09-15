import type { ReactNode } from 'react';

export interface SectionHeaderProps {
  children: ReactNode;
  className?: string;
  id?: string;
  as?: 'h2' | 'h3' | 'h4' | 'span' | 'div';
}

/**
 * Standard SectionHeader component conforming to Halfstep SECTION_HEADERS.md:
 * - Uses .text-heading-14 (14px font, 20px line-height, 600 SemiBold)
 * - High-contrast text: var(--text-main)
 * - Title Case hierarchy
 */
export function SectionHeader({
  children,
  className = '',
  id,
  as: Component = 'span',
}: SectionHeaderProps) {
  return (
    <Component
      id={id}
      className={`text-heading-14 section-header ${className}`.trim()}
    >
      {children}
    </Component>
  );
}
