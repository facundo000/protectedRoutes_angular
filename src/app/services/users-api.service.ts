import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface RemoteUser {
  id: string;
  username: string;
  name: string;
  surname: string;
  password: string;
  role: string;
  profileImage?: string;
}

@Injectable({ providedIn: 'root' })
export class UsersApiService {
  private http = inject(HttpClient);
  private base = 'http://localhost:3000/protected-routes/v1';

  getUsers(): Observable<RemoteUser[]> {
    return this.http.get<RemoteUser[]>(`${this.base}/users`);
  }

  getUserProfile(id: string): Observable<RemoteUser> {
    return this.http.get<RemoteUser>(`${this.base}/users/profile/${id}`);
  }

  deleteUser(id: string): Observable<boolean> {
    return this.http.delete<boolean>(`${this.base}/users/remove/${id}`);
  }

  uploadProfileImage(file: File): Observable<{ profileImage: string }> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<{ profileImage: string }>(`${this.base}/users/upload-image`, formData);
  }
}
