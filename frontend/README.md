# JualanApp — Frontend

Base SPA built with **Preact + TypeScript + Vite**, talking to the Google Apps Script backend in `../backend`.

## Stack

- [Preact](https://preactjs.com/) — UI
- [preact-iso](https://github.com/preactjs/preact-iso) — routing
- [@remixicon/react](https://remixicon.com/) — icons (tree-shaken via `preact/compat` alias)
- [TypeScript](https://www.typescriptlang.org/) — strict mode
- [Vite](https://vite.dev/) — dev server & build

## Getting started

```bash
npm install
cp .env.example .env   # set VITE_BACKEND_URL and VITE_GOOGLE_CLIENT_ID
npm run dev            # http://localhost:5173
```

## Login with Google

The app authenticates via Google Identity Services (GIS):

1. The Google button (`src/components/GoogleSignInButton.tsx`) returns an ID
   token (JWT).
2. `AuthContext.loginWithGoogle` posts it to the backend
   (`{ action:"login", id_token }`), which verifies it and returns the user.
3. The user is persisted to `localStorage`; `RequireAuth` guards routes and
   redirects unauthenticated visitors to `/login`.

**Setup:** in Google Cloud Console create an OAuth 2.0 **Web application**
client, add `http://localhost:5173` to *Authorized JavaScript origins*, and put
the client ID in `VITE_GOOGLE_CLIENT_ID`. The same ID must be set as
`AuthController.CLIENT_ID` in the backend. Note: the backend only logs in users
whose email already exists in the `users` sheet — it does not auto-create them.

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
