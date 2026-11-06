# AgroFlow

Open-source personal project for managing agricultural business finances. AgroFlow
starts with a rolling 13-week cash-flow forecast, with planned expansion into crop
budgets, agricultural inventory and operations.

**Project status:** early-stage personal MVP, created November 2026. This is not
a deployed production application and has no external users yet.

## Features (current milestone)

- Cash-flow projections from an editable opening balance
- Income and expense movements with real calendar due dates
- Past-due pending items carried into the current week
- Completed items excluded from projected cash movements
- Automated unit tests for the financial projection engine
- Synthetic demo records only; browser storage, no backend

## Run locally

Requires Node.js 22+ and npm.

    npm install
    npm run dev

Open http://localhost:3000.

## Test

    npm test
    npm run typecheck
    npm run build

## Roadmap and contributions

See [ROADMAP.md](./ROADMAP.md) for an honest breakdown of what is already built
and what remains to be implemented. Issues and contributions are welcome.

## Privacy and limitations

Do not enter customer, confidential, regulated or real financial data. This prototype
uses localStorage, which is not a secure, audited financial database. The sample
farm is entirely fictional.

## Ownership and license

Original personal project maintained by Tomas Matarazzo. [MIT](./LICENSE).
