# Phase 1 planning corpus (frozen)

This folder holds the planning documents that guided the Phase 1 MVP
(July 2026), kept as a historical record — `../phase1.md` has the plan, step
index, and decisions register that used them.

On 2026-07-07 the documents that remain **living references** moved back to
[`/docs`](../../../docs) (renamed, and revised there to match the shipped
1.0.0 app):

| Was here | Now lives at |
|---|---|
| `requirements.md` | `docs/REQUIREMENTS.md` |
| `style-guide.md` | `docs/STYLE_GUIDE.md` |
| `content-strategy-guide.md` | `docs/CONTENT_STRATEGY_GUIDE.md` |
| `architecture/tech.md` + `architecture/design.md` + `architecture/structure.md` | merged into `docs/ARCHITECTURE.md` |

Still here as **historical artifacts** (superseded — don't update):

- `product-briefing.md` — the original product vision. It predates the Quick
  Wins view and Phase 1.1; the maintained overview and roadmap live in the
  root `README.md`.
- `app-pages-prompts.md` — page-by-page mockup prompts from the design
  exploration. The shipped UI is the source of truth now; source comments
  still cite its section numbers as shorthand.

The frozen pre-migration versions of the moved docs are retrievable from git
history (e.g. `git log --follow -- dev/2026-07-01_phase1-mvp/docs/style-guide.md`).
Links inside the phase1 plan/step files intentionally still use the old
`docs/…` paths they were written against.
