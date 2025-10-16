import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private http = inject(HttpClient);

  // Performs login request. If response contains a token it will be stored in localStorage.
  login(username: string, password: string): Observable<any> {
    return this.http.post<any>('http://localhost:3000/protected-routes/v1/auth/login', { username, password })
      .pipe(
        tap(response => {
          // Expecting the backend to return an object with a `token` property
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
