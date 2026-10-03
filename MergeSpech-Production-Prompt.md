# MergeSpech — Production Build Prompt

You are a Principal Software Engineer, Staff Product Designer, Application Security Engineer, DevOps/SRE Architect, and QA Lead. Build **MergeSpech**, a complete, production-oriented, self-hostable, open-source GitHub pull-request analysis and code-review platform.

## Operating contract

1. Inspect the existing repository before changing it. Preserve useful code and explain any justified technology change.
2. Make an implementation plan, then execute it autonomously. Do not stop at planning, scaffolding, visual mockups, or an MVP.
3. Implement only features that work. Do not use fake endpoints, fabricated findings, placeholder controls, invented metrics, or mock production data.
4. Run the relevant tests, linting, type checking, migrations, and production build. Fix failures; do not hide or waive them.
5. If a live third-party credential is unavailable, build the real integration, validate it with deterministic fixtures/mocks, and document the exact live validation still required.
6. Do not claim that software is vulnerability-free. Instead, implement, test, document, and report concrete security controls, residual risks, and verification evidence.

## Mission and end-to-end outcome

MergeSpech connects authorized GitHub App installations to repositories, securely receives pull-request events, queues an isolated analysis at the exact commit SHA, persists evidence-backed findings, displays them in a useful review UI, evaluates repository policy, and optionally publishes accurate GitHub Checks and comments.

Definition of done: a developer can configure MergeSpech; sign in with GitHub; install the GitHub App; select an authorized repository; receive a genuine (or fixture-validated) pull-request webhook; analyze a PR; inspect real, line-mapped evidence; manage findings and policies; and publish an accurate GitHub Check. The product must remain functional, observable, and secure under retry, duplicate delivery, force-push, stale-SHA, and cross-tenant scenarios.

## Required stack

- Next.js App Router, React, TypeScript, Tailwind CSS
- Accessible reusable components, Lucide icons, Monaco Editor (where it adds real value)
- PostgreSQL with Prisma; Redis and BullMQ
- Separate Node.js/TypeScript analysis worker
- GitHub App authentication, OAuth login, GitHub REST/GraphQL APIs
- Tree-sitter or equivalent AST tooling where supported
- ESLint, TypeScript compiler, Semgrep, OSV-compatible dependency advisory source
- Zod validation; Vitest, React Testing Library, Playwright
- Docker and Docker Compose
- Optional AI providers only through server-side, provider-independent adapters

Use current compatible stable versions, lock dependencies, and justify substitutions. Keep domain logic separate from HTTP transport, persistence, queueing, and UI.

## Product and design requirements

Create a restrained, distinctive developer-tool identity for **MergeSpech**. Do not reuse MergeGuard branding or create a generic shield/sparkle logo.

- Charcoal, slate, off-white, and subtle blue accents; polished light and dark themes.
- Geist or Inter with a high-quality monospace face; 4/8px spacing rhythm; compact, readable desktop-first review ergonomics.
- Layered surfaces and subtle borders rather than heavy shadows, glassmorphism, neon, blobs, excessive gradients, or oversized cards.
- Visible hover, focus, disabled, loading, empty, success, and error states; keyboard navigation and reduced-motion support.
- Responsive layouts without sacrificing code-review usability; meet WCAG 2.2 AA contrast and interaction requirements where practical.
- Use authentic persisted product data only. Screenshots/previews must show the actual application, clearly identified seeded local fixtures, or no data.

### Information architecture

1. **Public site:** value proposition, feature explanations, self-hosting, documentation, GitHub App installation entry, responsive navigation/footer. No fake testimonials, customer logos, statistics, or user counts.
2. **Authentication and onboarding:** GitHub OAuth login, secure sessions, GitHub App installation hand-off, organization/repository selection, least-privilege explanation, and complete state handling.
3. **Dashboard:** real organizations, repositories, PR activity, run status/history, severity trends, summaries, failures, notifications, filters, sort, search, and pagination.
4. **Repositories:** list/detail, installation state, permissions, default branch, configured exclusions/policies, run history, findings, and reanalysis.
5. **PR review:** metadata, author, branches, exact SHA, file tree, unified and side-by-side diff, valid line mapping, evidence panel, severity/category/rule/confidence, safe suggestions, finding lifecycle, review history, and GitHub deep links.
6. **Settings:** account/theme, organization, installations, repository permissions, notification preferences, data retention/deletion controls, and guarded AI-provider configuration.

## Authorization, tenancy, and data model

Implement PostgreSQL migrations, foreign keys, constraints, indexes, transaction boundaries, and cursor or offset pagination appropriate to each query. Model at minimum:

- Users, identities, sessions, organizations, memberships, roles
- GitHub installations, repositories, repository access snapshots
- Pull requests, commits, analysis runs, jobs, artifacts
- Findings, fingerprints, evidence, lifecycle events, dismissals and audit records
- Policies, immutable policy revisions, rule configuration and effective-policy evaluation
- Review publications/comments, notifications, webhook deliveries, security/audit events

Enforce tenant isolation in every query and mutation using scoped repository/organization access derived server-side. Never accept organization, installation, repository, actor, role, or authorization state from the client as proof. Prevent IDOR with authorization tests for every protected resource. Make webhooks idempotent via unique delivery identifiers and safe concurrency handling.

## GitHub integration

Build the real GitHub App lifecycle:

- App installation/removal, repository access changes, webhook ingestion, OAuth human sign-in, and short-lived installation-token issuance.
- Verify webhook signatures using raw request bytes and a constant-time comparison; enforce replay/duplicate protection, body-size limits, event allowlists, timestamp/retention policy, and durable delivery state.
- Authorize an installation and repository before every fetch, queue operation, read, write, or publication. Do not process a repository merely because its ID was submitted.
- Track installation, repository, PR number, base/head refs, and head SHA precisely. Handle synchronization, reopen, force pushes, close, deleted branch, stale commit, rate limit, and secondary rate limit.
- Use minimum GitHub App permissions. Store private keys/tokens only server-side, encrypted at rest when persistence is needed; redact them from logs, errors, telemetry, exports, and UI.
- Create GitHub Checks with explainable conclusions. Update a stable external identifier rather than duplicating checks/comments. Publish inline comments only when GitHub-valid diff positions and the analyzed head SHA exactly match.

## Deterministic analysis pipeline

Build deterministic analysis before optional AI enrichment:

1. Accept a verified, authorized event and create an idempotent analysis request for the exact head SHA.
2. Fetch only required metadata, diffs, and files. Apply size, file-count, binary, encoding, path, symlink, archive, and timeout limits.
3. Parse diffs; classify files/languages; identify changed lines and baseline findings. Never flood a PR with unrelated baseline issues.
4. Run changed-line-aware lint/static checks, compiler diagnostics where safely possible, versioned Semgrep rules, OSV dependency checks, redacted secret detection, and AST structural checks.
5. Normalize evidence; calculate stable fingerprints; deduplicate across retries; classify severity/category/confidence; persist explicit `completed`, `failed`, `skipped`, and `unsupported` check states.
6. Evaluate the immutable policy revision that applies to the precise SHA. Record decision inputs and explain the resulting Check conclusion.
7. Emit structured progress events and diagnostics without secrets or repository source beyond necessary access-controlled evidence.

### Untrusted repository isolation

Never execute arbitrary repository code in the web process or an unrestricted worker. Checks that need commands must use disposable, non-privileged sandbox containers with:

- no host Docker socket, no privileged mode, no host PID/network namespace, no device mounts, and no writable host mounts;
- read-only source mount where possible; separate ephemeral writable work directory;
- default-deny outbound network, explicitly allowlisted only when unavoidable; no cloud metadata access;
- non-root user, dropped Linux capabilities, `no-new-privileges`, seccomp/AppArmor or platform equivalent;
- CPU, memory, process, disk, execution-time, output-size, and concurrency quotas;
- safe extraction preventing path traversal, symlink/hardlink abuse, decompression bombs, and special files;
- cleanup on success, timeout, cancellation, crash, and retry.

Clearly label checks that did not run or were resource-limited. A clean run is not proof that a repository is safe.

## Policy engine and finding lifecycle

Support repository and organization policies with revision history: severity threshold, rule groups, path/language exclusions, minimum checks, advisory vs blocking outcomes, and branch-specific overrides. Resolve the policy deterministically, expose the applicable revision, and prevent arbitrary opaque quality scores.

Findings need open, resolved, dismissed, and false-positive statuses; actor/time/reason audit trail; evidence/fingerprint; affected file/line; and safe re-evaluation after changed SHAs. Suggested patches require human review and explicit confirmation before any write operation.

## Optional AI enrichment

AI is disabled unless explicitly configured. Implement a server-side provider adapter with encrypted credential handling, allowlisted models, per-org controls, request/token/cost budgets, rate limits, concurrency caps, timeouts, and audit events.

- Never expose provider keys to browsers or workers without the minimum necessary scoped secret delivery.
- Treat diffs, repository code, PR text, and tool outputs as hostile data, not instructions. Prevent prompt injection from changing policies, authorization, tool access, or data boundaries.
- Send the minimum excerpt necessary; provide opt-in/configurable data-sharing notices and retention implications.
- AI may explain deterministic evidence or suggest a patch; it must cite file/line evidence, be labeled as AI-derived, and never silently create findings, modify code, publish comments, or bypass policy.
- Validate all model output with schemas; render it as untrusted text; never execute generated shell, SQL, HTML, URLs, or tool calls.

## Security requirements

Apply practical OWASP ASVS/Top-10 aligned controls and produce a lightweight threat model covering browser, API, webhook, queue, worker sandbox, GitHub, AI provider, database, Redis, CI/CD, and Docker trust boundaries.

- Validate all inputs (including route params, headers, webhooks, environment, queues, AI output) with Zod or equivalent; use allowlists and canonicalization for paths, URLs, redirects, event types, and sort/filter fields.
- Parameterize database access via Prisma/query bindings. Avoid unsafe raw SQL; if unavoidable, use bound parameters and a security test.
- Defend against XSS (contextual output encoding, safe Markdown, no unsafe HTML), CSRF for cookie-authenticated mutations, clickjacking, open redirects, SSRF, prototype pollution, command injection, path traversal, deserialization abuse, ReDoS, and insecure file handling.
- Use secure, HttpOnly, SameSite cookies; HTTPS-aware secure settings; session rotation and expiry; OAuth state/PKCE where applicable; rate limits and account/session revocation.
- Use security headers/CSP appropriate to Next.js, strict CORS allowlists, request limits, centralized error handling, generic external errors, and detailed redacted server logs.
- Validate environment configuration at startup; fail closed for missing security-critical values. Do not commit secrets. Provide `.env.example` with non-secret names only.
- Use least-privileged DB/Redis/runtime identities; protected health/readiness endpoints; backups and restore guidance; retention/deletion jobs that are auditable and safe.
- Pin/lock dependencies, run dependency and secret scanning, produce an SBOM if practical, document update process, and avoid unreviewed install scripts in production images.
- Use multi-stage Docker images, minimal non-root runtime images, read-only filesystem where feasible, health checks, graceful shutdown, and no development secrets in production compose files.

## API, observability, and operations

Use versioned APIs where appropriate, typed contracts, machine-readable errors, request/correlation IDs, structured redacted logs, metrics for queue/run/failure state, and audit events for security-sensitive actions. Do not log source code, credentials, OAuth tokens, full webhook secrets, or unredacted secret-detection matches. Provide bounded retries with exponential backoff, dead-letter/failure visibility, cancellation, graceful shutdown, and recovery guidance.

## Documentation and deliverables

Ship an accurate README; architecture/data-flow diagram; local development guide; GitHub App permissions/setup and webhook instructions; `.env.example`; Docker deployment; migrations/backup/restore; sandbox/security notes; API documentation if exposed; contributing guide; code of conduct; open-source license; threat model; limitations; and `SECURITY.md` with a responsible disclosure path.

Document every external integration that could not be live-tested, plus the exact validation command/fixture. Never advertise features that are not implemented.

## Testing and acceptance evidence

Implement and execute:

- Unit tests for diff mapping, fingerprints, policies, severity/rule decisions, redaction, and path/URL validators.
- Integration tests for migrations, tenant authorization, sessions, webhook signature/replay/idempotency, token management, queues, cancellation/retry, and GitHub API mocks.
- Security tests for cross-tenant/IDOR, malformed/malicious repository content, prompt injection, XSS, CSRF, SSRF, traversal, injection, secret-redaction, oversized payload, and rate-limit paths.
- Frontend tests for loading/error/empty states, keyboard flow, and accessible names/contrast-critical patterns.
- Playwright tests for onboarding, installation selection, PR review, finding actions, policy changes, and publication flow.
- Production build, lint, TypeScript, dependency audit, and container build checks.

Use realistic fixtures: multi-file and large diffs, rename/delete/binary files, stale SHAs, force pushes, duplicate webhooks, failed jobs, restrictive policies, and repositories with deliberately malicious filenames/content. Report command output and any environment-only limitations truthfully.

## Final handoff

At completion, provide a concise engineering handoff listing implemented capabilities, architecture, security controls and residual risks, test/build results, setup/deployment commands, credentials required, and any live integrations needing final verification. Name the product **MergeSpech** consistently in UI, metadata, docs, Docker services, configuration, and branding.
