# We Better — Public Launch Readiness Remediation Plan

**Status:** Draft  
**Created:** 2026-07-13  
**Goal:** Remove the technical, security, product-trust, legal-surface, and operational blockers identified in the public-launch readiness audit.

## How AI agents should use this plan

- Work on one task at a time unless a task explicitly names a dependency that must be completed first.
- Read the current implementation and its existing tests before changing code.
- Preserve unrelated user changes and do not perform broad rewrites without evidence.
- Add or update tests for every behavior change.
- Prefer removing or disabling a misleading surface over leaving a control that appears functional but is not.
- Do not mark a task complete while its required verification commands fail because of changes introduced by that task.
- If a required backend, legal, billing, DNS, or product decision is outside the repository, document the exact external dependency instead of inventing a value.
- Record material decisions and follow-up risks in the pull request or task handoff.

## Release gates

Public launch remains blocked until all P0 tasks are complete and the final release-candidate task passes.

Required release commands:

```bash
pnpm install --frozen-lockfile
pnpm security:guardrails
pnpm lint
pnpm format:check
pnpm type-check
pnpm test --run
pnpm build
pnpm audit --prod
pnpm test:e2e
```

Expected final state:

- All commands exit successfully.
- No critical or high production dependency vulnerabilities remain, unless a documented exception has an owner, mitigation, and expiry date.
- No user-facing control silently performs no operation.
- Authentication, onboarding, account management, billing, and primary product workflows pass in staging.

---

## P0 — Release blockers

### TASK-001 — Repair the TypeScript release gate

**Status:** Complete (2026-07-13)

**Problem:** `pnpm type-check` fails. Vite still builds because production bundling does not enforce TypeScript correctness, allowing invalid code into a release.

**Known areas:**

- `src/components/ui/balloons.tsx`
- `src/features/onboarding/OnboardingPage.tsx`
- `src/features/onboarding/typebotPersistence.ts`
- `src/features/onboarding/useOnboardingMotion.ts`
- `src/shared/components/widgets/AffirmationWidget/AffirmationWidget.tsx`

**Implementation guidance:**

1. Define an explicit imperative handle type for the balloons component instead of pretending that the handle is an `HTMLDivElement`.
2. Make onboarding focus-area normalization return the domain type expected by `getDreamOptions`.
3. Narrow normalized micro-preferences with a type predicate before returning them.
4. Handle an absent GSAP `contextSafe` callback safely.
5. Update the affirmation balloon ref to use the new imperative handle type.
6. Do not suppress errors with `any`, `@ts-ignore`, or unsafe casts unless the external library genuinely requires a documented boundary.

**Acceptance criteria:**

- `pnpm type-check` exits with code 0.
- Balloon celebration still launches at runtime.
- Onboarding animation and reduced-motion behavior remain covered by tests.
- Typebot persistence rejects malformed values and returns correctly typed valid values.

**Verification:**

```bash
pnpm type-check
pnpm test --run src/features/onboarding src/shared/components/widgets/AffirmationWidget
```

---

### TASK-002 — Make the unit-test command deterministic and green

**Status:** Complete (2026-07-13)

**Problem:** `pnpm test --run` collects Playwright tests and prototype-playground tests that are not configured for the main Vitest environment. The result is a red release gate even though most application tests pass.

**Known areas:**

- `vitest.config.ts`
- `tests/check-typebot.spec.ts`
- `prototype-playground/dashboard-lab/**`
- `src/setupTests.ts`

**Implementation guidance:**

1. Exclude all Playwright specs from Vitest, not only `tests/e2e/**`.
2. Decide whether `prototype-playground` has its own test configuration or should be excluded from the product suite.
3. If the playground remains tested, configure its aliases and Jest DOM matchers in its own project.
4. Remove React `act(...)` warnings from onboarding tests so asynchronous assertions are trustworthy.
5. Keep product tests separate from experiments and browser checks.

**Acceptance criteria:**

- `pnpm test --run` exits with code 0.
- Playwright files run only through Playwright.
- Product test totals are stable across two consecutive executions.
- No unhandled promise rejection or React `act(...)` warning appears in the product suite.

**Verification:**

```bash
pnpm test --run
pnpm test:e2e -- --list
```

---

### TASK-003 — Upgrade vulnerable production dependencies

**Status:** Complete (2026-07-13)

**Problem:** The production audit reported 47 vulnerabilities, including one critical and multiple high-severity issues in direct or transitive dependencies.

**Known direct dependencies:**

- `axios`
- `react-router-dom`
- `@supabase/supabase-js`
- `i18next-http-backend`
- `uuid`
- `@react-three/drei`

**Known transitive concerns:**

- `form-data`
- `ws`
- `lodash.pick`
- `@babel/runtime`

**Implementation guidance:**

1. Capture the current audit report before changing versions.
2. Upgrade direct dependencies to versions containing the published fixes.
3. Review migration notes for React Router, Supabase, Axios, and i18next before editing call sites.
4. Replace an abandoned dependency when no patched version exists, rather than permanently overriding it without analysis.
5. Move test-only packages such as Playwright MCP and Testing Library out of production dependencies.
6. Regenerate only the chosen canonical lockfile.
7. Run authentication, routing, upload, realtime, and API regression tests after upgrades.

**Acceptance criteria:**

- No critical or high vulnerability remains in `pnpm audit --prod`.
- Any remaining moderate finding has a written risk decision, owner, mitigation, and expiry date.
- Application routing, Supabase login, API requests, Typebot localization, and UUID generation continue working.

**Verification:**

```bash
pnpm install --frozen-lockfile
pnpm audit --prod
pnpm type-check
pnpm test --run
pnpm build
```

**Completion record (2026-07-13):** Updated Axios, React Router, i18next HTTP backend, UUID, and Supabase. Supabase is pinned to `2.99.3`, the newest version compatible with the project's Node 20 runtime; the newer `2.110.2` requires Node 22. Removed the unused Three.js dependency family that introduced unpatchable `lodash.pick`, moved test/tooling-only packages out of production dependencies, and applied a pnpm override for patched `@babel/runtime`. `pnpm audit --prod` reports 0 vulnerabilities at every severity. `pnpm install --frozen-lockfile`, `pnpm type-check`, `pnpm test --run` (192 tests), `pnpm lint`, and `pnpm build` pass. Live authenticated upload/realtime validation remains a staging release check because it requires valid external credentials.

---

### TASK-004 — Replace or disable the non-functional AI Assistant

**Status:** Complete — disabled pending implementation (2026-07-13)

**Problem:** The Dashboard advertises an AI Assistant, but the chat input and Send button do not submit anything. This is a misleading public-facing capability.

**Known areas:**

- `src/shared/components/common/AIAssistantButton/AIChatBox.tsx`
- `src/shared/components/common/AIAssistantButton/AIAssistantButton.tsx`
- Dashboard translations under `public/locales/*/dashboard.json`

**Required product decision:** Choose exactly one path:

- Implement a real, secured assistant with backend support, rate limiting, loading/error states, conversation privacy, and cost controls; or
- Remove the assistant from the public build; or
- Present it as explicitly unavailable/beta with no editable input.

**Acceptance criteria for implementation path:**

- Submitting by button and Enter sends a request once.
- Pending, success, empty, rate-limit, offline, and backend-error states are handled.
- User input is not logged or exposed in URLs.
- Requests require authentication and enforce server-side usage limits.
- The privacy policy explains how assistant content is processed.
- Keyboard navigation, focus management, and mobile layout pass.

**Acceptance criteria for removal/disabled path:**

- No control suggests that a working AI chat is available.
- Marketing copy no longer promises this capability.

**Verification:**

```bash
pnpm test --run src/shared/components/common/AIAssistantButton
pnpm type-check
pnpm build
```

**Completion record (2026-07-13):** Selected the disabled path. The Dashboard control is a native disabled button, shows an explicit “Em breve”/“Coming soon” status, exposes that status to assistive technology, and no longer mounts or opens the non-functional chat input. Re-enable it only alongside a real authenticated backend flow that meets the implementation-path criteria above.

---

### TASK-005 — Remove mock insights and notifications from the Dream Board

**Status:** Complete — disabled pending real data source (2026-07-13)

**Problem:** The production Dream Board renders static AI insights and old notifications from `mock-data.ts` as if they describe the signed-in user.

**Known areas:**

- `src/features/dream-board/DreamBoardPage.tsx`
- `src/features/dream-board/mock-data.ts`
- `src/features/dream-board/components/DreamInsights/**`
- `src/features/dream-board/components/FooterTools/**`

**Implementation guidance:**

1. Separate legitimate static category configuration from demo records.
2. Replace mock insights with a real authenticated endpoint or a truthful empty/coming-later state.
3. Replace mock Dream Board notifications with real user data or remove the surface.
4. Never show sample achievements, deadlines, or recommendations without a visible demo label.
5. Ensure empty, loading, partial-data, stale-data, and error states are explicit.

**Acceptance criteria:**

- No import from `mock-data.ts` supplies user-specific production content.
- A new account never sees another person's sample dream, milestone, notification, or insight.
- Insight text is derived from the current user's data or clearly unavailable.
- Tests cover empty and populated accounts.

**Verification:**

```bash
rg -n "mockInsights|mockNotifications|mockDreams" src/features/dream-board
pnpm test --run src/features/dream-board
pnpm type-check
```

**Completion record (2026-07-13):** Selected the disabled path. Removed the Insights tab, the simulated-notification prop, all empty-state copy promising insights, and the unused `mock-data.ts` source. Legitimate category configuration now lives in a dedicated constant. The Dream Board now renders only real board, weather, milestone, and challenge data; add insights or notifications back only with authenticated user-specific data and explicit empty/loading/error states.

---

### TASK-006 — Complete or hide account data export and deletion

**Status:** Implemented — staging validation and deployment pending (2026-07-17)

**Problem:** Settings exposes export and account deletion controls, but both actions only log messages. These are sensitive account-management promises.

**Known areas:**

- `src/pages/Settings/Settings.tsx`
- Settings translations
- User-service account endpoints
- Supabase user/storage records

**Implementation guidance:**

1. Define what data belongs to a user across Supabase, user-service storage, uploads, notifications, billing references, and analytics.
2. Implement server-side export generation with authenticated ownership checks.
3. Implement account deletion as a server-controlled operation with reauthentication and a clear retention policy.
4. Handle active paid subscriptions before account deletion.
5. Provide success, failure, retry, and asynchronous-processing states.
6. If backend work is not available, hide the controls before public launch.

**Acceptance criteria:**

- JSON export contains the documented user data and no other user's data.
- CSV export behavior is documented and tested, or the CSV option is removed.
- Account deletion requires deliberate confirmation and reauthentication.
- Deleted users cannot authenticate and their data follows the documented deletion/retention behavior.
- UI never reports completion before the server confirms it.

**Verification:**

```bash
pnpm test --run src/pages/Settings
pnpm test:e2e -- --grep "data export|account deletion"
```

**Completion record (2026-07-17):** Added authenticated `GET /api/account/export` and `DELETE /api/account/delete` routes to `user-service`. Export returns the user's account record, product records, and owned storage-object manifest as JSON while excluding session and Web Push secrets. Deletion requires the literal confirmation, a masked password field, and a password reauthentication that produces a JWT no older than five minutes; it rejects active paid subscriptions, removes owned storage, revokes refresh sessions globally, and then deletes the Supabase Auth user. OAuth-only accounts are explicitly informed that they must set an account password before confirming deletion. The Settings screen downloads JSON only (CSV removed) and exposes pending/error states. The retention boundary is documented in `docs/privacy/account-data-retention.md`. Unit tests cover authenticated export, OAuth reauthentication handling, and the confirmed deletion request; local route checks reject anonymous export and deletion with HTTP 401. Deploy `user-service` and run the authenticated staging flow before marking the release complete.

---

### TASK-007 — Complete or remove privacy, cookie, and security controls

**Status:** Implemented — deployment pending (2026-07-17)

**Problem:** Privacy toggles, cookie preferences, 2FA, SMS backup, and backup-code controls update local React state or logs but are not persisted or enforced.

**Known areas:**

- `src/pages/Settings/Settings.tsx`
- `public/locales/*/settings.json`
- Authentication and preference endpoints

**Implementation guidance:**

1. Inventory every displayed setting and identify its enforcing system.
2. Persist real preferences server-side where they affect multiple devices.
3. Do not show analytics/cookie controls until the application actually honors them.
4. Implement 2FA through the identity provider with enrollment, challenge, recovery, disable, and backup-code flows.
5. Calculate the security score only from server-verified security state.
6. Remove SMS backup if it is not supported by the identity provider and threat model.

**Acceptance criteria:**

- Refreshing or signing in on another device returns the correct persisted settings.
- Analytics and marketing collection obey consent before initialization.
- 2FA cannot be shown as enabled without successful server enrollment.
- Backup codes are generated server-side, displayed once, and never logged.
- Unsupported controls are absent from the public UI.

**Verification:**

```bash
pnpm test --run src/pages/Settings src/features/auth
pnpm test:e2e -- --grep "privacy|cookie|two-factor"
```

**Completion record (2026-07-17):** Audited the Settings controls against the available user-service APIs. Profile-visibility, analytics/marketing, cookie-consent, 2FA, SMS backup, recovery-code, and calculated security-score controls had no persistence or enforcement path, so they were removed from the public UI rather than presenting false guarantees. Data export/deletion and session history/sign-out remain because they are server-backed. Verified with `pnpm test --run src/pages/Settings src/features/auth`, `pnpm type-check`, `pnpm lint`, and `pnpm build`. Deploy the frontend and test the authenticated session controls in staging before marking the release complete.

---

### TASK-008 — Fix production CSP for Typebot and external services

**Problem:** The onboarding loads Typebot from an external API host, but the Vercel CSP does not allow the Typebot connection/frame origins. A second CSP definition exists in source but does not drive deployment configuration.

**Known areas:**

- `vercel.json`
- `src/core/config/csp.ts`
- `src/features/onboarding/OnboardingPage.tsx`
- `VITE_TYPEBOT_API_HOST`

**Implementation guidance:**

1. Determine whether Typebot uses fetch, WebSocket, iframe, worker, or a combination in the deployed integration.
2. Add only the exact required Typebot origins to the appropriate CSP directives.
3. Establish a single source of truth for CSP generation and testing.
4. Keep `frame-ancestors 'none'`, `object-src 'none'`, and other existing protections unless a documented integration requires a change.
5. Avoid broad `*` sources.
6. Add a test that asserts required origins and rejects unsafe broadening.

**Acceptance criteria:**

- A new production-like account can complete onboarding without CSP violations.
- Browser console contains no blocked Typebot request needed for the flow.
- The fallback remains available for genuine Typebot outages.
- Deployment CSP and tested CSP cannot silently diverge.

**Verification:**

```bash
pnpm test --run src/core/config src/features/onboarding
pnpm build
```

---

### TASK-009 — Stabilize production API and add health checks

**Problem:** The configured user-service has no working `/api/health` endpoint, and an unauthenticated `/api/missions` request produced a Vercel function timeout instead of a fast authentication response.

**Known areas:**

- `vercel.json`
- User-service deployment
- Missions API authentication middleware and database initialization
- Frontend service error handling

**Implementation guidance:**

1. Add lightweight liveness and dependency-aware readiness endpoints.
2. Authenticate requests before performing expensive database work where possible.
3. Add server timeouts, structured logs, request IDs, and alerting.
4. Investigate cold starts, connection pooling, regional latency, and database query time for Missions.
5. Create staging and production backend origins instead of hardcoding one deployment.
6. Add synthetic checks for app shell, dashboard overview, missions, billing, and notifications.

**Acceptance criteria:**

- Liveness responds in under one second without database dependency.
- Readiness reports unhealthy dependencies without timing out.
- Unauthorized protected endpoints return `401` quickly and consistently.
- Authenticated Missions requests stay within the agreed latency budget.
- Frontend displays a recoverable error instead of hanging indefinitely.

**Verification:**

```bash
curl -i https://<staging-backend>/api/health
curl -i https://<staging-backend>/api/ready
pnpm test:e2e -- --grep "missions|authenticated API"
```

---

### TASK-010 — Verify and repair the public domain and deployment routing

**Problem:** `webetter.ai` did not resolve during the audit environment check. The repository also hardcodes that domain in canonical and social metadata.

**Known areas:**

- DNS provider and Vercel project domains
- `index.html`
- `vercel.json`
- Supabase redirect allowlist
- Stripe success/cancel/portal allowlists

**Implementation guidance:**

1. Verify authoritative DNS records, domain ownership, TLS, IPv4/IPv6 behavior, and `www` redirects.
2. Confirm the deployed Vercel project serves the expected build.
3. Verify SPA rewrites for direct navigation to every public and authenticated route.
4. Confirm Supabase and Stripe allowlists use the final canonical domain.
5. Add a staging domain with separate environment variables.

**Acceptance criteria:**

- Apex and chosen `www` behavior resolve globally over HTTPS.
- TLS certificate is valid and automatically renewable.
- Direct navigation and refresh work for all routes.
- Auth, reset-password, onboarding, checkout, and portal redirects return only to allowlisted application URLs.

**Verification:**

```bash
dig webetter.ai
curl -I https://webetter.ai
curl -I https://webetter.ai/app/dashboard
```

---

## P1 — Required before broad public traffic

### TASK-011 — Repair the email-confirmation flow

**Problem:** The confirmation page accepts an `access_token` from the URL hash, calls a no-op `confirmEmail`, and then reports success. This can produce false success and may not match the configured Supabase PKCE flow.

**Known areas:**

- `src/features/auth/pages/EmailConfirmation.tsx`
- `src/core/services/authService.ts`
- Supabase email templates and redirect configuration

**Implementation guidance:**

1. Choose one supported Supabase confirmation flow and follow its current API contract.
2. Validate the returned code/token through Supabase rather than checking only for string presence.
3. Remove or implement the no-op `confirmEmail` method.
4. Handle expired, reused, malformed, and already-confirmed links.
5. Localize all confirmation states.

**Acceptance criteria:**

- A real signup email confirms the correct account exactly once.
- A forged or expired URL cannot produce a success screen.
- Successful confirmation continues to the intended onboarding/login destination.
- E2E tests cover success and failure paths.

---

### TASK-012 — Create real legal, privacy, cookie, support, and contact pages

**Problem:** Footer links for Privacy, Terms, Cookies, Support, Contact, DMCA, and Legal Notice point to `#`, and no corresponding public routes exist.

**Known areas:**

- `src/utils/constants/fallback/footer.ts`
- `src/shared/components/layout/Footer/Footer.tsx`
- `src/core/router/index.tsx`
- CMS footer content

**Implementation guidance:**

1. Obtain approved content from the responsible legal/business owner; do not generate final legal policy as code filler.
2. Add versioned, public, indexable routes.
3. Include effective date, contact method, data-processing description, retention/deletion information, subscription terms, and cookie behavior as approved.
4. Ensure signup and paid checkout link to the applicable documents.
5. Remove App Store buttons until real listings exist.

**Acceptance criteria:**

- No footer or signup legal link uses `href="#"`.
- All policy routes work on direct navigation and mobile.
- The footer copyright year is current or dynamic.
- Legal content has an owner and review date.

---

### TASK-013 — Add an application 404 and authenticated error boundary

**Problem:** Unknown routes fall into the router's default error UI, and the authenticated workspace does not have a global Error Boundary. Existing error UI may expose raw exception messages.

**Known areas:**

- `src/core/router/index.tsx`
- `src/core/router/AppRouteShell.tsx`
- `src/shared/components/common/ErrorBoundary/**`

**Implementation guidance:**

1. Add public and authenticated not-found experiences.
2. Wrap the authenticated shell with an Error Boundary.
3. Log technical details to observability while showing a safe user message.
4. Provide retry, return-to-dashboard, and support actions where appropriate.
5. Reset route-level errors on navigation.

**Acceptance criteria:**

- Unknown URLs never show framework-default errors.
- Render failures in authenticated pages do not destroy navigation or expose stack details.
- Error events contain release, route, user-safe identifier, and request correlation metadata.

---

### TASK-014 — Validate and secure notification CTA navigation

**Problem:** Notification URLs from the API can navigate to arbitrary external locations. The push service worker has similar behavior.

**Known areas:**

- `src/pages/Notifications/Notifications.tsx`
- `public/sw-notifications.js`
- Notifications backend payload validation

**Implementation guidance:**

1. Prefer internal route identifiers over arbitrary URLs.
2. Allowlist internal paths and explicitly approved HTTPS origins.
3. Reject `javascript:`, `data:`, protocol-relative, malformed, and unapproved URLs.
4. Validate at both backend generation and frontend consumption boundaries.
5. Add malicious-payload tests for in-app and push notifications.

**Acceptance criteria:**

- Untrusted CTA values cannot navigate outside approved destinations.
- Internal links use React Router without full-page reload.
- Push clicks and in-app clicks apply the same policy.

---

### TASK-015 — Establish production observability and incident response

**Problem:** Errors are primarily written to `console`, and onboarding analytics only dispatches an internal browser event without a production consumer.

**Known areas:**

- `src/shared/components/common/ErrorBoundary/ErrorBoundary.tsx`
- `src/features/onboarding/analytics.ts`
- API service error handling
- Vercel and backend logs

**Implementation guidance:**

1. Select an error and performance monitoring provider.
2. Add release identifiers and source-map upload without exposing source maps publicly unless intended.
3. Redact tokens, email addresses, dream text, assistant prompts, and other sensitive data.
4. Capture frontend crashes, route failures, API latency, billing failures, onboarding drop-off, and push failures.
5. Define alert thresholds, owners, escalation paths, and rollback procedure.

**Acceptance criteria:**

- A synthetic frontend exception appears in the monitoring system with the correct release.
- A backend timeout produces a correlated alert.
- Sensitive values are absent from monitoring payloads.
- On-call ownership and response targets are documented.

---

### TASK-016 — Rebuild CI as the canonical release gate

**Problem:** CI uses different Node versions and package managers, maintains two lockfiles, and does not require all release checks.

**Known areas:**

- `.github/workflows/code-quality.yml`
- `.github/workflows/playwright.yml`
- `package-lock.json`
- `pnpm-lock.yaml`
- `package.json`

**Implementation guidance:**

1. Choose pnpm as the canonical package manager and remove the obsolete lockfile.
2. Pin a supported Node and pnpm version through `packageManager`, Corepack, and CI.
3. Use `pnpm install --frozen-lockfile` everywhere.
4. Require lint, format, TypeScript, unit tests, build, dependency audit, and E2E.
5. Align branch triggers and make required checks explicit in repository settings.
6. Cache safely without allowing stale dependencies to bypass the lockfile.

**Acceptance criteria:**

- Local and CI installs resolve the same dependency graph.
- A TypeScript, unit-test, build, audit, or E2E failure blocks merge/release.
- CI runs on every intended pull request and protected branch.
- Workflow actions use maintained major versions.

---

### TASK-017 — Add critical-path E2E coverage

**Problem:** Existing E2E coverage focuses on a few API/bootstrap paths and does not prove the complete public-launch journey.

**Required scenarios:**

1. Signup, email confirmation, login, logout, and password reset.
2. Required onboarding completion, retry, and skip behavior.
3. First Dashboard load and guided tour controls.
4. Life Wheel create/update/history flow.
5. Dream Board image validation, upload, milestone update, and deletion.
6. Mission start and completion.
7. Habit and goal create/update/delete limits.
8. Notification read and CTA behavior.
9. Pricing, Stripe test checkout, portal return, cancellation, and webhook-reflected state.
10. Account export and deletion.

**Implementation guidance:**

- Use isolated test users and deterministic fixtures.
- Do not depend on production data.
- Run desktop and mobile projects.
- Capture traces/screenshots only on retry or failure.
- Clean up test accounts and uploaded files.

**Acceptance criteria:**

- All required scenarios run against a production-like staging environment.
- Tests are repeatable and safe to retry.
- No test requires manual state preparation.

---

## P2 — Performance, quality, and launch polish

### TASK-018 — Reduce bundle and public-asset weight

**Problem:** The React vendor chunk is approximately 986 KB before gzip, the public directory is approximately 88 MB, and several GIF/PNG files are 2–23 MB.

**Known areas:**

- `vite.config.ts`
- `public/assets/images/gallery/body.gif`
- `public/assets/images/hero/*.gif`
- `public/assets/images/missions/*.png`
- Three.js and animation feature imports

**Implementation guidance:**

1. Confirm which large assets are referenced before deleting them.
2. Replace large GIFs with compressed video or responsive modern images.
3. Prefer WebP/AVIF mission assets and avoid shipping unused PNG fallbacks when browser support permits.
4. Lazy-load Three.js, Lottie, GSAP, Dream Board experience, and other heavy optional features.
5. Set bundle and asset budgets in CI.
6. Measure Lighthouse/Web Vitals on representative mobile hardware/network profiles.

**Acceptance criteria:**

- No unused multi-megabyte asset ships in the deployment.
- Initial authenticated and landing routes stay within agreed JS/image budgets.
- LCP, INP, and CLS meet the team's launch targets on staging.

---

### TASK-019 — Add coverage thresholds and test ownership

**Problem:** Coverage reporting exists but has no minimum threshold, so significant untested code can ship without failing CI.

**Known areas:**

- `vitest.config.ts`
- Feature test directories

**Implementation guidance:**

1. Generate a baseline report after fixing test collection.
2. Set realistic initial global thresholds and stricter thresholds for auth, billing, account deletion, and persistence code.
3. Increase thresholds gradually; do not add meaningless snapshot tests only to raise numbers.
4. Require tests for every production bug fix.

**Acceptance criteria:**

- Coverage below the agreed threshold fails CI.
- Critical services have meaningful branch and error-path coverage.

---

### TASK-020 — Complete accessibility and responsive QA

**Problem:** The code contains many custom dialogs, animated controls, range inputs, menus, bottom sheets, and canvas experiences that need systematic accessibility validation.

**Implementation guidance:**

1. Run automated accessibility checks on every public and authenticated route.
2. Manually validate keyboard-only navigation, focus order, escape behavior, focus restoration, labels, announcements, zoom, contrast, and reduced motion.
3. Test 320 px mobile width, tablet, desktop, 200% zoom, and short-height viewports.
4. Add accessible names to icon-only controls such as password visibility.
5. Ensure canvas/visual charts provide equivalent textual information.

**Acceptance criteria:**

- No critical or serious automated accessibility violation remains.
- All primary flows are completable with keyboard and screen reader.
- Guided tours remain operable on short-height and mobile viewports.

---

### TASK-021 — Add SEO and public-site launch essentials

**Problem:** The public site has canonical metadata but no repository-managed `robots.txt` or sitemap, and the document language remains statically English even when Portuguese is active.

**Known areas:**

- `index.html`
- `public/`
- i18n language switching
- Public router

**Implementation guidance:**

1. Add environment-correct robots and sitemap files.
2. Update `document.documentElement.lang` when language changes.
3. Verify canonical, Open Graph, Twitter, favicon, and social image URLs in production.
4. Prevent authenticated routes from being indexed where appropriate.
5. Add structured data only when it accurately describes the product.

**Acceptance criteria:**

- Search crawlers receive valid canonical, robots, sitemap, and language metadata.
- Social previews use absolute, reachable image URLs.

---

### TASK-022 — Align README and marketing claims with the shipped product

**Problem:** Documentation and metadata claim AI coaching, personalized learning, collaboration, sharing, and other capabilities that are incomplete or absent.

**Known areas:**

- `README.md`
- `index.html`
- Landing-page CMS/fallback copy
- Pricing feature descriptions

**Implementation guidance:**

1. Inventory every public feature claim.
2. Map each claim to a working, tested product capability.
3. Remove, qualify, or implement unmatched claims.
4. Document actual architecture, services, setup, staging, deployment, and rollback.

**Acceptance criteria:**

- Every material marketing and pricing claim is demonstrably true.
- Developer setup documentation matches the current package manager and architecture.

---

## Final release-candidate task

### TASK-023 — Execute the public-launch release candidate

**Dependencies:** All P0 tasks and applicable P1 tasks must be complete.

**Procedure:**

1. Create a clean release branch from the intended production commit.
2. Install from the canonical frozen lockfile.
3. Run every release-gate command.
4. Deploy to a production-like staging environment with production CSP, CDN, DNS, Supabase, Typebot, Stripe test mode, push configuration, and backend regions.
5. Complete the critical E2E suite on desktop and mobile.
6. Perform manual smoke testing with:
   - a new free user;
   - a returning user with data;
   - a paid test user;
   - an account with expired/revoked session;
   - offline and degraded-backend conditions.
7. Verify monitoring, alerting, backups, incident contacts, rollback, and support intake.
8. Record final go/no-go approval from engineering, product, security, operations, and the owner of legal content.

**Acceptance criteria:**

- All automated gates pass from a clean checkout.
- No P0 issue remains open.
- No unresolved P1 issue lacks an explicit launch decision and owner.
- Staging smoke tests pass without manual database repair.
- Rollback has been tested, not merely documented.
- Public launch approval is recorded with the exact release commit.

## Suggested execution order

1. TASK-001, TASK-002, TASK-003
2. TASK-008, TASK-009, TASK-010, TASK-016
3. TASK-004, TASK-005, TASK-006, TASK-007
4. TASK-011, TASK-012, TASK-013, TASK-014, TASK-015
5. TASK-017, TASK-018, TASK-019, TASK-020, TASK-021, TASK-022
6. TASK-023

## Handoff template for each completed task

```markdown
### Task

TASK-XXX — Title

### Outcome

What changed and what user or release risk was removed.

### Files changed

- `path/to/file`

### Verification

- `command` — PASS/FAIL

### External dependencies

- None, or exact owner/system/action still required.

### Remaining risks

- None, or concise follow-up with priority.
```
