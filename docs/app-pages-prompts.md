# How Long Since - AI Design System Prompts

> Where these prompts use Alex, Jordan, or Pat as example content, those are
> the illustrative example users from `docs/user-personas.md` — used here for
> variety in mockup content, not as an exclusive audience or a feature-gating
> mechanism.

## Application Context
"How Long Since" is a household task management app that tracks when tasks were last completed rather than creating traditional to-do lists. It serves anyone managing recurring responsibilities — busy parents, new homeowners, and active retirees are illustrative examples, not the exclusive audience — helping them identify suitable tasks based on available time and providing visual indicators for overdue tasks.

**Key Design Principles:**
- Mobile-first responsive design
- WCAG 2.1 Level AA accessibility compliance
- "Friendly but efficient" content tone
- Visual indicators for task status using multiple methods (color, icons, text)
- Touch-friendly interactions with generous tap targets

## Design System — Soft Daylight

Every page below uses the **Soft Daylight (warm white & greige)** system defined
in [`docs/style-guide.md`](style-guide.md) — warm-white/greige surfaces, pillowy
cards, Bricolage Grotesque + DM Sans type, and a single terracotta accent. That
guide is the source of truth for tokens; the page specs here describe
composition and page-specific detail. Quick reference:

- **Surfaces**: page `#FAF8F4`, cards `#FFFFFF`, greige fills `#EFEBE3`
- **Text**: ink `#3A3330`; AA-safe meta `#6E675E` (the soft grays `#9B948B`/`#ADA69C` are decorative-only — see style-guide §1.6)
- **Accent (terracotta)**: `#D98C63` button / `#C0794C` markers / `#C6533C`→AA `#B2452F` overdue / `#C08A2E`→AA `#8A5E15` due soon
- **Type**: app title Bricolage 600 22px; task name DM Sans 600 15px; elapsed time Bricolage 600 15px; tags/chips DM Sans 600 10px
- **Radii**: rows 16px, inputs 14px, screen 26px, pills/buttons 26px
- **Dark mode**: charcoal-brown surfaces `#24211D`/`#2E2A25`, warm off-white text, terracotta kept as accent (style-guide §1.5)

## Navigation Model

The Soft Daylight mocks establish a **single-screen shell with a top segmented
toggle** — "By Category" / "By Time" — plus a settings gear at top-right. There
is **no bottom navigation bar** in these designs (a change from the earlier
spec).

**Add Task = floating action button (FAB).** A terracotta FAB with a white "+"
sits fixed in the lower-right corner, Google-Calendar style, and is always
available while browsing By Category or By Time. Tapping it opens the Add New
Task modal (§2). It floats above the scrolling list (overlapping content is
expected, as in Google Calendar) and hides while the modal is open. See
`docs/style-guide.md` §3.1 for the component spec. Settings opens from the
top-right gear.

---

## 1. App Shell & Main Task List (By Category default)

**Context:** The primary screen where users view and interact with their
household tasks. It opens in **By Category** by default (grouped by room/area).
This section defines the shared shell and the row anatomy used by both views;
By Category grouping is detailed in §3, By Time in §4.

**Layout Requirements:**
- Mobile-first vertical layout, single column, generous spacing
- **Header**: app title "How Long Since" (left) + settings gear in a 36px greige circle (right)
- **View toggle** below the header: segmented "By Category" / "By Time"
- Scrollable task list; group headers depend on the active view
- **No bottom navigation bar.** A terracotta **FAB** (lower-right, always present on both views) opens the Add New Task modal (§2); Settings opens from the top-right gear (see Navigation Model above)

**Visual Design Specifications** (see `docs/style-guide.md` for full tokens):
- **Surfaces**: screen `#FAF8F4`; cards/rows `#FFFFFF`; greige fills `#EFEBE3`; borders `#E4E0D8`
- **Text**: ink `#3A3330`; meta `#6E675E` (AA-safe); the soft grays `#9B948B`/`#ADA69C` are decorative-only
- **Accent**: terracotta `#D98C63` (see status colors below)
- **Typography**: app title Bricolage 600 22px; task name DM Sans 600 15px; elapsed time Bricolage 600 15px; section/category headers Bricolage 700 14px; tags/chips DM Sans 600 10px

**Header & Toggle:**
- App title: Bricolage 600 22px `#3A3330`
- Settings gear: 36px circle `#EFEBE3` fill, gear glyph `#9B948B`, ≥44px tap target
- Toggle track: `#EDEAE2`, radius 22px, padding 4px, two equal segments; active segment is a white pill (radius 18px, `shadow 0 2px 6px rgba(70,62,55,.1)`, text `#3A3330`); inactive text `#9B948B`

**Task Row Design (shared by both views):**
- Background `#FFFFFF`, radius 16px, padding `13px 14px`, gap 13px
- Shadow `0 2px 10px -6px rgba(70,62,55,.18)` — no border in the default state
- Layout, left → right:
  - **Checkbox** — 30px circle, `border 2px solid #DCD7CD`, fill `#F7F5F1` (unchecked); checked = terracotta fill + white check. Visible 30px, tap target ≥44px.
  - **Body** (flex) — task name (DM Sans 600 15px `#3A3330`) with a meta line 4px below
  - **Elapsed time** — right-aligned, Bricolage 600 15px, colored by status; overdue rows put a 17px "!" badge to its left
- Meta line differs by view:
  - **By Time**: category **tinted tag** + muted time-estimate text (`● 15 min`)
  - **By Category**: greige **time-estimate chip** (`#EFEBE3` fill, `#8A8177` text, radius 9px)

**Time Commitment Indicators:**
- Filled-circle system, text always paired:
  - 15min ● · 30min ●● · 1hr ●●● · 2hrs ●●●● · 4hrs+ ●●●●●
- Rendered in neutral/greige (not the category color), so the category tag stays the colored element
- Include a text label for accessibility

**Task Status Indicators (three tiers — see `docs/style-guide.md` §5 and `AGENTS.md` for thresholds):**
- **Due soon** (80–99%): elapsed-time text in amber-gold `#8A5E15` (AA-safe) with a small clock glyph; no border
- **Overdue** (100–149%): elapsed-time text in terracotta `#B2452F` (AA-safe), a filled "!" badge (`#F6E0D9` circle, `#C6533C` glyph, 17px) beside it, and a soft terracotta border around the **whole card** (`1.5px solid #EFCDBF`); screen-reader text "Overdue"
- **Very overdue** (150%+): same as Overdue, plus an uppercase "Very overdue" pill in the meta line (`#F6E0D9` fill, `#C6533C` text, DM Sans 700 9px); screen-reader text "Very overdue"

> Change from the earlier spec: overdue outlines the full card in soft terracotta
> (not a 3px red left bar), and the whole ramp is warm terracotta/amber-gold
> rather than `#DC2626`/`#F59E0B`.

**Category Color System:** base hues unchanged; rendered as a 12px solid dot in
By Category headers and as a tinted tag in By Time rows. Full tint/text table in
`docs/style-guide.md` §1.4. Kitchen `#3B82F6` (utensils) · Bathroom `#8B5CF6`
(shower) · Bedroom `#EC4899` (bed) · Living Areas `#10B981` (couch) · Exterior
`#F59E0B` (house) · Vehicles `#EF4444` (car) · Digital/Tech `#6366F1` (device) ·
Health `#14B8A6` (heart) · Pets `#F97316` (paw) · Garden/Plants `#84CC16` (leaf).

**Row anatomy** (shared by both views; see §3 and §4 for full sample layouts):
```
┌──────────────────────────────────────────────────────────┐
│  ○      Deep clean refrigerator                    ! 2 wk │
│ (30px   [Kitchen] ● 30 min          (elapsed, Bricolage,  │
│  circle  ↑meta line: tag OR time-chip   status-colored)   │
│  checkbox)                                                 │
└──────────────────────────────────────────────────────────┘
  overdue → soft terracotta card border + "!" badge
```

**Interaction States:**
- Swipe right gesture: Mark task complete (with haptic feedback)
- Swipe left gesture: Edit task
- Tap checkbox: Mark complete with success animation
- Tap card: View task details
- Long press: Quick menu (Edit, Archive, Delete)

**Accessibility Requirements:**
- All interactive elements minimum 44px × 44px
- Color contrast ratio 4.5:1 minimum
- Screen reader announcements for all state changes
- Keyboard navigation support
- Focus indicators clearly visible

---

## 2. Add New Task (modal)

**Context:** A full-screen modal over the shell for creating a task (and editing
an existing one). Design source: options 5a (light) / 5b (dark).

**Layout Requirements:**
- Full-screen modal, radius 26px card, `shadow 0 14px 44px -18px rgba(70,62,55,.28)`
- **Top bar**: "Cancel" (left, `#9B948B`) · "New Task" centered (Bricolage 600 17px `#3A3330`) · "Save" (right); "Save" is disabled-styled (`#C6C2B9`) until the form is valid, then terracotta. Bottom border `#EDEAE2`.
- Body: padding `20px 18px 22px`, fields stacked with a 20px gap, logical tab order
- Inline validation with helpful messages

**Visual Design Specifications** (Soft Daylight — see `docs/style-guide.md` §3.6):
- Modal surface `#FAF8F4`, border `#E4E0D8`
- **Field label** (every field): DM Sans 700 11px, uppercase, letter-spacing .05em, `#9B948B`, 8–10px below-gap
- Inputs radius 14px; focus ring terracotta `#D98C63`
- Dark variant: modal `#24211D`, inputs `#2E2A25` / border `#3B362F`, text `#F3EEE7`

**Field Controls (as designed):**
- **Task name** — single-line box: `padding 14px 16px; background #FFFFFF; border 1.5px solid #E4E0D8; radius 14px; font 600 16px; color #3A3330; shadow 0 2px 8px -6px rgba(70,62,55,.2)`
- **Category** — wrapping **color-chip picker**: unselected chip `padding 8px 12px; radius 20px; bg #FFFFFF; border 1.5px solid #E4E0D8; font 600 13px; color #8A8177` with an 11px color dot; selected chip = tinted bg + colored border + colored text (e.g. Bathroom → bg `#F3EBFB`, border `#8B5CF6`, text `#6C3FC7`); trailing "+ New" chip with dashed border `1.5px dashed #D6D1C7`, text `#B0A99E`
- **Time estimate** — segmented control: track `#EDEAE2` radius 14px padding 4px; options `● 15m  ●● 30m  ●●● 1h  ●●●● 2h  ●●●●● 4+ hrs`; selected = white pill (radius 10px, `shadow 0 2px 6px rgba(70,62,55,.12)`, font 700, `#3A3330`); unselected `#9B948B`
- **Should happen every** (frequency) — helper line "We'll gently flag it once this much time has passed." (`#B0A99E`); control is a box with a big numeral (Bricolage 24px `#3A3330`) + an inner Days/Weeks/Months segmented picker whose **selected pill is terracotta** (`#D98C63`, white text)
- **Last done** (maps to `lastCompletedAt`) — three pills: Today / Yesterday / "Pick date ▾"; active pill `bg #F3EBE4; border 1.5px solid #D98C63; text #B4623C`; sub-line confirms the resolved date ("Set to Apr 2, 2026 · 3 months ago")

**Form Fields:**

The mock shows Task name, Category, Time estimate, Frequency, and Last done.
Description and Notes (both in the data model) are optional and were not shown in
the mock — treat them as collapsed/secondary (e.g. an expandable "Add details"
section) so the default form stays short.

1. **Task Name** (Required)
   - Text input, 128 character limit
   - Placeholder: "What needs to be done?"
   - Character counter
   - Error message: "Please add a task name"

2. **Category** (Required)
   - Color-chip picker (see Field Controls above), not a dropdown
   - Trailing "+ New" chip to create a category
   - Each chip shows a color dot; selected chip is tinted
   - Default to last used category

3. **Description** (Optional)
   - Textarea, 512 character limit
   - Placeholder: "Additional details..."
   - Expandable field

4. **Expected Frequency** (Optional)
   - Numeral + segmented unit picker (Days/Weeks/Months; Years also in the data model)
   - Helper text: "We'll gently flag it once this much time has passed."
   - Examples: "Every 2 weeks", "Every 3 months"

5. **Time Commitment** (Optional)
   - Radio buttons or segmented control
   - Options: 15min, 30min, 1hr, 2hrs, 4hrs+
   - Visual circle indicators
   - Helper text: "How long does this usually take?"

6. **Notes** (Optional)
   - Textarea, 512 character limit
   - Placeholder: "Any tips or reminders..."

**Button Design:**
- **Save Button** (bottom of the form): full-width terracotta pill — `height 52px; radius 26px; background #D98C63; color #fff; font 700 16px 'DM Sans'; shadow 0 8px 20px -8px rgba(217,140,99,.7)`. Text "Save task" (or "Save changes" when editing). The top-bar "Save" mirrors this state (disabled `#C6C2B9` → terracotta when valid).
- **Cancel**: the top-bar "Cancel" text button (`#9B948B`); no separate footer button.

**Sample Content Examples by Persona:**

**Alex (Busy Parent):**
- Task: "Schedule pediatrician visit"
- Category: Child Health (#14B8A6)
- Frequency: Every 6 months
- Time: 15min
- Notes: "Call during lunch break"

**Jordan (New Homeowner):**
- Task: "Check HVAC filter"
- Category: Home Maintenance (#F59E0B)
- Frequency: Every 3 months
- Time: 15min
- Notes: "Mark calendar for next check"

**Pat (Active Retiree):**
- Task: "Video call with grandchildren"
- Category: Social Connections (#818CF8)
- Frequency: Every 2 weeks
- Time: 30min
- Notes: "Sunday afternoons work best"

**Validation and Error States:**
- Real-time validation with helpful messages
- Required field indicators
- Success feedback on save
- Keyboard shortcuts (Enter to save, Esc to cancel)

---

## 3. By Category View (Tasks grouped by room / area)

**Context:** Tasks grouped under color-coded category headers. Design source:
option 3a (light), 4b (dark). This is the default view; the view toggle reads
**By Category** active.

**Layout Requirements:**
- Shared shell (§1): header + "By Category / By Time" toggle (By Category active)
- Category groups in sequence, each a dot+name+count header followed by its rows
- Rows use the shared task-row design (§1); in this view the meta line shows the greige **time-estimate chip** (no category tag — the group header already carries the category)

**Visual Design Specifications:**
- **Category header**: a 12px solid color dot + category name (Bricolage 700 14px `#3A3330`) + a plain count (DM Sans 500 12px, AA-safe `#6E675E`) — e.g. "● Kitchen 3". Header block padding ≈ `14px 20px 6px`, gap 9px.
- **Time-estimate chip** (row meta): `#EFEBE3` fill, `#8A8177` text, radius 9px, `● 15 min` / `●● 30 min` / `●●● 1 hr`
- Overdue rows keep the soft terracotta card border and "!" badge from §1
- Dark (4b): header text `#F3EEE7`, count `#8F887E`, dot uses the solid base hue; time chip `#332F29` fill / `#A69E93` text

**Category Header Behaviors (beyond the mock):**
- The 3a/4b mocks show flat groups (dot + name + count, no chevrons or icons).
  Collapse/expand, per-category icons, and inline management are enhancements
  not shown in the design — if added, keep the header a ≥48px touch target and
  place the chevron at the trailing edge.

**Enhanced Features:**
- **Filter Options:**
  - "Show Overdue Only"
  - "Recently Completed"
  - "No Time Set"

- **Category Management:**
  - "Add Category" button
  - Edit category (long press or edit mode)
  - Reorder categories (drag handles)

**Sample Layout:**
```
How Long Since                                    ⚙
[  By Category  |      By Time      ]

● Kitchen  3
○ Descale coffee maker      [● 15 min]           1 wk
○ Deep clean refrigerator   [●● 30 min]      ! 2 wk   (soft terracotta border)
○ Clean oven                [●●● 1 hr]             3 d

● Bathroom  2
○ Restock toiletries        [● 15 min]           Yest.
○ Clean shower grout        [●●● 1 hr] VERY OVERDUE  ! 3 mo   (border)

● Pets  2
○ Apply flea treatment      [● 15 min]        ! 5 wk   (border)
○ Clean pet bedding         [●● 30 min]            3 d

+ Add Category
```
(● = solid category dot · ○ = 30px circle checkbox · [chip] = greige time-estimate chip · ! = terracotta badge · a terracotta "+" FAB floats fixed in the lower-right)

**Empty State:**
- Friendly illustration
- Text: "No tasks in this category. Add one?"
- "Add Task" button

**Accessibility Enhancements:**
- Screen reader announces category name and task count
- Keyboard navigation between categories
- Focus management for expand/collapse
- Skip links for long category lists

---

## 4. By Time View (Tasks by time required)

**Context:** Groups tasks by the time commitment required, helping users find
tasks that fit their available time. Design source: option 2a (light), 4a
(dark). The view toggle reads **By Time** active.

**Layout Requirements:**
- Shared shell (§1): header + toggle (By Time active)
- A prominent **Quick pick** panel at the top, then time-commitment sections in order
- Rows use the shared task-row design (§1); in this view the meta line shows the category **tinted tag** + muted time-estimate text (so the category is visible without a group header)

**Visual Design Specifications:**
- **Section marker**: 22px circle `#EFEBE3` fill with `#C0794C` filled-circle glyphs (`●` / `●●` / `●●●`), followed by the section title (DM Sans 700 13px `#3A3330`) and a count ("15 min · 3", AA-safe `#6E675E`)
- **Category tag** (row meta): tinted background + saturated text per `docs/style-guide.md` §1.4 (e.g. Kitchen bg `#E4EDFB` / text `#3B6FD4`), radius 9px, DM Sans 600 10px; followed by muted `● 15 min`
- Dark (4a): section circle `#302C27` / `#E8875A` glyph; tags go luminous-on-dark (Kitchen `rgba(59,130,246,.18)` / `#7FB0FF`, etc.)

**Time Commitment Sections (in order):**
1. **Quick tasks** — 15 min ●
2. **Short tasks** — 30 min ●●
3. **Medium tasks** — 1 hr ●●●
4. **Longer tasks** — 2 hrs ●●●●
5. **Big projects** — 4+ hrs ●●●●●
6. **No time set** (tasks without an estimate)

**Quick Pick Panel:**
- Container: `background linear-gradient(180deg,#F3F1EB,#FAF9F5); border 1px solid #E7E2D8; radius 20px; padding 16px 18px`, margin `4px 16px 10px`
- Header: ☀ sun glyph + "Quick pick" (`#C0794C`, DM Sans 700 12px) + subline "How much time do you have?" (`#6E675E`)
- Contains 2–5 matching tasks as standard rows at a tighter radius (15px) and lighter shadow (`0 2px 8px -4px rgba(70,62,55,.16)`)
- Dark (4a): panel gradient `#2B2620 → #232019`, border `#37322C`, label `#E8875A`

**Task Row in this view:**
- Same row as §1, with the category **tinted tag** in the meta line (not a greige time chip)
- Keep the elapsed time prominent (Bricolage 600 15px, status-colored)
- Same "Just Done" checkbox behavior

**Sample Layout:**
```
How Long Since                                    ⚙
[      By Category      |  By Time  ]

┌ ☀ Quick pick ──────────────────────────────────┐
│ How much time do you have?                      │
│ ○ Descale coffee maker  [Kitchen] ● 15 min  1 wk│
│ ○ Apply flea treatment  [Pets] ● 15 min   ! 5 wk│
└─────────────────────────────────────────────────┘

● Quick tasks   15 min · 3
○ Check tire pressure    [Vehicles] ● 15 min       2 wk
○ Water plants           [Garden] ● 15 min     🕐 3 d   (due soon, amber)
○ Restock toiletries     [Bathroom] ● 15 min      Yest.

●● Short tasks  30 min · 3
○ Deep clean refrigerator [Kitchen] ●● 30 min  ! 2 wk   (border)
○ Clean pet bedding       [Pets] ●● 30 min         3 d
○ Vacuum furniture        [Living] ●● 30 min       1 wk

●●● Medium tasks  1 hr · 2
○ Clean shower grout  [Bathroom] ●●● 1 hr VERY OVERDUE ! 3 mo
○ Clean oven          [Kitchen] ●●● 1 hr           3 d
```
([Category] = tinted category tag · ● markers = greige section circle · 🕐 = due-soon clock · ! = overdue badge · a terracotta "+" FAB floats fixed in the lower-right)

**Time-Based Insights:**
- Show task distribution across time commitments
- Highlight if user has many long tasks overdue
- Suggest task combinations that fit available time

**Filtering Options:**
- "I have X minutes" slider/input
- "Show overdue first"
- "Recently completed" toggle

---

## 5. Settings Page Prompt

**Context:** Design a settings and preferences page that allows users to customize their experience, manage data, and access help resources.

**Layout Requirements:**
- Clean, organized sections
- Clear section headers
- Toggle switches and selection controls
- Data management options
- Help and support links

**Visual Design Specifications:**
- Same Soft Daylight color system and typography (`docs/style-guide.md`)
- Section dividers: 1px warm hairlines (`#E4E0D8` / `#EDEAE2`)
- Settings row icons (24px × 24px), muted `#9B948B`
- Toggle switches use the terracotta accent (`#D98C63`) when active
- Danger-zone styling for destructive actions (overdue-terracotta text/border, not a new red)

**Settings Sections:**

**1. Appearance**
- **Theme Selection:**
  - Light mode (default)
  - Dark mode  
  - System preference
  - Visual preview thumbnails

- **Text Size:**
  - Default
  - Large (125%)
  - Larger (150%)
  - Real-time preview

- **Accessibility:**
  - High contrast mode toggle
  - Reduced motion toggle
  - Screen reader optimizations
  - Touch target size (Standard/Large)

**2. Default View**
- Radio buttons for:
  - By Category (default)
  - By Time
- Helper text: "Choose your preferred starting view"

**3. Notifications** (Future feature)
- Overdue task reminders toggle
- Backup reminders toggle
- Time preferences

**4. Data Management**
- **Backup Section:**
  - Last backup date display
  - "Export Data" button (sage accent `#5B9E86`)
  - "Import Data" button
  - Auto-backup frequency setting

- **Data Actions:**
  - Export as CSV
  - Export as JSON (full backup)
  - Import from backup
  - Clear all data (danger zone)

**5. Categories**
- "Manage Categories" button
- Quick category reordering
- Default category restoration

**6. About & Help**
- App version information
- "User Guide" link
- "Privacy Policy" link  
- "Send Feedback" link
- "About the App" information

**Sample Layout:**
```
⚙️ SETTINGS

APPEARANCE                                        
🎨 Theme                    Light Mode           >
📝 Text Size               Default              >
♿ Accessibility           High Contrast    [ ○ ]

DEFAULT VIEW
📋 Starting View           By Category      ( ● )
                          By Time          (   )

DATA MANAGEMENT
💾 Last Backup            July 10, 2024
📤 Export Data                              [Export]
📥 Import Data                              [Import]

CATEGORIES
📁 Manage Categories                             >

ABOUT & HELP
📖 User Guide                                    >
💬 Send Feedback                                 >
ℹ️  About How Long Since    v1.0.0               >

⚠️  DANGER ZONE
🗑️  Clear All Data                          [Clear]
```

**Interactive Elements:**
- Toggle switches with clear on/off states
- Confirmation dialogs for destructive actions
- Success feedback for data operations
- Progress indicators for import/export

**Accessibility Features:**
- All controls keyboard accessible
- Screen reader labels for all toggles
- Confirmation requirements for dangerous actions
- Clear hierarchy and navigation

---

## Additional Pages to Consider

For a complete prototype, you might also want to create prompts for:

1. **Empty States** - First-time user experience with no tasks
2. **Task Detail/Edit Modal** - Expanded view of individual tasks
3. **Category Management** - Creating and editing categories
4. **Onboarding Flow** - Welcome screens and initial setup
5. **Error States** - Connection issues, validation errors
6. **Data Import/Export** - File handling interfaces
7. **Help/Tutorial** - Interactive guidance system

Each of these would follow the same design system principles with specific contextual requirements.