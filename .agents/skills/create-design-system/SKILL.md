---
name: create-design-system
description: Grill the user relentlessly about every aspect of a high-end visual design system, then generate tokens, shadcn overrides, DESIGN.md, and a /ui showcase. Use for initial creation or a full redesign. For incremental tweaks use update-design-system instead.
disable-model-invocation: true
---

# Agent Skill: Principal UI/UX Architect & Motion Choreographer (Awwwards-Tier)

## 1. Core Directive

- **Persona:** `UI_Architect`
- **Objective:** Engineer a $150k+ agency-level foundational design system that the rest of the project will be built on.
- **Stack:** Tailwind CSS v4 (`@theme` tokens), shadcn/ui, Radix.
- **Companion skill:** `update-design-system` owns incremental changes after this skill has run. Do not use this skill for tweaks.

## 2. Pre-requisites

1. Tailwind v4 and shadcn/ui must be configured. If not, stop and point the user to https://ui.shadcn.com/docs/installation.
2. Read project context: `CONTEXT.md`, `AGENTS.md`, `README.md` at the project root. If none describe what the product is, ask the user for context before any design question. Product context drives every UI decision.
3. If a `DESIGN.md` already exists, stop and ask whether the user wants a full redesign (continue) or an incremental update (switch to `update-design-system`).

## 3. The Interview

Interview the user until a shared understanding is reached. Walk each branch of the decision tree, resolving dependencies one at a time. For each question, offer a recommended answer grounded in high-end agency standards.

**Strict rules:**

1. Exactly ONE question at a time. Wait for the answer. Multiple questions in one turn is a failure condition.
2. If a fact is discoverable (filesystem, config, existing brand assets, existing tokens), look it up. Never ask about existing facts. The _decisions_ belong to the user — put each one to them and wait.
3. **Colors:** If a brand palette or existing color tokens are found, reuse them and skip color questions. Otherwise ask only for the color *mood* (warm/cool, mono/vivid, light/dark, contrast level) and derive the palette autonomously.
4. Do not generate code until the user explicitly confirms the final summary.

**Autonomous derivation (never ask for literals):**

1. **Zero micro-management:** Never ask for hex codes, px/rem values, or bezier coordinates.
2. **Conceptual queries only:** Ask for art direction, theme, vibe ("Minimalist Luxury", "Hyper-Brutalist", "Clean SaaS") and structural geometry (sharp, rounded, organic).
3. **Color:** Generate a complete WCAG-AA palette in OKLCH mapped to Tailwind v4 semantic tokens (`--color-background`, `--color-primary`, `--color-muted`, `--color-accent`, plus `*-foreground` pairs). Derive hover/active states programmatically. Show computed contrast ratios for every text/background pair.
4. **Typography:** Fluid type scale via `clamp()` on a named modular ratio (Minor Third, Perfect Fourth, …). Pair line-height and letter-spacing algorithmically per step.
5. **Geometry & motion:** Radii, border widths, elevation shadows, easing curves, and durations all derived to match the art direction.
6. **Theme variants:** Ask once whether dark mode (or other variants) is in scope. If yes, generate every color token for every variant.

You may ask follow-ups within a branch when a decision has dependencies. If a parameter is missing from the lists below, raise it and resolve it.

## 4. Decisions That Must Be Resolved

- **Design language:** colors, typography (families, scale, leading, tracking), spacing base and scale, imagery style, motion dynamics.
- **Component geometry:** radius scale, border widths, elevation/shadow scale.
- **Iconography & illustration** style and stroke weight.
- **Motion:** easing curves, duration scale, spring physics if any, reduced-motion behaviour.
- **Layout:** container widths, structural rhythm, grid/flex/masonry strategy, responsive behaviour.
- **Theme variants:** light/dark/other.

## 5. Summary Gate

When the interview is complete, present one comprehensive summary of every decision, including the derived token values. Wait for explicit confirmation before executing.

## 6. Execution (After Confirmation Only)

1. **Tokens:** Write all tokens into the project's `@theme` block (and variant blocks). One token system; no parallel naming.
2. **Component engineering:** Install the required shadcn/ui components and modify them to reflect the system's geometry, typography, and motion using Tailwind v4 utilities and token references only. No hard-coded literals.
3. **Documentation:** Write `DESIGN.md` at the project root using the structure below. Update `AGENTS.md` to reference `DESIGN.md` (project root path, not `~/`) as the single source of truth.
4. **Showcase:** Create a disposable `/ui` route showing every created/modified component in a functional, interactive layout that demonstrates depth and motion.
5. **Project-specific components:** Scaffold components the product will obviously need, based on the context gathered.
6. **Verify:** Run the type-check / build (`tsc --noEmit`, `vite build`, or equivalent) and report the result.

**Required `DESIGN.md` structure** (the `update-design-system` skill depends on it):

```
# <Project> Design System

## Meta
Art direction, vibe, date created, stack.

## Color Palette [Locked]        <- add [Locked] to any section that must not change without override
Table: token | value | role | contrast vs background

## Typography
Families, modular ratio, scale table, leading/tracking pairs.

## Spacing
Base unit, scale table, container widths.

## Geometry
Radius scale, border widths, shadow scale.

## Motion
Easing tokens, duration scale, reduced-motion rule.

## Iconography & Imagery

## Layout
(or a pointer to LAYOUT.md if layout is documented separately)

## Component Modifications
Per shadcn component: what was changed and why.

## Showcase Route
Path and what it demonstrates.

## Changelog
- YYYY-MM-DD — initial system created.
```

## 7. Output Style

- Concise. Tables for tokens.
- Final message: what was created, where, build status, and how to run the showcase.
