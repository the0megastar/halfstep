import { useState } from 'react';
import { ArrowLeft, Moon, Sun, Copy, Check } from 'lucide-react';

interface TypographySpecimenProps {
  onBack: () => void;
  colorMode: 'light' | 'dark';
  onToggleTheme: () => void;
}

export type HalfstepCategory = 'all' | 'headings' | 'copy' | 'labels' | 'buttons';

export interface HalfstepTypeScaleItem {
  token: string;
  category: 'headings' | 'copy' | 'labels' | 'buttons';
  name: string;
  className: string;
  sizePx: number;
  lineHeightPx: number;
  weight: number;
  weightName: string;
  trackingPx: string;
  role: string;
  defaultSample: string;
}

export const HALFSTEP_SCALE_ITEMS: HalfstepTypeScaleItem[] = [
  // Headings
  {
    token: 'text-heading-72',
    category: 'headings',
    name: 'Heading 72',
    className: 'text-heading-72',
    sizePx: 72,
    lineHeightPx: 72,
    weight: 600,
    weightName: 'SemiBold',
    trackingPx: '-4.32px',
    role: 'Display hero heading',
    defaultSample: 'Display 72',
  },
  {
    token: 'text-heading-64',
    category: 'headings',
    name: 'Heading 64',
    className: 'text-heading-64',
    sizePx: 64,
    lineHeightPx: 64,
    weight: 600,
    weightName: 'SemiBold',
    trackingPx: '-3.84px',
    role: 'Large hero heading',
    defaultSample: 'Heading 64',
  },
  {
    token: 'text-heading-56',
    category: 'headings',
    name: 'Heading 56',
    className: 'text-heading-56',
    sizePx: 56,
    lineHeightPx: 56,
    weight: 600,
    weightName: 'SemiBold',
    trackingPx: '-3.36px',
    role: 'Hero calculated dose & main banner (1.5 units)',
    defaultSample: '1.5 units',
  },
  {
    token: 'text-heading-48',
    category: 'headings',
    name: 'Heading 48',
    className: 'text-heading-48',
    sizePx: 48,
    lineHeightPx: 56,
    weight: 600,
    weightName: 'SemiBold',
    trackingPx: '-2.88px',
    role: 'Large section heading',
    defaultSample: 'Heading 48',
  },
  {
    token: 'text-heading-40',
    category: 'headings',
    name: 'Heading 40',
    className: 'text-heading-40',
    sizePx: 40,
    lineHeightPx: 48,
    weight: 600,
    weightName: 'SemiBold',
    trackingPx: '-2.4px',
    role: 'Page title on desktop',
    defaultSample: 'Roman. Pediatric MDI',
  },
  {
    token: 'text-heading-32',
    category: 'headings',
    name: 'Heading 32',
    className: 'text-heading-32',
    sizePx: 32,
    lineHeightPx: 40,
    weight: 600,
    weightName: 'SemiBold',
    trackingPx: '-1.28px',
    role: 'Main page or major section heading (H1)',
    defaultSample: 'Enter Numbers & Calculate',
  },
  {
    token: 'text-heading-24',
    category: 'headings',
    name: 'Heading 24',
    className: 'text-heading-24',
    sizePx: 24,
    lineHeightPx: 32,
    weight: 600,
    weightName: 'SemiBold',
    trackingPx: '-0.96px',
    role: 'Card & step headers (Step 02 · Calculated Dose)',
    defaultSample: 'Step 02 · Calculated Dose',
  },
  {
    token: 'text-heading-20',
    category: 'headings',
    name: 'Heading 20',
    className: 'text-heading-20',
    sizePx: 20,
    lineHeightPx: 26,
    weight: 600,
    weightName: 'SemiBold',
    trackingPx: '-0.4px',
    role: 'KPI metric values & modal titles (2.38 units · 2h 26m)',
    defaultSample: '2.38 units · 2h 26m',
  },
  {
    token: 'text-heading-16',
    category: 'headings',
    name: 'Heading 16',
    className: 'text-heading-16',
    sizePx: 16,
    lineHeightPx: 24,
    weight: 600,
    weightName: 'SemiBold',
    trackingPx: '-0.32px',
    role: 'Section titles and popover headers',
    defaultSample: 'Prescribed Settings · History',
  },
  {
    token: 'text-heading-14',
    category: 'headings',
    name: 'Heading 14',
    className: 'text-heading-14',
    sizePx: 14,
    lineHeightPx: 20,
    weight: 600,
    weightName: 'SemiBold',
    trackingPx: '-0.28px',
    role: 'Compact card or table header',
    defaultSample: 'Recent Injections Summary',
  },

  // Copy
  {
    token: 'text-copy-24',
    category: 'copy',
    name: 'Copy 24',
    className: 'text-copy-24',
    sizePx: 24,
    lineHeightPx: 36,
    weight: 400,
    weightName: 'Regular',
    trackingPx: 'normal',
    role: 'Hero marketing & large introduction text',
    defaultSample: 'Simple, predictable pediatric arithmetic aid.',
  },
  {
    token: 'text-copy-20',
    category: 'copy',
    name: 'Copy 20',
    className: 'text-copy-20',
    sizePx: 20,
    lineHeightPx: 36,
    weight: 400,
    weightName: 'Regular',
    trackingPx: 'normal',
    role: 'Introduction paragraphs & callouts',
    defaultSample: 'Double-check insulin calculations with step-by-step arithmetic.',
  },
  {
    token: 'text-copy-18',
    category: 'copy',
    name: 'Copy 18',
    className: 'text-copy-18',
    sizePx: 18,
    lineHeightPx: 28,
    weight: 400,
    weightName: 'Regular',
    trackingPx: 'normal',
    role: 'Lead paragraphs & prominent explanations',
    defaultSample: 'Enter current blood glucose and total meal carbohydrates.',
  },
  {
    token: 'text-copy-16',
    category: 'copy',
    name: 'Copy 16',
    className: 'text-copy-16',
    sizePx: 16,
    lineHeightPx: 24,
    weight: 400,
    weightName: 'Regular',
    trackingPx: 'normal',
    role: 'Modal text and comfortable reading copy',
    defaultSample: 'Roman is at 120 mg/dL and eating 50g of carbohydrates.',
  },
  {
    token: 'text-copy-14',
    category: 'copy',
    name: 'Copy 14',
    className: 'text-copy-14',
    sizePx: 14,
    lineHeightPx: 20,
    weight: 400,
    weightName: 'Regular',
    trackingPx: 'normal',
    role: 'Default body copy across all interfaces',
    defaultSample: 'Always complete all arithmetic first before applying half-unit rounding.',
  },
  {
    token: 'text-copy-13',
    category: 'copy',
    name: 'Copy 13',
    className: 'text-copy-13',
    sizePx: 13,
    lineHeightPx: 18,
    weight: 400,
    weightName: 'Regular',
    trackingPx: 'normal',
    role: 'Secondary body copy where vertical space is compact',
    defaultSample: 'Active insulin on board (IOB) evaluates linear decay over 3 hours.',
  },

  // Labels
  {
    token: 'text-label-20',
    category: 'labels',
    name: 'Label 20',
    className: 'text-label-20',
    sizePx: 20,
    lineHeightPx: 32,
    weight: 400,
    weightName: 'Regular',
    trackingPx: 'normal',
    role: 'Large single-line label for highlighted inputs',
    defaultSample: 'Total Units Recommended',
  },
  {
    token: 'text-label-18',
    category: 'labels',
    name: 'Label 18',
    className: 'text-label-18',
    sizePx: 18,
    lineHeightPx: 20,
    weight: 400,
    weightName: 'Regular',
    trackingPx: 'normal',
    role: 'Prominent input and form labels',
    defaultSample: 'Current Blood Glucose (mg/dL)',
  },
  {
    token: 'text-label-16',
    category: 'labels',
    name: 'Label 16',
    className: 'text-label-16',
    sizePx: 16,
    lineHeightPx: 20,
    weight: 400,
    weightName: 'Regular',
    trackingPx: 'normal',
    role: 'Differentiated labels and subhead titles',
    defaultSample: 'Carbohydrate Meal Bolus',
  },
  {
    token: 'text-label-14',
    category: 'labels',
    name: 'Label 14',
    className: 'text-label-14',
    sizePx: 14,
    lineHeightPx: 20,
    weight: 400,
    weightName: 'Regular',
    trackingPx: 'normal',
    role: 'Most common text style of all. Used in menus & form labels',
    defaultSample: 'Carb Ratio · Sensitivity ISF · Target Glucose',
  },
  {
    token: 'text-label-13',
    category: 'labels',
    name: 'Label 13',
    className: 'text-label-13',
    sizePx: 13,
    lineHeightPx: 16,
    weight: 400,
    weightName: 'Regular',
    trackingPx: 'normal',
    role: 'Stat card headers (Active Insulin, Time Remaining)',
    defaultSample: 'Active Insulin · Time Remaining',
  },
  {
    token: 'text-label-12',
    category: 'labels',
    name: 'Label 12',
    className: 'text-label-12',
    sizePx: 12,
    lineHeightPx: 16,
    weight: 400,
    weightName: 'Regular',
    trackingPx: 'normal',
    role: 'Tertiary text floor: Chips, status badges, and pills (ACTIVE, LOCKED)',
    defaultSample: 'ACTIVE · LOCKED · LOCAL DEVICE',
  },

  // Buttons
  {
    token: 'text-button-16',
    category: 'buttons',
    name: 'Button 16',
    className: 'text-button-16',
    sizePx: 16,
    lineHeightPx: 20,
    weight: 500,
    weightName: 'Medium',
    trackingPx: 'normal',
    role: 'Largest primary action button',
    defaultSample: 'Calculate & Record Dose',
  },
  {
    token: 'text-button-14',
    category: 'buttons',
    name: 'Button 14',
    className: 'text-button-14',
    sizePx: 14,
    lineHeightPx: 20,
    weight: 500,
    weightName: 'Medium',
    trackingPx: 'normal',
    role: 'Default standard button throughout the app',
    defaultSample: 'Log Injection Now',
  },
  {
    token: 'text-button-12',
    category: 'buttons',
    name: 'Button 12',
    className: 'text-button-12',
    sizePx: 12,
    lineHeightPx: 16,
    weight: 500,
    weightName: 'Medium',
    trackingPx: 'normal',
    role: 'Compact button embedded inside inputs or tags',
    defaultSample: 'Clear Input',
  },
];

export default function TypographySpecimen({
  onBack,
  colorMode,
  onToggleTheme,
}: TypographySpecimenProps) {
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<HalfstepCategory>('all');
  const [customText, setCustomText] = useState('Active Insulin 2.38 units · 2h 26m');

  const copyCss = (item: HalfstepTypeScaleItem) => {
    const trackingStr = item.trackingPx !== 'normal' ? `\n  letter-spacing: ${item.trackingPx};` : '';
    const css = `.${item.className} {\n  font-family: 'Manrope', -apple-system, BlinkMacSystemFont, sans-serif;\n  font-size: ${item.sizePx}px;\n  line-height: ${item.lineHeightPx}px;\n  font-weight: ${item.weight};${trackingStr}\n}`;
    navigator.clipboard?.writeText(css);
    setCopiedToken(item.token);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  const filteredItems = activeCategory === 'all'
    ? HALFSTEP_SCALE_ITEMS
    : HALFSTEP_SCALE_ITEMS.filter((item) => item.category === activeCategory);

  return (
    <div className="specimen-page">
      {/* Sticky Header */}
      <header className="specimen-header">
        <div className="specimen-header-inner">
          <div className="specimen-nav-left">
            <button
              type="button"
              className="specimen-back-btn text-button-14"
              onClick={onBack}
              aria-label="Return to Halfstep Calculator"
            >
              <ArrowLeft size={16} />
              <span>Calculator</span>
            </button>
            <div className="specimen-brand">
              <span className="specimen-badge text-label-12">Design System</span>
              <span className="text-heading-16">Halfstep Typography</span>
            </div>
          </div>

          <div className="specimen-nav-right">
            <button
              type="button"
              className="icon-btn theme-toggle"
              onClick={onToggleTheme}
              aria-label={`Switch to ${colorMode === 'light' ? 'dark' : 'light'} mode`}
              title="Toggle theme"
            >
              {colorMode === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>
          </div>
        </div>
      </header>

      <main className="specimen-content">
        {/* Hero Header Styled Strictly With Halfstep Tokens */}
        <section className="specimen-hero">
          <p className="specimen-hero-eyebrow text-label-14">Halfstep Design System</p>
          <h1 className="specimen-hero-title">Typography</h1>
          <p className="specimen-hero-lead text-copy-16">
            The canonical type scale for Halfstep, powered by <strong>Manrope</strong>.
            25 established tiers across Headings, Copy, Labels, and Buttons with fixed sizes, line heights, and letter-spacings.
          </p>

          {/* Interactive Live Input */}
          <div className="specimen-input-panel">
            <div className="specimen-input-panel-header">
              <label htmlFor="specimen-preview-input" className="text-label-14">
                Interactive Live Text Preview
              </label>
              <span className="text-label-12 text-muted">Updates all 25 tiers</span>
            </div>
            <input
              id="specimen-preview-input"
              type="text"
              className="specimen-input text-copy-16"
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              placeholder="Type anything to test the Halfstep typography scale..."
            />
            <div className="specimen-quick-samples">
              <span className="text-label-12 text-muted">Quick test:</span>
              <button
                type="button"
                className="specimen-sample-chip text-label-12"
                onClick={() => setCustomText('Active Insulin 2.38 units · 2h 26m')}
              >
                Active Insulin 2.38u
              </button>
              <button
                type="button"
                className="specimen-sample-chip text-label-12"
                onClick={() => setCustomText('1.5 units Calculated Dose')}
              >
                1.5 units Calculated Dose
              </button>
              <button
                type="button"
                className="specimen-sample-chip text-label-12"
                onClick={() => setCustomText('Roman. Pediatric MDI Arithmetic')}
              >
                Roman. Pediatric MDI
              </button>
            </div>
          </div>
        </section>

        {/* 25-Tier Scale Section */}
        <section className="specimen-scale-section">
          <div className="specimen-section-header">
            <h2 className="text-heading-24">Type Scale</h2>
            <p className="text-copy-14">
              Select a category below to inspect exact sizes, line heights, letter-spacings, and weights.
            </p>
          </div>

          {/* Category Tabs */}
          <div className="specimen-category-tabs">
            {(['all', 'headings', 'copy', 'labels', 'buttons'] as HalfstepCategory[]).map((cat) => (
              <button
                key={cat}
                type="button"
                className={`specimen-category-tab text-button-14 ${activeCategory === cat ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)} {cat === 'all' ? `(${HALFSTEP_SCALE_ITEMS.length})` : ''}
              </button>
            ))}
          </div>

          <div className="specimen-scale-table">
            {filteredItems.map((item) => (
              <div key={item.token} className="specimen-scale-row">
                <div className="specimen-scale-meta">
                  <div className="specimen-scale-token-wrap">
                    <span className="text-heading-16">{item.name}</span>
                    <span className="text-label-12 text-muted">{item.sizePx}px / {item.lineHeightPx}px</span>
                  </div>
                  <div className="specimen-scale-specs text-label-12 text-muted">
                    <span>{item.weightName} ({item.weight})</span>
                    {item.trackingPx !== 'normal' && <span> · Track {item.trackingPx}</span>}
                  </div>
                  <div className="text-copy-13 text-muted">{item.role}</div>
                  <button
                    type="button"
                    className="specimen-copy-btn text-button-12"
                    onClick={() => copyCss(item)}
                    title="Copy CSS rule"
                  >
                    {copiedToken === item.token ? <Check size={12} /> : <Copy size={12} />}
                    <span>{copiedToken === item.token ? 'Copied CSS' : 'Copy CSS'}</span>
                  </button>
                </div>

                <div className={`specimen-scale-display ${item.className}`}>
                  {customText || item.defaultSample}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Tabular Figures & Glyphs */}
        <section className="specimen-numerals-section">
          <div className="specimen-section-header">
            <h3 className="text-heading-20">Tabular Numeral & Clinical Notation Test</h3>
            <p className="text-copy-14">
              Ensuring zero digit jitter and uniform widths across numeric values.
            </p>
          </div>

          <div className="specimen-numerals-card">
            <div className="specimen-num-row">
              <span className="specimen-num-label text-label-13">Proportional (Default Text Flow)</span>
              <div className="specimen-num-display">
                0123456789 · 1.5u · 2.38u · 120 mg/dL
              </div>
            </div>

            <div className="specimen-num-row">
              <span className="specimen-num-label text-label-13">Tabular Figures (font-variant-numeric: tabular-nums)</span>
              <div className="specimen-num-display tabular">
                0123456789 · 1.5u · 2.38u · 120 mg/dL
              </div>
            </div>

            <div className="specimen-num-row">
              <span className="specimen-num-label text-label-13">Clinical Notation Glyphs</span>
              <div className="specimen-symbols-display">
                <span>½</span>
                <span>≈</span>
                <span>=</span>
                <span>mg/dL</span>
                <span>units</span>
                <span>U</span>
                <span>g</span>
                <span>h</span>
                <span>m</span>
                <span>&ge;</span>
                <span>&plus;</span>
                <span>&minus;</span>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
