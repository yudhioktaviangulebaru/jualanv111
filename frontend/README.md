# JualanApp — Frontend

Base SPA built with **Preact + TypeScript + Vite**, talking to the Google Apps Script backend in `../backend`.

## Stack

- [Preact](https://preactjs.com/) — UI
- [preact-iso](https://github.com/preactjs/preact-iso) — routing
- [TypeScript](https://www.typescriptlang.org/) — strict mode
- [Vite](https://vite.dev/) — dev server & build

## Getting started

```bash
npm install
cp .env.example .env   # then set VITE_API_BASE_URL to your GAS /exec URL
npm run dev            # http://localhost:5173
```

## Scripts

| Command             | Description                          |
| ------------------- | ------------------------------------ |
| `npm run dev`       | Start the dev server                 |
| `npm run build`     | Type-check and build for production  |
| `npm run preview`   | Preview the production build         |
| `npm run typecheck` | Type-check without emitting          |

## Structure

```
src/
  api/        API client for the GAS backend
  components/ Reusable components (Layout, ...)
  pages/      Route components (Home, NotFound)
  app.tsx     Router & app shell
  main.tsx    Entry point
```

The `@/` alias maps to `src/` (configured in both `tsconfig.json` and `vite.config.ts`).

## Backend

The backend is a Google Apps Script web app exposing a single endpoint routed by an
`action` field. Use `api.call<T>(action, payload)` from `src/api/client.ts`.
