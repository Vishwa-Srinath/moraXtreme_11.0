# Layout Architecture

## Macro Shell

`/register` uses a focused registration shell inside `AppShell`. The shell keeps a compact sticky header with MoraXtreme identity and a home link, while the route content uses full-page scroll rather than independent panes.

The registration workspace is a two-pane layout on desktop:

- Left pane: sticky registration introduction and a single event-facts card.
- Right pane: a segmented progress line followed by one wizard card per step.
- Mobile: single-column flow with the title, progress line, and form. Event facts are hidden.

## Containers

`PageContainer` defines the primary horizontal boundary with fluid edge padding and a wide maximum content width. `SectionWrapper` defines route-level vertical rhythm with fluid section padding.

Component interiors prefer container-query-ready wrappers through `@container`, so field groups and review cards can reflow based on their available width rather than only the viewport.

## Registration Grid

The registration page uses:

- A narrower contextual column and a wider form column on desktop, with the form on the right.
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

The page uses full-page scroll with the global header sticky at the top. On desktop, the left introduction and event facts remain sticky below the header while the form scrolls naturally. On mobile, primary wizard actions are sticky at the bottom of the form card to reduce long-form navigation friction.

## Reusable Layout Components

- `src/components/layout/AppShell.tsx` provides the route shell header.
- `src/components/layout/PageContainer.tsx` provides max-width and fluid edge padding.
- `src/components/layout/SectionWrapper.tsx` provides fluid vertical section rhythm.

## Data-Driven Availability

Registration availability is read from `app_settings` and computed server-side. When registration is closed or not yet open, `/register` renders a focused closed state instead of the wizard.
