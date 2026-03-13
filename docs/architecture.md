## Architecture

**Angular 20 standalone components** — no NgModules. All components use `standalone: true` and `inject()` for dependency injection.

### Application Bootstrap

- `app.config.ts` — registers `provideRouter`, `provideHttpClient(withInterceptors([authInterceptor]))`
- `app.routes.ts` — declares all routes
- `app.ts` / `app.html` — root component with `<router-outlet>`

### Route Structure

| Path | Component | Guard |
|------|-----------|-------|
| `/` | `LoginInComponent` | none |
| `/dashboard` | `DashboardComponent` | `authGuard` |
| `/user/:id` | `UserComponent` | `authGuard` |