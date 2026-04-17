# Coding Rules

THIS TO BE FOLLOWED WHEN WORKING ON /web 

## Purpose

This file is the source of truth for implementation rules in this repository. Any agent or contributor working here must follow these rules unless the user explicitly overrides them.

## Core Principles

- Follow DRY. Reuse code intentionally, but do not centralize too early.
- Prefer distributed modules. Centralization happens only when there is a clear repeated need.
- Keep files narrow in scope. A file should have one reason to change.
- Favor explicit structure over convenience helpers hidden in unrelated files.

## Project Layout

- The application lives under `web/`.
- Shared top-level UI components live in `web/components/`.
- Shared top-level contexts live in `web/contexts/`.
- Shared top-level hooks live in `web/hooks/`.
- Shared root constants live in `web/constants/`.
- Route-specific code should stay close to the route that owns it.

## Route-Scoped Organization

- If a component is only used by a specific route, place it in a route-local `(components)` folder.
- If a hook is only used by a specific route, place it in a route-local `(hooks)` folder.
- If a state module is only used by a specific route, place it in a route-local `(states)` folder.
- If a utility is only used by a specific route, place it in a route-local `(utils)` folder.
- If a constants module is only used by a specific route, keep it at the route level, for example `app/(guest)/landing.constants.ts`.
- Do not promote route-local code to top-level shared folders until reuse is real and justified.

## File Responsibilities

- Every component file exports exactly one component.
- Types always live in their own file.
- State modules always live in their own file and export one state module.
- Utilities always live in their own file.
- Context definitions, providers, hooks, and types should be split into dedicated files when the context is non-trivial.
- A component file should not also contain unrelated state, utility, or type declarations.
- A state file should not also contain utilities or components.
- A utility file should not also contain components or state.

## Frontend Styling

- FOLLOW THE DESIGN IN DESIGN.md but make sure to use shadcn components and Tailwind classes for styling.
- Use shadcn components as the primary design schema.
- Default to the built-in shadcn styling before adding custom Tailwind styling.
- Add Tailwind classes only when they are necessary for layout, spacing, positioning, responsiveness, or a clearly intentional visual adjustment.
- Do not over-style components when the shadcn defaults already solve the problem.

## Constants and Links

- All app links must live under `web/constants/links/`.
- Split links by usage, for example `auth.ts`, `guest.ts`, and similar domain files.
- `web/constants/links/index.ts` must export the aggregated `links` object that groups links by usage.
- Components and pages should consume links from the aggregated `links` object instead of hardcoding paths locally.
- Non-link constants that are specific to a route, such as media URLs, local section ids, or route-specific display constants, should stay in route-level constants files.

## Context Architecture

- Shared app contexts live under `web/contexts/`.
- Each context should follow a distributed structure with dedicated files for types, context creation, provider, and hook when appropriate.
- The root layout consumes global providers such as the theme provider.
- Theme management uses `next-themes` as the default solution instead of a custom theme context.
- Use `ThemeProvider` and `useTheme` from `next-themes` unless the user explicitly requests a different approach.
- Reusable global UI controls that depend on shared context, such as a theme toggle, belong in `web/components/`.


## Middleware Architecture

- Middleware code lives under `web/middlewares/`.
- Split middleware modules by usage and concern.
- `web/proxy.ts` consumes and composes the middleware structure.
- Do not collapse unrelated middleware logic into a single large file unless there is a strong reason.

## Server Boundaries

- Never expose a server file without importing `"server-only"`.
- This rule is strict for anything under `web/infrastructure/`.
- Files under `web/infrastructure/` may only be consumed by server actions or API/server entrypoints.
- Never create an actions file without `"use server"`.
- Keep server-only logic out of client bundles.

## Prompt Transparency

- Every prompt used in the project must be logged in `PROMPTS.md` at the repository root.
- Every prompt log entry must include a short summary of the assistant reply.
- Keep prompt logging current as part of the implementation work, not as an afterthought.

## Current Non-Goal

- Do not introduce tests yet unless the user explicitly asks for them in a later step.

## Delivery Standard

- Before adding new modules, verify they fit this structure.
- If a proposed change conflicts with these rules, prefer the rules unless the user explicitly changes them.
- If centralization is proposed, justify why local distribution is no longer sufficient.
