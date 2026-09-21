# Layout Architecture

## Macro Shell

`/register` uses a focused registration shell inside `AppShell`. The shell keeps a compact sticky header with MoraXtreme identity and a home link, while the route content uses full-page scroll rather than independent panes.

The registration workspace is a two-pane layout on desktop:

- Main pane: one wizard card per step, constrained by the page container.
- Side pane: sticky event facts, progress, and a minimal live summary.
- Mobile: single-column flow with a horizontal progress strip above the form.

## Containers

`PageContainer` defines the primary horizontal boundary with fluid edge padding and a wide maximum content width. `SectionWrapper` defines route-level vertical rhythm with fluid section padding.

Component interiors prefer container-query-ready wrappers through `@container`, so field groups and review cards can reflow based on their available width rather than only the viewport.

## Registration Grid

The registration page uses:

- `lg:grid-cols-[minmax(0,1fr)_22rem]` for the focused desktop form plus side panel.
- Fluid gaps through arbitrary clamp values.
- Single-column mobile stacking to preserve natural browser scroll and reliable sticky mobile actions.

## Wizard Structure

Each wizard step renders as one card. Long content is grouped with internal dividers, helper blocks, and two-column container-query grids where space allows.

Steps are dynamic:

- Team Details
- Team Leader
- Team Member 1 when team size is at least 2
- Team Member 2 when team size is 3
- Review & Submit

Forward movement is validation-gated. Backward movement is allowed to completed steps.

## Scroll And Sticky Behavior

The page uses full-page scroll with the global header sticky at the top. On desktop, the side panel is sticky below the header. On mobile, primary wizard actions are sticky at the bottom of the form card to reduce long-form navigation friction.

## Reusable Layout Components

- `src/components/layout/AppShell.tsx` provides the route shell header.
- `src/components/layout/PageContainer.tsx` provides max-width and fluid edge padding.
- `src/components/layout/SectionWrapper.tsx` provides fluid vertical section rhythm.
- `src/components/layout/BentoGrid.tsx` provides a container-query grid utility for future showcase sections.

## Data-Driven Availability

Registration availability is read from `app_settings` and computed server-side. When registration is closed or not yet open, `/register` renders a focused closed state instead of the wizard.
