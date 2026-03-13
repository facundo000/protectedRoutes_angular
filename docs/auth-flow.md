### Auth Flow

1. `LoginInComponent` calls `AuthService.login()` → POST `/protected-routes/v1/auth/login`
2. On success, `AuthService.setToken()` stores the JWT in `localStorage` under key `auth_token`
3. `authGuard` (`core/auth.guard.ts`) checks `AuthService.isAuthenticated()` on every guarded route; redirects to `/` if no token
4. `authInterceptor` (`core/auth.interceptor.ts`) automatically attaches `Authorization: Bearer <token>` to every outgoing HTTP request

### Key Files

| File | Role |
|------|------|
| `src/app/core/auth.guard.ts` | `CanActivateFn` — route protection |
| `src/app/core/auth.interceptor.ts` | `HttpInterceptorFn` — JWT injection |
| `src/app/pages/auth/service/auth.service.ts` | Token management + login API call |
| `src/app/services/users-api.service.ts` | `getUsers()`, `getUserProfile(id)`, `deleteUser(id)` |
| `src/app/pages/user/temp.service.ts` | Local mock data (used during offline dev) |