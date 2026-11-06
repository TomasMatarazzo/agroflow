# AgroFlow development roadmap

AgroFlow is a personal open-source MVP, started on November 6, 2026.
Only checked items are implemented. Estimates describe *future work*, not paid hours.

## Milestone 1 — Reliable cash-flow foundation (in progress)
- [x] Public repository, README, MIT license and synthetic dataset
- [x] Extract forecast calculations into a testable domain module
- [x] Support real due dates, rolling 13-week window and overdue carry-forward
- [x] Exclude completed movements to prevent double counting
- [x] Add unit tests for balances, year rollover and invalid input
- [ ] Add integration tests and confirm a production build in CI
- [ ] Enable editing and searching historical movements

## Milestone 2 — Financial planning (estimated 15–25 hours)
- [ ] Recurring payments and receivables
- [ ] Scenario comparisons: baseline, cautious, optimistic
- [ ] CSV import with validation and duplicate detection
- [ ] Weekly forecast vs actual and planned payment status
- [ ] Charts and cash shortfall warnings

## Milestone 3 — Agricultural operations (estimated 25–45 hours)
- [ ] Fields, plots, crop seasons and activities
- [ ] Crop budgets, costs per hectare and margins
- [ ] Inputs, inventory and machinery costs
- [ ] Supplier/customer ledgers

## Milestone 4 — Secure persistence (estimated 30–50 hours)
- [ ] PostgreSQL data model and migrations
- [ ] Authentication and separate workspaces for each business
- [ ] Row-level permissions, audit log and backups
- [ ] Tests for cross-tenant isolation, deployment and observability

## Boundaries
Only fabricated demo data is allowed in this public prototype. Do not upload client
code, credentials, people's personal data, or real financial records.
