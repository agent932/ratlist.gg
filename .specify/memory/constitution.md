<!--
Sync Impact Report
- Version change: 1.0.0 → 1.1.0
- Modified principles: Added VI. Community Content Policy (NON-NEGOTIABLE)
- Added sections: Product Scope, Disclaimers & Positioning
- Removed sections: none
- Templates updates:
  ✅ .specify/templates/plan-template.md (Constitution Check gates expanded)
  ✅ .specify/templates/spec-template.md (added Safety & Fairness section)
  ✅ .specify/templates/tasks-template.md (tests REQUIRED; added T&S examples)
  ⚠ .specify/templates/commands/* (no command templates present)
- Follow-up TODOs: TODO(RATIFICATION_DATE)
-->

# ratlist.gg Constitution

## Core Principles

### I. Security Baseline (NON-NEGOTIABLE)

- All non-static endpoints MUST require authenticated access; explicitly public endpoints MUST be documented.
- Inputs MUST be validated and sanitized; use parameterized queries; disable eval-like execution.
- Secrets MUST be sourced from environment or a managed vault; no secrets in repo, logs, or crash reports.
- Dependencies MUST be scanned weekly; high/critical CVEs MUST be remediated within 7 days (or pinned/mitigated with justification).
- Transport MUST use TLS in all environments handling user data.

Rationale: Security failures are the highest risk for a web app and must be prevented proactively.

### II. Accessibility & UX Baseline

- Primary flows (navigation, auth, forms) MUST meet WCAG 2.1 AA for contrast, labels, and focus order.
- The UI MUST be fully keyboard navigable with visible focus states; use semantic HTML and ARIA only when necessary.
- Images MUST have meaningful `alt` text; dynamic content MUST announce changes to assistive tech.
- Layout MUST be responsive for common mobile and desktop viewports.

Rationale: Accessibility and basic responsiveness are non-negotiable for usability and compliance.

### III. Testing & CI Minimums

- Unit tests MUST cover critical business logic and utility functions (minimum: the modules invoked by P1 flows).
- End-to-end smoke tests MUST cover at least one happy path per P1 user story.
- CI on every PR MUST run linting and all tests; merges MUST be blocked on failing CI.
- A basic staging deployment or preview build SHOULD be produced for manual verification on P1 changes.

Rationale: Minimal automated tests and CI prevent regressions in core flows at low cost.

### IV. Observability & Health

- Services MUST emit structured logs (JSON) at boundaries with correlation/trace IDs.
- A global error handler MUST return a stable error shape including a trace ID without leaking sensitive data.
- A `/health` or equivalent endpoint MUST report application readiness and dependencies (e.g., DB connectivity).
- Production MUST capture unhandled errors via an error tracker (e.g., Sentry, equivalent) or platform-native alerts.

Rationale: Visibility into failures and health is essential for operating a web app.

### V. Performance & Simplicity

- Frontend SHOULD meet Core Web Vitals targets at p75: LCP < 2.5s, INP < 200ms, CLS < 0.1 for primary pages.
- Backend P1 endpoints SHOULD meet p95 latency < 300ms under expected load; document load assumptions in plans.
- Prefer standard libraries and minimal dependencies; avoid premature optimization and unnecessary abstraction.
- Breaking API changes MUST be versioned or gated; public contracts MUST include clear versioning.

Rationale: Fast, simple systems are cheaper to build, run, and maintain.

### VI. Community Content Policy (NON-NEGOTIABLE)

- Content is user-generated opinion; the site MUST NOT claim incident reports are verified facts.
- The product MUST clearly state it is not affiliated with or endorsed by any game studio and is not an enforcement system.
- Reports MUST NOT include real-life personal information (PII), doxxing, slurs, or threats; such content MUST be rejected or removed.
- A visible mechanism MUST exist to flag content for review and to request removal/appeal; triage may be manual initially.
- No brigading, stalking, or harassment: the UI and community guidelines MUST discourage targeted abuse.
- Reputation is descriptive and fun; labels MUST avoid defamatory assertions; reputation is per game, not global.

Rationale: Clear boundaries protect users, the community, and the project.

## Non‑Functional Standards

- Configuration MUST come from environment variables with sensible defaults for local development.
- CORS MUST restrict origins to approved domains in non-local environments.
- Public endpoints MUST have basic rate limiting appropriate to expected usage.
- Data privacy: Any PII MUST be identified, purpose-limited, and removed from logs.
- API contracts MUST declare versions (URL or header) when externally consumed.
- Builds MUST be reproducible; lock files committed; artifact provenance traceable.
- Browser support: last two major versions of modern browsers; progressive enhancement for others.

## Product Scope

- Multi-game support: each incident MUST be associated with a specific game; optional mode/map/region metadata MAY be included.
- Player identity is game-specific (e.g., in-game name, platform ID); the same human may appear across identities.
- Incidents MUST include: reported player(s), game, category, short description, and approximate date/time.
- Reputation tiers MUST be computed per game from incident history and presented as descriptive tiers (e.g., F–S).

## Development Workflow

- Trunk-based development with short-lived feature branches; Conventional Commits for message format.
- Every PR MUST include a “Constitution Check” confirming adherence to Security, Testing, and Observability.
- At least one reviewer MUST approve PRs; high-risk changes (security/auth, data model) require two approvals.
- Releases MUST be documented with changelogs; infrastructure changes tracked as code.
- Exceptions to principles MUST be documented in the plan’s “Complexity Tracking” and time-bound.

## Governance

- This Constitution supersedes other practices where conflicting. Compliance is reviewed in PRs and periodic audits.
- Amendments: open a PR labeled `constitution` with rationale, impact, and migration plan; require approval by
	CODEOWNERS or two maintainers. Upon merge, update version and Last Amended date.
- Versioning Policy (for this document):
	- MAJOR: Backward-incompatible governance or removal/redefinition of principles.
	- MINOR: New principles/sections or materially expanded guidance.
	- PATCH: Clarifications and non-semantic edits.
- Review Cadence: at least quarterly, or after significant incidents.

**Version**: 1.1.0 | **Ratified**: TODO(RATIFICATION_DATE): original adoption date not recorded | **Last Amended**: 2025-12-01
