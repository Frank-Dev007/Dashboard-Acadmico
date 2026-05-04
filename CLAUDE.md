# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Structure

This is a monorepo with two independent modules:

- `backend/` — Node.js + Express + Sequelize + MySQL REST API
- `Dashboard-Academico-PWA-main/` — React + TypeScript + Vite PWA (frontend)

---

## Commands

### Backend

```bash
cd backend
npm run dev      # nodemon server.js (hot reload)
npm start        # node server.js (production)
```

Entry point: `backend/server.js` → imports `backend/src/app.js`.

Required `.env` (already exists at `backend/.env`):
```
DB_HOST=localhost
DB_USER=root
DB_PASS=
DB_NAME=dashboard_academico
DB_PORT=3306
PORT=4000
```

MySQL must be running locally with database `dashboard_academico` created. Sequelize syncs the schema automatically via `sequelize.sync({ alter: true })` on every start.

### Frontend

```bash
cd Dashboard-Academico-PWA-main
npm run dev      # Vite dev server on port 3000
npm run build    # Output to build/
```

The frontend assumes the backend is on `http://localhost:4000` — this is hardcoded in `src/service/api.js`.

---

## Backend Architecture

### Request lifecycle

```
server.js → app.js (Express + CORS + routes) → routes/*.routes.js → controllers/*.controller.js → models/
```

### Models and relationships (`src/models/`)

All associations are defined exclusively in `src/models/index.js`. The aliases used there are the **only valid aliases** — using any other alias in a controller `include` will throw a Sequelize error at runtime.

| Relation | Alias |
|----------|-------|
| `Curso.belongsTo(User)` | `"profesor"` |
| `User.hasMany(Curso)` | `"cursosImpartidos"` |
| `Curso.belongsToMany(User)` through `CursoEstudiante` | `"estudiantes"` |
| `User.belongsToMany(Curso)` through `CursoEstudiante` | `"cursos"` |

**Known bug**: `cursoEstudiante.controller.js:118` uses `as: "docente"` (does not exist) and requests attributes `"codigo"` and `"estado"` which don't exist in the `Curso` model. This will error at runtime.

### Multer middleware

`src/middlewares/upload.js` uses **`diskStorage`** — files are saved to `src/uploads/` and `req.file.path` is set, but `req.file.buffer` is **not** populated.

- `src/controllers/import.controller.js` uses `req.file.buffer` → **incompatible**, this endpoint is currently broken.
- `src/controllers/cursoEstudianteImport.controller.js` uses `req.file.path` → compatible.

If you need buffer-based processing, switch to `multer({ storage: multer.memoryStorage() })`.

### Authentication

`auth.controller.js` compares passwords with plain string equality (`===`). All other user creation paths (`user.controller.js`, `import.controller.js`) hash passwords with `bcrypt`. This means **login is broken for any user created via the API or import** until `auth.controller.js` is updated to use `bcrypt.compare()`.

There is no JWT or session token. The frontend stores `auth: 'true'` and `userRole` in `localStorage`.

### Duplicate endpoints

Both `GET /api/estudiantes/:id/cursos` (via `estudiante.routes.js`) and `GET /api/curso-estudiante/estudiante/:id_estudiante` (via `cursoEstudiante.routes.js`) serve the same purpose. The first is correct; the second has the alias bug above.

The `importEstudiantes` controller is also registered on two different routes: `/api/curso-estudiante/import/estudiantes` and `/api/curso-estudiante/estudiantes`.

---

## Frontend Architecture

### Routing and auth (`src/App.tsx`)

Auth state lives in React state (`isAuthenticated`, `userRole`) and is persisted to `localStorage` (`auth`, `userRole`, `user`). On load there is a 2-second forced splash delay before reading `localStorage`.

Role-based routing pattern:
- `/student/*` — requires `userRole === 'student'`
- `/teacher/*` — requires `userRole === 'teacher'`
- `/admin/*` — requires `userRole === 'admin'`

All protected routes redirect to `/login` if unauthenticated.

### Versioned imports and Vite aliases

Many components import packages with version strings in the module specifier (e.g. `import { toast } from 'sonner@2.0.3'`). These are **not standard imports** — they only work because `vite.config.ts` defines aliases mapping each versioned string to the real package name. If you add new imports, use the plain package name (e.g. `'sonner'`, not `'sonner@2.0.3'`). The `@` alias maps to `./src`.

### API layer (`src/service/api.js`)

Currently contains only `loginRequest`. All other backend endpoints are unimplemented — every dashboard component uses hardcoded mock data. When adding a new API call, add it to this file. The file is `.js` (not `.ts`); keep it consistent if adding functions, or migrate the whole file to `.ts`.

### Component organization

```
src/components/
  auth/        # LoginPage, RecoverPasswordPage
  layout/      # DashboardLayout (sidebar + header, receives role prop)
  student/     # 5 views: Dashboard, Performance, Participation, Habits, Alerts
  teacher/     # 5 views: Dashboard, Activities, Evaluations, RiskMap, Reports
  admin/       # 5 views: Dashboard, Users, BulkUpload, Settings, Reports
  common/      # ProfilePage, NotFoundPage, OfflinePage, SplashScreen
  ui/          # shadcn/ui primitives — do not edit these directly
```

`DashboardLayout` receives `role` and `onLogout` as props and renders the correct sidebar navigation for that role. The logged-in user's name shown in the header is currently hardcoded as `"Usuario Demo"` — the real user object is in `localStorage.getItem('user')`.

### Styling

Global CSS variables (light + dark mode) are defined in `src/styles/globals.css`. Tailwind utility classes are used directly on elements. The primary brand color for interactive elements is `bg-indigo-600`.
