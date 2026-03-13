---
name: angular-interfaces
description: Explains how to define and use Angular interfaces in separate files. Use when teaching about Angular interface design or when the user asks about organizing interface definitions.
---

Any TypeScript interface used in the Angular frontend **must be defined in a dedicated file**, never within the same `.ts` file where it is consumed (component, service, store, etc.).

## File Structure

Interface files must follow this naming and location convention:

```
src/
└── app/
├── core/
│ └── interfaces/
│ ├── user.interface.ts
│ ├── product.interface.ts
│ └── auth.interface.ts
├── features/
│ └── [feature]/
│ ├── interfaces/
│ │ └── [feature].interface.ts
│ ├── [feature].component.ts

│ └── [feature].service.ts

└── shared/

└── interfaces/

└── pagination.interface.ts
```

### Naming Convention

- The file must end with `.interface.ts`
- The name must be descriptive and in kebab-case
- Example: `user-profile.interface.ts`, `api-response.interface.ts`

---

## ✅ Correct

**`user.interface.ts`**
```typescript
export interface User {
id: number;
name: string;
email: string;
role: 'admin' | 'viewer';

}

export interface UserResponse {
data: User[];
total: number;

}
```

**`user.service.ts`**
```typescript
import { User, UserResponse } from './interfaces/user.interface';

@Injectable({ providedIn: 'root' })
export class UserService { 
getUsers(): Observable<UserResponse> { ... }
}
```

---

## ❌ Incorrect

```typescript
// user.service.ts — DO NOT define interfaces here
interface User { // ❌ interface embedded in the same file 
id: number; 
name: string;
}

@Injectable({ providedIn: 'root' })
export class UserService {
getUsers(): Observable<User[]> { ... }
}
```

---

## Specific Rules

1. **One or more interfaces per file** — related interfaces can be grouped in the same `.interface.ts` file, but never mix them with component or service logic.

2. **Always export** — all interfaces must use `export interface`; never define them without exporting.

3. **No logic** — `.interface.ts` files should only contain related `interface`, `type`, and `enum`. No classes, functions, or decorators.

4. **Reuse first** — before creating a new interface, check if an equivalent already exists in `shared/interfaces/`.

5. **API Response Interfaces** — must reside in `core/interfaces/` or in the `interfaces/` folder of the corresponding feature, never in the calling service.

---

## When to Apply This Rule

This rule applies **whenever** the following are created or modified:

- Components (`.component.ts`)
- Services (`.service.ts`)
- Stores / State management (NgRx, Signals)
- Guards (`.guard.ts`)
- Resolvers (`.resolver.ts`)
- Pipes (`.pipe.ts`)

If the file requires a new or modified interface, **the agent must create or edit the corresponding `.interface.ts` file** as part of the same change.