# AGENTS.md

<!-- INSFORGE:START -->
## InsForge backend

This project uses [InsForge](https://insforge.dev): an all-in-one, open-source Postgres-based backend (BaaS) that gives this app a database, authentication, file storage, edge functions, realtime, an AI model gateway, and payments through one platform.

- **Project:** **isafer-boutique** (API base `https://i5jqzbx6.us-east.insforge.app`)
- **Skills:** these InsForge skills are installed for supported coding agents. Reach for them before implementing any InsForge feature instead of guessing the API:
  - `insforge`: app code with the `@insforge/sdk` client (database CRUD, auth, storage, edge functions, realtime, AI, email, and Stripe payments).
  - `insforge-cli`: backend and infrastructure via the `insforge` CLI (projects, SQL, migrations, RLS policies, storage buckets, functions, secrets, payment setup, schedules, deploys).
  - `insforge-debug`: diagnosing failures (SDK/HTTP errors, RLS denials, auth and OAuth issues) and running security or performance audits.
  - `insforge-integrations`: wiring external auth providers (Clerk, Auth0, WorkOS, Better Auth, etc.) for JWT-based RLS, or the OKX x402 payment facilitator.
  - `find-skills`: discovering additional skills on demand.
- **Credentials:** app code reads keys from `.env.local`; the CLI reads `.insforge/project.json`. Never hardcode or commit keys.

Key patterns:

- Database inserts take an array: `insert([{ ... }])`.
- Reference users with `auth.users(id)`; use `auth.uid()` in RLS policies.
- For storage uploads, persist both the returned `url` and `key`.
<!-- INSFORGE:END -->

## Reglas de Sesión Adicionales

### Carpeta de Referencia y Capturas
- **Uso:** El usuario colocará archivos de referencia, capturas de pantalla, grabaciones de pantalla, etc., en la carpeta `/Users/musa/Downloads/sopisafer/carpeta de referencia` durante la sesión.
- **Fin de Sesión:** Al finalizar la sesión (cuando el usuario mencione **@final**, **@end**, **terminar**, o similar), además de actualizar la documentación (`docs/SESSION_LATEST_ES.md` y `docs/ROADMAP.md`), se debe **borrar obligatoriamente todo el contenido** dentro de `/Users/musa/Downloads/sopisafer/carpeta de referencia`, dejándola completamente vacía para futuras sesiones.
