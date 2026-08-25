# Design System: Skylark BI Studio Mint

## Visual Theme & Color Strategy
- **Palette Style**: Modern Studio Mint (Restrained with deliberate mint highlights)
- **Light Theme**:
  - `bg-background`: `#fbfcfd`
  - `bg-surface`: `#ffffff`
  - `bg-surface-subtle`: `#f1f5f9` (sidebar/cards)
  - `border-subtle`: `#e2e8f0`
  - `ink-primary`: `#0f172a` (slate-900)
  - `ink-secondary`: `#475569` (slate-600)
  - `ink-muted`: `#94a3b8` (slate-400)
  - `mint-primary`: `#059669` (emerald-600)
  - `mint-accent`: `#10b981` (emerald-500)
  - `mint-tint`: `#ecfdf5` (emerald-50)
  - `mint-border`: `#a7f3d0` (emerald-200)
- **Dark Theme**:
  - `bg-background`: `#090d16`
  - `bg-surface`: `#0f172a`
  - `bg-surface-subtle`: `#131b2e`
  - `border-subtle`: `#1e293b`
  - `ink-primary`: `#f8fafc`
  - `ink-secondary`: `#cbd5e1`
  - `ink-muted`: `#64748b`
  - `mint-primary`: `#34d399` (emerald-400)
  - `mint-accent`: `#10b981` (emerald-500)
  - `mint-tint`: `#064e3b` (emerald-900 / 30%)
  - `mint-border`: `#047857` (emerald-700 / 50%)

## Typography
- Font Family: Geist Sans (`var(--font-geist-sans)`), system fallback `Inter`, `system-ui`
- Hierarchy:
  - Header / H1: 18px (1.125rem), semi-bold, letter-spacing -0.015em
  - Card Titles / H2: 15px (0.9375rem), semi-bold
  - Section Headings / H3: 13px (0.8125rem), medium, uppercase tracking-wide
  - Body & Messages: 14px (0.875rem), leading-relaxed (1.6)
  - Metadata / Badges / Chips: 11px–12px, font-medium
  - Code / Queries / Numbers: Geist Mono (`var(--font-geist-mono)`)

## Components & Layout Patterns
- **Collapsible Sidebar**: Left rail (280px wide) housing brand badge, new session trigger, categorized prompt cards, live API connection status, and footer.
- **Top Header**: Glass-morphed or solid top bar with title, model status indicator pill (`⚡ Gemini 2.5 Flash`), theme switcher (Sun/Moon/System), and chat session actions.
- **Chat Feed**:
  - User messages: Emerald/Mint gradient or crisp slate bubble on right.
  - Assistant messages: Clean surface bubble with markdown tables, copy button, timestamp, and optional data quality badge.
  - Tables: Zebra striping, crisp border headers, horizontal scroll container, numeric right alignment.
- **Chat Input Bar**: Rounded floating dock with subtle mint ring focus, auto-expand textarea, and instant send action button.

## Motion & Micro-interactions
- Transitions: Fast 150ms–200ms `ease-out` transitions for theme switches, hover states, and sidebar collapses.
- Reduced motion: Gracefully collapses to instantaneous visual changes if requested by system.
