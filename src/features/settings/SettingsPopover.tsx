import { useRef, useEffect, useState } from 'react';
import { SlidersHorizontal, Lock } from 'lucide-react';
import { useDropdownBoundary } from '../../hooks/useDropdownBoundary';
import { ROMAN } from '../../../lib/dose';

export interface SettingsPopoverProps {
  isOpen?: boolean;
  onToggle?: () => void;
  onClose?: () => void;
}

export function SettingsPopover({
  isOpen: controlledIsOpen,
  onToggle: controlledOnToggle,
  onClose: controlledOnClose,
}: SettingsPopoverProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isControlled = controlledIsOpen !== undefined;
  const isOpen = isControlled ? controlledIsOpen : internalIsOpen;

  const toggle = () => {
    if (isControlled && controlledOnToggle) {
      controlledOnToggle();
    } else {
      setInternalIsOpen((prev) => !prev);
    }
  };

  const close = () => {
    if (isControlled && controlledOnClose) {
      controlledOnClose();
    } else {
      setInternalIsOpen(false);
    }
  };

  const wrapperRef = useRef<HTMLDivElement>(null);
  const panelStyle = useDropdownBoundary({
    isOpen,
    triggerRef: wrapperRef,
    preferredWidth: 330,
    margin: 12,
  });

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent | PointerEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        close();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        close();
      }
    };

    document.addEventListener('pointerdown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div className="settings-dropdown-wrapper" ref={wrapperRef}>
      <button
        type="button"
        className={`nav-btn settings-toggle-btn ${isOpen ? 'active' : ''}`}
        onClick={toggle}
        title="Prescribed clinical settings (Locked)"
        aria-label="Prescribed clinical settings (Locked)"
        aria-expanded={isOpen}
        aria-haspopup="dialog"
      >
        <SlidersHorizontal size={18} />
      </button>

      {isOpen && (
        <div
          className="settings-dropdown-panel"
          style={panelStyle}
          role="dialog"
          aria-label="Prescribed Clinical Settings"
        >
          <div className="dropdown-header">
            <div className="dropdown-header-main">
              <span className="dropdown-title text-heading-16">Prescribed Settings</span>
              <Lock size={15} className="dropdown-title-lock" aria-label="Locked to physician orders" />
            </div>
          </div>

          <div className="dropdown-metric-list">
            <div className="dropdown-metric-row">
              <div className="dropdown-metric-text">
                <span className="dropdown-metric-name text-label-14">Carb Ratio</span>
                <span className="dropdown-metric-caption text-copy-13">1 unit per {ROMAN.ratio}g carbs</span>
              </div>
              <span className="dropdown-metric-val text-label-14">1 u : {ROMAN.ratio} g</span>
            </div>

            <div className="dropdown-metric-row">
              <div className="dropdown-metric-text">
                <span className="dropdown-metric-name text-label-14">Sensitivity (ISF)</span>
                <span className="dropdown-metric-caption text-copy-13">1 unit drops {ROMAN.sensitivity} mg/dL</span>
              </div>
              <span className="dropdown-metric-val text-label-14">{ROMAN.sensitivity} mg/dL</span>
            </div>

            <div className="dropdown-metric-row">
              <div className="dropdown-metric-text">
                <span className="dropdown-metric-name text-label-14">Target Glucose</span>
                <span className="dropdown-metric-caption text-copy-13">Correct if &ge; {ROMAN.target} mg/dL</span>
              </div>
              <span className="dropdown-metric-val text-label-14">{ROMAN.target} mg/dL</span>
            </div>

            <div className="dropdown-metric-row">
              <div className="dropdown-metric-text">
                <span className="dropdown-metric-name text-label-14">Dosing Increment</span>
                <span className="dropdown-metric-caption text-copy-13">Half-unit rounding</span>
              </div>
              <span className="dropdown-metric-val text-label-14">0.5 unit</span>
            </div>
          </div>

          <div className="dropdown-footer text-label-12">
            <Lock size={12} className="dropdown-lock-icon" />
            <span>Parameters are locked to physician orders</span>
          </div>
        </div>
      )}
    </div>
  );
}
