# ProtectedRoutesAngular

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 20.1.4.

Debe poder permitirse acceder al dashboard todo usuario autenticado. pero solo podrá eliminar y/o actualziar a otro usuario el que tenga el rol de admin. Caso contrario solo podrán actualizar y eliminar su propio usuario

# Integración de JWT (cómo se implementó)

Esta sección documenta paso a paso cómo se integraron los **JSON Web Tokens (JWT)** en este proyecto Angular, para que puedas reutilizar el mismo patrón en otras aplicaciones.

## Objetivos principales

- Proteger rutas del frontend para que solo usuarios autenticados puedan acceder al panel de control (*dashboard*).
- Incluir el JWT en todas las solicitudes HTTP salientes dirigidas a endpoints protegidos del backend.
- Exponer métodos útiles en un servicio `AuthService` para iniciar/cerrar sesión y verificar el estado de autenticación.
- Permitir o denegar acciones (como eliminar o actualizar) según el rol del usuario, devuelto por el backend.

## Flujo general del token

1. El usuario envía sus credenciales (usuario/contraseña) al endpoint de login del backend.
2. El backend valida las credenciales y responde con un JWT (y opcionalmente un objeto de usuario).
3. El frontend almacena el JWT (en este proyecto, en `localStorage`).
4. Un **interceptor HTTP** añade automáticamente la cabecera `Authorization: Bearer <token>` a las solicitudes salientes.
5. Un **guardia de rutas** (`AuthGuard`) verifica la autenticación antes de permitir navegar a rutas protegidas.
6. Componentes y servicios leen el token o la información del usuario desde `AuthService` para renderizar condicionalmente elementos de la interfaz (por ejemplo, mostrar/ocultar botones de eliminación solo para administradores).

## Archivos involucrados (frontend)

- `src/app/pages/auth/service/auth.service.ts`: gestiona el login/logout, el almacenamiento del token y métodos auxiliares como `isAuthenticated()`.
- `src/app/core/auth.interceptor.ts` (o `src/app/interceptors/auth.interceptor.ts`): interceptor HTTP que añade la cabecera `Authorization` cuando existe un token.
- `src/app/core/auth.guard.ts` (o `src/app/guards/auth.guard.ts`): guardia de rutas que impide el acceso a rutas protegidas si el usuario no está autenticado.
- `src/app/pages/user/user.component.ts` y `src/app/pages/dashboard/dashboard.component.ts`: componentes que usan `UsersApiService` y `AuthService` para obtener datos y mostrar acciones condicionales según el rol del usuario.
- `src/app/app.routes.ts`: configuración de rutas, donde las rutas protegidas están asociadas al `AuthGuard`.

## Detalles de implementación (paso a paso)

### 1. Responsabilidades del `AuthService`

- `login(username, password)`: llama al endpoint `/auth/login` del backend, recibe el JWT y los datos del usuario.
- `logout()`: elimina el token y cualquier información de usuario almacenada en `localStorage`, y redirige al login.
- `getToken()`: devuelve el token almacenado.
- `isAuthenticated()`: devuelve `true` o `false` según si existe un token (y opcionalmente verifica si ha expirado).
- `getUser()`: devuelve la información del usuario (si se guardó) para acceder a su rol, nombre, etc.

#### Notas de implementación

- **Almacenamiento del token**: En este proyecto se usa `localStorage` con una clave como `auth_token`. Puedes usar `sessionStorage` si prefieres que el token desaparezca al cerrar la pestaña.
- **Análisis del token**: Si el backend incluye información del usuario en la respuesta de login, guárdala (por ejemplo, como JSON en `localStorage` bajo la clave `auth_user`) para evitar decodificar el JWT en cada uso.  
  ⚠️ **Importante**: La decodificación del JWT en el cliente solo debe usarse para fines de interfaz. **La autorización real siempre debe validarse en el backend**.

### 2. Interceptor HTTP

- El interceptor consulta `AuthService.getToken()` en cada solicitud saliente. Si existe un token, clona la petición y añade la cabecera `Authorization: Bearer <token>`.
- Debe registrarse globalmente en los `providers` (normalmente en `app.config.ts` o `main.ts`) usando el token `HTTP_INTERCEPTORS`.

### 3. Guardia de autenticación (`AuthGuard`)

- Usa `AuthService.isAuthenticated()` para decidir si permite la navegación. Si no está autenticado, redirige al login (por ejemplo, a `['/login']`) y devuelve `false`.
- Para protección basada en roles, puedes extender el guardia para leer metadatos de la ruta (como `{ roles: ['admin'] }`) y compararlos con el rol del usuario obtenido mediante `AuthService.getUser().role`.

### 4. Configuración de rutas y componentes

- Protege rutas como el *dashboard* o la gestión de usuarios añadiendo `canActivate: [authGuard]` en `app.routes.ts`.
- En componentes con acciones sensibles (eliminar, editar), usa `AuthService.getUser()` o un método como `AuthService.hasRole('admin')` para mostrar u ocultar botones según el rol.

## Recomendaciones de seguridad

- **Nunca confíes únicamente en las validaciones del lado del cliente** para autorización. Siempre verifica roles y permisos en el backend.
- **Considera la expiración del token**: revisa el campo `exp` del payload del JWT y cierra la sesión o renueva el token si ha expirado.
- **Usa HTTPS en producción** para garantizar que los tokens se transmitan de forma segura.
- **Evita almacenar secretos sensibles en `localStorage`**. Aunque los tokens son aceptables, ten en cuenta el riesgo de ataques XSS. Para mayor seguridad, considera usar *cookies httpOnly* junto con protección CSRF si tu backend lo soporta.

## Cómo reutilizar esta configuración en otro proyecto (lista de verificación)

1. Crea un `AuthService` con los mismos métodos públicos: `login`, `logout`, `getToken`, `isAuthenticated`, `getUser` y `hasRole`.
2. Implementa un interceptor HTTP que añada la cabecera `Authorization` cuando exista un token.
3. Añade un `AuthGuard` y aplícalo a las rutas protegidas en la configuración de enrutamiento.
4. En los componentes, usa `AuthService` para mostrar u ocultar elementos de la interfaz según el rol del usuario.
5. Registra el interceptor como proveedor y asegúrate de que el guardia esté disponible donde se necesite.

## Referencias rápidas de código

- **Ejemplo de login** (`AuthService`): ver `src/app/pages/auth/service/auth.service.ts` — almacena el token (y opcionalmente los datos del usuario) en `localStorage`.
- **Ejemplo de interceptor**: busca archivos llamados `auth.interceptor.ts` en `src/app`.
- **Ejemplo de guardia**: busca `auth.guard.ts` en `src/app`.

## Prueba local

1. Inicia la API del backend (asegúrate de que el endpoint de login devuelva un JWT).
2. Inicia la aplicación Angular:

3. Abre http://localhost:4200 , inicia sesión con credenciales válidas y verifica que:
- Tras el login, se redirija automáticamente a /dashboard.
- Todas las solicitudes protegidas incluyan la cabecera Authorization: Bearer <token> (puedes inspeccionarlas en las Herramientas de desarrollo → Red).
- Los botones de acciones exclusivas para administradores solo aparezcan si el usuario tiene el rol admin.

## Ejemplos concretos extraídos del proyecto
Abajo hay fragmentos reales de código tal como están en este repositorio. Puedes copiarlos y adaptarlos a otros proyectos.

1) `AuthService` (almacenamiento y helpers)

```typescript
// src/app/pages/auth/service/auth.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
	providedIn: 'root'
})
export class AuthService {

	private http = inject(HttpClient);

	// Realiza la petición de login. Si la respuesta tiene `token` lo guarda en localStorage.
	login(username: string, password: string): Observable<any> {
		return this.http.post<any>('http://localhost:3000/protected-routes/v1/auth/login', { username, password })
			.pipe(
				tap(response => {
					// Se espera que el backend retorne un objeto con la propiedad `token`
					if (response && response.token) {
						this.setToken(response.token);
					}
				})
			);
	}

	setToken(token: string) {
		localStorage.setItem('auth_token', token);
	}

	getToken(): string | null {
		return localStorage.getItem('auth_token');
	}

	isAuthenticated(): boolean {
		return !!this.getToken();
	}

	logout(): void {
		localStorage.removeItem('auth_token');
	}

}
```

2) `authInterceptor` (adjunta el header Authorization)

```typescript
// src/app/core/auth.interceptor.ts
import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../pages/auth/service/auth.service';
import { Observable } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> => {
	const auth = inject(AuthService);
	const token = auth.getToken();

	if (token) {
		const cloned = req.clone({
			headers: req.headers.set('Authorization', `Bearer ${token}`)
		});
		return next(cloned);
	}

	return next(req);
};
```

3) `authGuard` (protege rutas)

```typescript
// src/app/core/auth.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../pages/auth/service/auth.service';

export const authGuard: CanActivateFn = () => {
	const auth = inject(AuthService);
	const router = inject(Router);

	if (auth.isAuthenticated()) {
		return true;
	}

	// no autenticado -> redirigir a login
	router.navigate(['']);
	return false;
};
```

Notas finales
- Estos fragmentos coinciden con la estructura actual del proyecto. Si copias/pegas en otro proyecto recuerda ajustar las rutas del backend (`http://localhost:3000/...`) y cómo registras proveedores/guards dependiendo de si usas componentes aislados (standalone) o módulos.
