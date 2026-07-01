# How Long Since - Visual Style Guide & Brand Guidelines

> **Design system: Soft Daylight (warm white & greige).** This guide documents
> the system we landed on in the Claude Design exploration — options 2a (By
> Time), 3a (By Category), 4 (dark mode), and 5 (Add New Task). It is a warm,
> rounded, friendly system: warm-white and greige surfaces, pillowy cards,
> Bricolage Grotesque + DM Sans type, and a single terracotta accent. It
> replaces the earlier blue/Inter direction throughout.

> Where this doc references Alex, Jordan, or Pat, those are the illustrative
> example users from `docs/user-personas.md` — not an exclusive audience.
> Persona-gated features (separate UI modes, persona-exclusive
> categories/settings) have been explicitly cut; see the notes inline below.

---

## 1. Color Palette

Soft Daylight is a warm-neutral system. Surfaces are warm white and greige
rather than pure white; text is a warm near-black; a single terracotta accent
carries primary actions and overdue states. Category colors keep their existing
base hues but render as gentle tinted tags rather than saturated blocks.

Colors are given as build tokens (suggested CSS custom-property names) so they
map directly onto the Tailwind v4 theme layer.

### 1.1 Core Neutrals (Light)

| Token | Hex | Use |
|-------|-----|-----|
| `--surface-page` | `#FAF8F4` | App/screen background (warm white) |
| `--surface-card` | `#FFFFFF` | Cards and rows floating on the page |
| `--surface-sunk` | `#EFEBE3` | Greige fills: settings chip, section-marker circles, category-view time chips |
| `--surface-track` | `#EDEAE2` | Segmented-control / toggle tracks |
| `--surface-input` | `#F7F5F1` | Empty checkbox fill |
| `--border-default` | `#E4E0D8` | Card/screen and input borders |
| `--border-soft` | `#DCD7CD` | Checkbox ring, hairline dividers |
| `--ink` | `#3A3330` | Primary text and headings (warm near-black) |
| `--ink-secondary` | `#9B948B` | Secondary text, inactive toggle labels |
| `--ink-tertiary` | `#ADA69C` | Meta text, counts, timestamps |

> **Accessibility note:** `--ink-secondary` (#9B948B, 2.8:1) and `--ink-tertiary`
> (#ADA69C, 2.3:1) do **not** meet the 4.5:1 AA minimum for normal text on the
> warm-white page. Use the soft grays for decorative or large (≥18.66px bold /
> ≥24px) text only. For small meta text that must meet AA, use the darker warm
> gray `--ink-meta-aa` `#6E675E` (5.3:1). See §1.6 for the full reconciliation.

### 1.2 Accent — Terracotta

Terracotta is the one accent. It appears on the primary button, the "Quick
pick" label, section markers, and overdue states — nowhere else, so it stays
meaningful.

| Token | Hex | Use |
|-------|-----|-----|
| `--accent` | `#D98C63` | Primary button fill, active frequency/date pill |
| `--accent-deep` | `#C0794C` | Section markers, "Quick pick" label |
| `--accent-sage` | `#5B9E86` | Secondary/success accent (sparingly) |

### 1.3 Status Colors (Light)

Status is never conveyed by color alone — each tier pairs color with an icon
and/or a text label (see §5).

| Token | Hex | Use |
|-------|-----|-----|
| `--due-soon` | `#C08A2E` | "Due soon" elapsed-time text (amber-gold), paired with a clock glyph |
| `--overdue` | `#C6533C` | Overdue / very-overdue elapsed-time text and "!" badge |
| `--overdue-tint` | `#F6E0D9` | Fill behind the "!" badge and the "Very overdue" pill |
| `--overdue-border` | `#EFCDBF` | Soft terracotta card border on overdue rows |

### 1.4 Category Colors

The ten default category **base** hues are unchanged (they remain the source of
truth in `docs/requirements.md` Req 3.1, `AGENTS.md`, and the `Category.color`
field). Soft Daylight renders them three ways:

1. **Dot** — the solid base hue as a 12px circle in By Category headers.
2. **Tinted tag** — a light tint background + a saturated text color, used in By
   Time rows to name the category. `padding: 2px 8px; radius: 9px; font: 600
   10px 'DM Sans'`.
3. **Selected chip** — in the Add-Task category picker (see §3.6).

| Category | Base (dot) | Tag background | Tag text |
|----------|-----------|----------------|----------|
| Kitchen | `#3B82F6` | `#E4EDFB` | `#3B6FD4` |
| Bathroom | `#8B5CF6` | `#EDE4FB` | `#7B54D4` |
| Bedroom | `#EC4899` | `#FBE0EF` | `#C43B7E` |
| Living Areas | `#10B981` | `#DCF0E6` | `#2E8C63` |
| Exterior | `#F59E0B` | `#FBEDD2` | `#9A6C1E` |
| Vehicles | `#EF4444` | `#FADBD8` | `#D6453C` |
| Digital/Tech | `#6366F1` | `#E4E5FB` | `#4B4DD1` |
| Health | `#14B8A6` | `#D4F0EC` | `#128377` |
| Pets | `#F97316` | `#FBE6D6` | `#D97327` |
| Garden/Plants | `#84CC16` | `#EAF3D6` | `#6E9A1F` |

Tints for Kitchen, Bathroom, Vehicles, Pets, Living, and Garden come straight
from the design mocks; Bedroom, Exterior, Digital/Tech, and Health follow the
same recipe (≈12% base over warm white, text ≈ base darkened for legibility).
See §1.6 for tag-text contrast.

#### Custom Categories
Users can create their own categories beyond the 10 defaults, for anything the
defaults don't cover — child-related tasks, hobbies, social/connection
tracking, financial reviews, whatever fits their household. There's no
persona-gating on this: any user can add any category. A few base hues reserved
for common custom categories, kept distinct from the defaults, and tinted with
the same recipe:
- Child-Related: `#FB7185` (Rose Pink)
- Social/Hobbies: `#818CF8` (Lighter Indigo)
- Financial/Investment: `#0EA5E9` (Sky Blue)

### 1.5 Dark Mode

A warm dark palette — charcoal-brown surfaces (never pure black or cool gray),
warm off-white text, terracotta kept as the single accent, and category tints
that go luminous instead of dark. See §6 for how it's wired.

| Token | Hex | Use |
|-------|-----|-----|
| `--surface-page` (dark) | `#24211D` | App/screen background |
| `--surface-card` (dark) | `#2E2A25` | Cards and rows |
| `--surface-sunk` (dark) | `#302C27` | Toggle track, section circles, gear |
| `--surface-raised` (dark) | `#413B34` | Active toggle pill |
| `--border-default` (dark) | `#37322C` | Card/row borders |
| `--border-soft` (dark) | `#3B362F` | Inputs |
| `--ink` (dark) | `#F3EEE7` | Primary text (warm off-white) |
| `--ink-secondary` (dark) | `#A69E93` | Secondary text |
| `--ink-tertiary` (dark) | `#8F887E` | Meta text |
| `--ink-faint` (dark) | `#6F685F` | Disabled / helper |
| `--accent` (dark) | `#D98C63` | Primary button (unchanged) |
| `--accent-deep` (dark) | `#E8875A` | Markers, "Quick pick" label |
| `--overdue` (dark) | `#F0876B` | Overdue text/badge |
| `--due-soon` (dark) | `#E0A94E` | "Due soon" text |
| overdue tint (dark) | `rgba(240,135,107,.16)` | Badge / pill fill |
| overdue border (dark) | `rgba(240,135,107,.5)` | Overdue card border |

Dark category tags: background `rgba(base, .18–.20)`, text a light tint of the
base — e.g. Kitchen `rgba(59,130,246,.18)` / `#7FB0FF`, Pets
`rgba(249,115,22,.18)` / `#F5A05A`, Bathroom `rgba(139,92,246,.20)` / `#B99BFA`,
Garden `rgba(132,204,22,.18)` / `#A8DB5C`, Living `rgba(16,185,129,.18)` /
`#5FCFA3`, Vehicles `rgba(239,68,68,.18)` / `#F58B84`. Category-view time chips:
`#332F29` fill / `#A69E93` text. Category dots use the solid base hue as in
light mode.

### 1.6 Accessibility Reconciliation (Soft Daylight ↔ WCAG AA)

This is the one real tension in the system: Soft Daylight's warmth comes from
low-contrast surfaces and desaturated text, several of which fall under the
4.5:1 AA floor the app commits to (`AGENTS.md`, `docs/requirements.md` Req 5).
The design direction stays; the fix is a small set of AA-safe **text** tokens
used wherever a value is small, informational text. Decorative uses (dots,
borders, large numerals, fills behind icons) keep the soft values.

| Design value | Measured on its bg | Verdict | AA-safe text token |
|--------------|-------------------|---------|--------------------|
| `--ink` `#3A3330` | 11.7:1 | ✅ pass | keep |
| `--ink-secondary` `#9B948B` | 2.8:1 | ✗ small text | `#6E675E` (5.3:1) |
| `--ink-tertiary` `#ADA69C` | 2.3:1 | ✗ small text | `#6E675E` (5.3:1) |
| `--due-soon` `#C08A2E` | 2.9:1 | ✗ small text | `#8A5E15` (5.4:1) |
| `--overdue` `#C6533C` | 4.2:1 | ✗ just under | `#B2452F` (5.2:1) |
| Category tag text (e.g. Pets `#D97327` on tint) | 2.7–4.2:1 | ✗ several under | darken tag text to ≥4.5:1 on its own tint |

Guidance:
- **Elapsed time** is the most important value on every row — render it at the
  AA-safe tokens (`#B2452F` overdue, `#8A5E15` due soon) so the color reads at
  any size.
- **Meta text** (category counts, "15 min · 3", "Yesterday", helper lines): use
  `--ink-meta-aa` `#6E675E`, not the soft grays.
- **Category tags** are backed by redundant cues (the category dot/name appears
  elsewhere, and the icon carries meaning), but the tag text should still reach
  4.5:1 against its tint — derive tag text as the base hue darkened until it
  passes. Alternatively deepen the tint background one step.
- Keep the soft grays (`#9B948B`, `#ADA69C`) for genuinely decorative or large
  text only.

Enhanced high-contrast mode (see §6) can swap the whole warm-neutral text ramp
for `--ink` plus stronger borders.

### Accessibility Considerations
- All **text** colors must maintain at least 4.5:1 contrast against their
  background (§1.6); large text (≥24px, or ≥18.66px bold) may use 3:1.
- Interactive elements use a 3:1 contrast ratio minimum for boundaries.
- Status colors always carry a non-color indicator (icon, badge, or text
  label) for colorblind users.

#### Enhanced Accessibility Options
Available to any user who wants them, not tied to age or persona:
- **Larger Text Options**: Provide a "Larger Text" setting that increases all text sizes by 25-50%
- **Higher Contrast Mode**: Offer an enhanced contrast mode with 7:1 contrast ratio for better readability
- **Reduced Motion Option**: Allow users to disable animations and transitions
- **Simplified View**: Create an alternative, less dense layout with fewer items per screen
- **Bold Text Option**: Option to display all text in medium weight (500) or higher for better visibility

## 2. Typography

Two families. Bricolage Grotesque carries display and "glanceable" numbers (the
app title, category names, and — importantly — the elapsed-time value on every
row). DM Sans carries everything else: task names, labels, tags, meta.

### Font Families
- **Display / numerals**: Bricolage Grotesque (weights 400–700)
- **Body / UI**: DM Sans (weights 400–700)
- **System fallback stack**: `system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`

Google Fonts import:
`family=Bricolage+Grotesque:opsz,wght@12..96,400;500;600;700&family=DM+Sans:opsz,wght@9..40,400;500;600;700`

### Type Scale (mobile baseline)

These are the sizes used in the mocks — a compact mobile scale. Sizes step up on
tablet/desktop (see §6).

| Role | Family | Size / weight | Notes |
|------|--------|---------------|-------|
| App title | Bricolage | 22px / 600 | "How Long Since" |
| Add-Task title | Bricolage | 17px / 600 | Modal top-bar center |
| Category header | Bricolage | 14px / 700 | Next to the color dot |
| Elapsed time | Bricolage | 15px / 600 | Right-aligned on each row |
| Frequency numeral | Bricolage | 24px / 600 | Add-Task frequency field |
| Task name | DM Sans | 15px / 600 | (16px / 600 in the Add-Task name field) |
| Section header | DM Sans | 13px / 700 | By Time group titles |
| Toggle / button label | DM Sans | 13px / 600 | View toggle, chips |
| Field label | DM Sans | 11px / 700 | Uppercase, letter-spacing .05em |
| Tag / time chip | DM Sans | 10px / 600 | Category tags, time-estimate chips |
| Meta / count | DM Sans | 11–12px / 500 | Counts, "15 min · 3", helper text |

### Typography Hierarchy
- **Elapsed time** is the visual anchor of every row — Bricolage 600, right-aligned, colored by status.
- **Task name** is the primary label — DM Sans 600.
- **Category name** — Bricolage 700 (headers) or a tinted DM Sans tag (rows).
- **Section / group titles** — DM Sans 700.
- **Everything supporting** — DM Sans 400–500 at meta sizes.

## 3. UI Component Patterns

Overall feel: pillowy. Large corner radii, soft shadows instead of hard
borders, generous padding. Base radius scale: chips/tags 9px, inputs 14px,
rows/cards 16px, toggle track 22px, screen container 26px, primary button /
save 26px (fully pill).

### 3.1 Buttons
- **Primary Button** (terracotta)
  - Background: `--accent` (#D98C63); Text: white
  - Full-width Save: `height: 52px; radius: 26px; font: 700 16px 'DM Sans'`
  - Shadow: `0 8px 20px -8px rgba(217,140,99,.7)`
  - Inline "Add task": `height: 38px; padding: 0 18px; radius: 19px; font: 600 13px`
- **Secondary / neutral pill**
  - Background: `--surface-card`; Border: `1.5px solid --border-default`
  - Text: `#8A8177`; radius 12–20px depending on context
- **Icon / chip button (e.g. settings)**
  - 36px circle, `--surface-sunk` fill, icon `--ink-secondary`
  - Minimum interactive size remains 44px (extend the hit area beyond the visible 36px circle)

- **Floating Action Button (FAB)** — the primary "Add task" affordance
  - Fixed, lower-right corner; Google-Calendar style. Present on both By Time
    and By Category; hidden while the Add-Task modal is open.
  - 56px rounded square, radius 18px (a squircle that matches the pillowy
    geometry; a full 56px circle is an acceptable variant)
  - Fill: `--accent` (#D98C63), unchanged in dark mode; icon: white "+", ~28px
  - Elevation shadow: `0 8px 20px -8px rgba(217,140,99,.7)` (matches the primary button)
  - Offset ~16–24px from the screen edges, plus the safe-area inset on mobile;
    floats above the list (overlapping content is expected)
  - `aria-label="Add task"`; the 56px size already exceeds the 44px minimum

### 3.2 Task Rows (cards)

The row is the core component, shared by By Time and By Category.

- Background: `--surface-card` (#FFFFFF); Radius: 16px
- Padding: `13px 14px`; internal gap: 13px
- Shadow: `0 2px 10px -6px rgba(70,62,55,.18)` (no border in the default state)
- Layout (left → right):
  1. **Checkbox** — 30px circle (see §3.3)
  2. **Body** (flex:1) — task name (DM Sans 600 15px) on top; a meta line below (4px gap)
  3. **Elapsed time** — right-aligned, Bricolage 600 15px, colored by status; overdue rows add a 17px "!" badge to its left
- **Overdue row variant**: replace the shadow-only edge with `border: 1.5px
  solid --overdue-border` (a soft terracotta outline around the whole card —
  not a left-edge bar).
- Meta line contents differ by view:
  - **By Time**: category **tinted tag** + muted time-estimate text (`● 15 min`)
  - **By Category**: greige **time-estimate chip** (`--surface-sunk` fill, `#8A8177` text)
  - Very-overdue rows also carry an uppercase "Very overdue" pill in the meta line

#### Enhanced Touch Targets for Accessibility
- **"Just Done" checkbox**: visible 30px, but its tap target extends to ≥44px (48px preferred)
- **Card tap area**: the entire row is the tap target for the detail view
- **Button spacing**: minimum 16px between actionable elements
- **Hit-area extensions**: invisible extended hit areas (≥8px beyond visible bounds) on all interactive elements

### 3.3 Checkbox ("Just Done")
- **Empty**: 30px circle (28px in the Quick-pick panel), `border: 2px solid
  --border-soft; background: --surface-input`
- **Checked**: terracotta fill with a white check (matches `--accent`)
- Circular, not square — this is a deliberate change from the earlier square checkbox.

### 3.4 View Toggle (segmented control)
- Track: `--surface-track` fill, radius 22px, padding 4px, two equal segments
- Active segment: white pill, radius 18px, `box-shadow: 0 2px 6px
  rgba(70,62,55,.1)`, text `--ink`
- Inactive segment: text `--ink-secondary`
- Labels: "By Category" / "By Time" (DM Sans 600 13px)
- This top toggle is the app's primary view switch (there is no bottom nav bar
  in the Soft Daylight mocks — see the navigation note in
  `docs/app-pages-prompts.md`).

### 3.5 Segmented Pickers (time estimate, frequency unit)
- Same track pattern as the view toggle at a smaller scale: `--surface-track`
  fill, radius 11–14px, padding 3–4px
- Selected: white pill (`radius 8–10px; shadow 0 2px 6px rgba(70,62,55,.12);
  font 700; color --ink`), **except** the frequency unit whose selected pill is
  terracotta (`--accent`, white text)
- Time-estimate options show filled circles + label: `● 15m  ●● 30m  ●●● 1h  2h+`

### 3.6 Form Elements
- **Text input** (task name): `padding: 14px 16px; background: --surface-card;
  border: 1.5px solid --border-default; radius: 14px; font: 600 16px; shadow: 0
  2px 8px -6px rgba(70,62,55,.2)`; focus ring uses `--accent`
- **Field label**: DM Sans 700 11px, uppercase, letter-spacing .05em,
  `--ink-secondary`, 8–10px below-gap
- **Category chip picker** (wrapping row of chips):
  - Unselected chip: `padding: 8px 12px; radius: 20px; background:
    --surface-card; border: 1.5px solid --border-default; font: 600 13px; color:
    #8A8177`, with an 11px color dot
  - Selected chip: tinted background + colored border + colored text (e.g.
    Bathroom selected → bg `#F3EBFB`, border `#8B5CF6`, text `#6C3FC7`)
  - "+ New" chip: dashed border `1.5px dashed #D6D1C7`, text `#B0A99E`
- **Last-done control**: three pills — Today / Yesterday / "Pick date ▾"; the
  active choice uses `background #F3EBE4; border 1.5px solid --accent; text
  #B4623C`; a sub-line confirms the resolved date ("Set to Apr 2, 2026 · 3
  months ago")

### 3.7 Quick Pick Panel (By Time)
- Container: `background: linear-gradient(180deg,#F3F1EB,#FAF9F5); border: 1px
  solid #E7E2D8; radius: 20px; padding: 16px 18px`
- Header: ☀ sun glyph + "Quick pick" (`--accent-deep`, DM Sans 700 12px) + a
  subline ("You've got 20 minutes — here's what fits:")
- Rows inside are the standard task row at a slightly tighter radius (15px) and
  a lighter shadow (`0 2px 8px -4px rgba(70,62,55,.16)`)

### 3.8 Section Markers (By Time group headers)
- 22px circle, `--surface-sunk` fill, glyph in `--accent-deep`: `●` / `●●` /
  `●●●` matching 15m / 30m / 1h
- Followed by the group title (DM Sans 700 13px `--ink`) and a meta count ("15
  min · 3", `--ink-meta-aa`)

## 4. Iconography

### Icon Style
- **Style**: Outlined, ~2px stroke, medium visual weight, rounded joins to
  match the pillowy geometry
- **Size**: 24px standard, 20px compact
- **Consistency**: one uniform family across the app (e.g. Lucide, which pairs
  well with the rounded aesthetic)

### Key Glyphs Used in the Mocks
- **Settings**: gear, inside a 36px `--surface-sunk` circle, top-right of the header
- **Quick pick**: sun (☀)
- **Due soon**: small clock (🕐) beside the elapsed time
- **Overdue**: "!" in a 17px filled circle (`--overdue-tint` fill, `--overdue` glyph)
- **Frequency / date picker**: down chevron (▾)
- **View toggle**: text labels (no icons in the toggle itself)

### Other App Icons
- Add Task: plus; Complete: check; Edit: pencil; Archive: box + down arrow;
  Delete: trash; Category view: grid/list; Time view: clock; Export/Import:
  up/down arrows; Back/Forward: chevrons.

### Task Category Icons
Simple, recognizable outlined icons per category:

- Kitchen: utensils/pot · Bathroom: shower · Bedroom: bed · Living Areas: couch
  · Exterior: house · Vehicles: car · Digital/Tech: computer/device · Health:
  heart/medical cross · Pets: paw print · Garden/Plants: leaf/plant

#### Example Custom Category Icons
Reference icons for the common custom categories listed above — available to
any user who adds these, not persona-specific:
- **Child-Related**: child silhouette
- **Social/Hobbies**: paintbrush / people silhouettes
- **Financial/Investment**: dollar sign / chart

## 5. Visual Indicators

### Time-Elapsed Display

Every row shows time-since as its right-aligned anchor value (Bricolage 600
15px). Formatting is compact: "3 d", "1 wk", "2 wk", "3 mo", "Yest." for
yesterday. Neutral elapsed times use `--ink`; a recent/"yesterday" value may use
the muted `--ink-secondary`. Status coloring (below) overrides for due-soon and
overdue rows.

### Time-Commitment Indicators
Filled-circle system, text always paired:
- **15min**: ● · **30min**: ●● · **1hr**: ●●● · **2hrs**: ●●●● · **4hrs**: ●●●●● · **5hrs+**: ●●●●● +

In By Time the circles double as the section markers; in rows the estimate reads
as `● 15 min`. The circles use a neutral/greige treatment (not the category
color) so they don't compete with the category tag. This provides quick visual
scanning, colorblind-safe pattern recognition, and consistency.

### Overdue Task Indicators

Three tiers, using the same threshold math as `AGENTS.md` (Overdue Status
Thresholds — percentage of the expected interval elapsed). Soft Daylight
expresses them as follows; each tier is distinguishable without relying on color
alone:

- **Due soon** (80–99% of interval elapsed): elapsed-time text in amber-gold
  (`--due-soon`, AA-safe `#8A5E15`) with a small **clock** glyph beside it. No
  border.
- **Overdue** (100–149%): elapsed-time text in terracotta (`--overdue`, AA-safe
  `#B2452F`), a filled **"!" badge** beside it, and a soft terracotta border
  around the whole card (`1.5px solid --overdue-border`). Screen-reader text:
  "Overdue".
- **Very overdue** (150%+): same treatment as Overdue, **plus** an uppercase
  "**Very overdue**" pill in the meta line (`--overdue-tint` fill, `--overdue`
  text, DM Sans 700 9px, letter-spacing .03em). Screen-reader text: "Very
  overdue".

Note this differs from the earlier spec's 3px red **left** border — Soft
Daylight outlines the full card in a soft terracotta instead, and uses the warm
terracotta ramp rather than pure `#DC2626`/`#F59E0B`.

Animation: none for any tier (avoid distracting movement).

### Empty States
- Friendly, minimal illustration in the warm palette
- Clear terracotta call-to-action button
- Brief, helpful text explaining the next step

## 6. Implementation Guidelines

### Design Tokens & Theming
- Ship the palette in §1 as CSS custom properties on `:root` (light) and a
  `.dark` / `[data-theme="dark"]` scope (§1.5), consumed through the Tailwind v4
  `@theme` layer.
- Two font families loaded via Google Fonts (or self-hosted for offline/PWA):
  Bricolage Grotesque, DM Sans.
- 4px base spacing unit; the radius scale in §3.

### Responsive Behavior
- Mobile-first; the type scale in §2 is the mobile baseline.
- Breakpoints:
  - Mobile: <640px (single column of rows)
  - Tablet: 640–1024px (dual column; type steps up ~1 level)
  - Desktop: >1024px (multi-column dashboard; the two views can sit side by side)

### Behavior-Based Personalization (not identity-based)
- **Time-availability matching**: the Quick-pick panel filters tasks to the
  user's stated available time.
- **Behavior patterns**: surface frequently-completed categories; order by
  usage.

> Note: an earlier draft proposed persona-selectable UI modes (e.g. "Busy
> Parent Mode"). That's cut — there's no `persona` field in the data model, and
> it conflicted with this app not being designed for a limited set of named
> audiences (see `docs/user-personas.md`). Personalization stays behavior-based
> (what a user actually does), not identity-based.

### Dark Mode
- All components have dark variants driven by the §1.5 tokens.
- Surfaces are charcoal-brown (`#24211D`/`#2E2A25`), not pure black or cool gray.
- Text becomes warm off-white; category tints go luminous; terracotta stays the accent.
- Overdue/due-soon shift to their lighter dark-mode values so they read on the dark surface.
- Maintain equivalent contrast ratios in dark mode.

### Accessibility Guidelines
- WCAG 2.1 AA: 4.5:1 for normal text (see §1.6 for the AA-safe token set).
- High-contrast mode: swap the warm text ramp for `--ink` and strengthen borders.
- Text resizing without breaking layout; visible focus states (terracotta ring).
- Touch targets ≥44px (48px preferred); reduced-motion honored.
- Screen-reader labels for all controls and every status change.
- Keyboard navigation and screen-magnification support.

## 7. Brand Voice and Tone

While not visual, these influence UI text:

- **Friendly but efficient**: brief, clear language.
- **Encouraging**: positive reinforcement for completion; the frequency helper
  ("We'll gently flag it once this much time has passed.") sets the gentle,
  no-guilt tone.
- **Helpful**: instructional text that guides without overwhelming.
- **Direct**: action-oriented button text ("Add task", "Save task").
