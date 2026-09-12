import { useLayoutEffect, useState, type CSSProperties, type RefObject } from 'react';

export interface UseDropdownBoundaryOptions {
  isOpen: boolean;
  triggerRef: RefObject<HTMLElement | null>;
  preferredWidth?: number;
  margin?: number;
}

/**
 * Standard Halfstep Dropdown Boundary Clamping Hook
 * 
 * Ensures all dropdowns and popovers center under their trigger on desktop
 * while strictly checking viewport boundaries on mobile to prevent cut-off edges.
 * 
 * Clamps panel within [margin, viewportWidth - margin].
 * Accounts for safe areas and visual viewport changes (e.g. mobile keyboards).
 */
export function useDropdownBoundary({
  isOpen,
  triggerRef,
  preferredWidth = 336,
  margin = 12,
}: UseDropdownBoundaryOptions): CSSProperties {
  const [style, setStyle] = useState<CSSProperties>({});

  useLayoutEffect(() => {
    if (!isOpen) return;

    const updatePosition = () => {
      const trigger = triggerRef.current;
      if (!trigger) return;

      const triggerRect = trigger.getBoundingClientRect();
      const viewportWidth =
        window.visualViewport?.width ||
        document.documentElement.clientWidth ||
        window.innerWidth;
      const panelWidth = Math.min(preferredWidth, viewportWidth - margin * 2);

      // Desired position: centered horizontally under the trigger
      const triggerCenter = triggerRect.left + triggerRect.width / 2;
      let targetLeft = triggerCenter - panelWidth / 2;

      // Strict boundary check & clamp against viewport edges
      if (targetLeft < margin) {
        targetLeft = margin;
      } else if (targetLeft + panelWidth > viewportWidth - margin) {
        targetLeft = viewportWidth - margin - panelWidth;
      }

      // Convert target global position to local offset relative to trigger
      const relativeLeft = Math.round(targetLeft - triggerRect.left);

      setStyle({
        left: `${relativeLeft}px`,
        right: 'auto',
        transform: 'none',
        width: `${panelWidth}px`,
        maxWidth: `calc(100vw - ${margin * 2}px)`,
        maxHeight: `calc(100dvh - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px) - 80px)`,
        overflowY: 'auto',
        overscrollBehavior: 'contain',
        boxSizing: 'border-box',
      });
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, { passive: true });

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', updatePosition);
      window.visualViewport.addEventListener('scroll', updatePosition);
    }

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', updatePosition);
        window.visualViewport.removeEventListener('scroll', updatePosition);
      }
    };
  }, [isOpen, triggerRef, preferredWidth, margin]);

  return style;
}
