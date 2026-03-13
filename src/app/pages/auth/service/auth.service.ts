import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface RegisterPayload {
  username: string;
  name: string;
  surname: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private http = inject(HttpClient);
  private base = 'http://localhost:3000/protected-routes/v1/auth';

  login(username: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.base}/login`, { username, password })
      .pipe(
        tap(response => {
          if (response && response.token) {
            this.setToken(response.token);
          }
        })
      );
  }

  register(payload: RegisterPayload): Observable<any> {
    return this.http.post<any>(`${this.base}/register`, payload);
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

  getCurrentUserId(): string | null {
    const token = this.getToken();
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.id ?? null;
    } catch {
      return null;
    }
  }

}
