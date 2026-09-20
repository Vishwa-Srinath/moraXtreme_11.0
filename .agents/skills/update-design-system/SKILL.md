---
name: update-design-system
description: Incrementally update an already-built design system. Use when the user wants to change theme colors, border radius, sizing, spacing, typography scale, shadows, motion, or a small set of tokens without rebuilding the whole system. Triggers include update design system, tweak theme, change colors, adjust radius, refine tokens, restyle existing system, fix design tokens.
---

# Agent Skill: Design System Updater (Surgical Edits)

## 1. Core Directive

- **Persona:** `UI_Architect`
- **Objective:** Precise, low-churn updates to an existing design system. Smallest change set that achieves the requested shift while keeping the system coherent.
- **Stack:** Tailwind CSS v4 (`@theme` tokens), shadcn/ui, Radix.
- **Companion skill:** `create-design-system` owns initial creation. If the request needs a new art direction, stop and offer that skill instead.

## 2. Pre-requisites

Locate the design system. Search in this order and stop at the first hit:

1. `DESIGN.md` at the project root (legacy: `~/DESIGN.md`)
2. CSS tokens: `@theme` block in `index.css` / `globals.css` / `app.css`
3. `components/ui/` (shadcn)
4. `AGENTS.md` referencing design tokens

Also read any companion docs `AGENTS.md` points at (e.g. `LAYOUT.md`, `CONTEXT.md`). Spacing/container changes must stay consistent with them.

If nothing is found, stop and tell the user to run `create-design-system` first.

## 3. Philosophy

- **Scope control:** Touch only the axes requested. Never widen the surface without an explicit ask.
- **Preserve what works:** Unrelated tokens, components, and motion stay untouched.
- **Coherence over literalism:** A change to one token may require a dependent adjustment (radius → shadow softness, primary → foreground contrast, spacing base → container padding). Propose these; do not apply silently.
- **Respect locks:** Any section of `DESIGN.md` marked `Locked` / `Frozen` is read-only. Changing it requires an explicit user override, recorded in the changelog.
- **No redesign by stealth:** If more than ~3 axes need to move, or the palette/typeface family changes, ask whether this is really a redesign.

## 4. Discovery (Silent, Before Any Question)

1. **Read** `DESIGN.md`, the `@theme` block, theme variants (`.dark`, `[data-theme]`, `prefers-color-scheme`), and the components relevant to the requested axes.
2. **Drift audit.** Compare documented tokens against real CSS. Flag:
   - Tokens documented but missing in CSS, or present in CSS but undocumented
   - Broken references (e.g. `var(--card)` when the token is `--color-card`)
   - Comments that lie (e.g. "OKLCH" over hex values)
   - Docs pointing to wrong paths (`~/DESIGN.md` vs project root)
   Report drift in one short block. Ask whether to fix it in this pass or leave it out of scope. Do not silently edit drifted docs as if they were correct.
3. **Blast-radius scan.** For every token in scope, grep `src/` (and the showcase route if one exists) for hard-coded equivalents: raw hex/oklch, `rounded-[`, `shadow-[`, `duration-`, `ease-[`, `p-[`, etc. Record files and counts; they go in the Update Plan.
4. **Variant detection.** If theme variants exist, every color change must be proposed for each variant, or explicitly scoped to one.

## 5. Interview

**Fast path:** If the request is fully specified (e.g. "change primary to #1a1a1a", "bump all radii one step"), skip the interview and go straight to the Update Plan.

Otherwise interview only the requested axes.

**Rules:**

1. ONE question at a time. Wait for the answer.
2. Conceptual, not literal: ask for direction ("warmer / higher contrast", "more rounded / sharper", "tighter / airier", "softer / snappier motion"), not hex or px. Accept literals if volunteered.
3. Never re-ask anything discoverable from the filesystem or `DESIGN.md`.
4. 2–6 questions total. This is a tweak, not an interrogation.
5. No code until the Update Plan is approved.

**Flow (adapt as needed):**

- Confirm axes in scope.
- Direction of change per axis.
- Surface coherence side-effects; ask whether to include the dependent adjustments.
- Present the Update Plan.

**Derivation:** Once direction is clear, compute exact values yourself (OKLCH palettes, `clamp()` type scales, radius steps, shadow elevations, easing curves). Reuse the project's existing token names and structure. Never introduce a parallel token system.

## 6. Update Plan (Gate — Requires Approval)

Present a compact plan:

```
## Update Plan
Axes: radius, shadows (dependent)
Locked sections touched: none

| Token          | Before   | After    |
|----------------|----------|----------|
| --radius-md    | 0.75rem  | 1rem     |
| --shadow-md    | ... 20px | ... 24px |

Variants: light only (no .dark present)
Contrast: primary/primary-foreground 14.2:1 (AA pass)

Files:
- frontend/src/index.css        (tokens)
- DESIGN.md                     (docs + changelog)
- src/components/ui/card.tsx    (1 hard-coded rounded-[12px] → rounded-md)

Drift fixes included: shadow var(--card) → var(--color-card)
Untouched: colors, typography, spacing, motion
```

**Contrast gate:** Any change to a `--color-*` / `*-foreground` pair must show computed WCAG ratios. Flag < 4.5:1 (text) or < 3:1 (UI) and propose an adjusted value.

Wait for explicit approval.

## 7. Execution (After Approval Only)

1. **Tokens first:** Edit the `@theme` block (and each variant block). Keep names and ordering.
2. **Docs:** Update `DESIGN.md` values, then append a changelog entry (see format below). Create the `## Changelog` section if absent.
3. **Propagate:** Fix only the hard-coded values found in the blast-radius scan. Replace literals with token references; do not restyle beyond that.
4. **AGENTS.md / companion docs:** Correct any stale path or value they reference.
5. **Showcase:** If a `/ui` or design-system route exists, make sure the changed tokens are visible there. Do not create one unless asked.
6. **Verify:** Run the project's type-check / build (`tsc --noEmit`, `vite build`, or equivalent). A typo in `@theme` silently kills every token below it. Report the result.

**Changelog format (append to `DESIGN.md`):**

```
## Changelog
- 2026-09-15 — radius: md 0.75rem → 1rem, lg 1rem → 1.25rem. Reason: softer card feel. Side-effects: shadow-md blur 20px → 24px. Files: index.css, DESIGN.md, card.tsx.
- 2026-09-15 — drift fix: shadow tokens referenced var(--card); corrected to var(--color-card).
```

## 8. Output Style

- Concise. Tables over prose for token changes.
- After execution: one short summary — what changed, what was fixed as drift, what was deliberately left alone, build status.
- No new components, layouts, or motion systems unless the approved plan includes them.
