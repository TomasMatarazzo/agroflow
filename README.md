# AgroFlow 🌱

AgroFlow is a personal open-source agricultural business management project focused on 13-week cash flow forecasting for small and medium agricultural businesses.

**Status:** early-stage MVP started November 2026. This is not an established product. All example amounts and transactions are fictional; no client code or personal data is included.

## Features in the first MVP
- 13-week rolling projected cash flow
- Income and expense tracking with due dates
- Forecast of opening and closing balances
- Editable transactions stored in local browser storage
- Demo data for farming use cases

## Stack
Next.js, React, TypeScript. Local storage only in the initial MVP.

## Run
Requires Node.js 20.9+.

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Limitations
No backend, login, database or backups yet. Do not enter real personal, confidential or financial information. Use synthetic data only until secure handling is implemented.

## Roadmap
See [ROADMAP.md](./ROADMAP.md) for future features including scenario planning, recurring payments, testing, crop campaigns, inventory and multi-tenant access.

## Ownership
Personal project maintained by Tomas Matarazzo; released under the [MIT License](./LICENSE).