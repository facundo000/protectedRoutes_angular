import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { UsersApiService, RemoteUser } from '../../services/users-api.service';
import { AuthService } from '../auth/service/auth.service';

@Component({
  selector: 'app-dashboard',
  imports: [],
  templateUrl: './dashboard.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent {
  private router = inject(Router);
  private usersApi = inject(UsersApiService);
  private authService = inject(AuthService);

  remoteUsers = signal<RemoteUser[]>([]);
  isAdmin = computed(() => this.authService.getTokenPayload()?.role === 'admin');

  constructor() {
    this.loadRemoteUsers();
  }

  loadRemoteUsers(): void {
    this.usersApi.getUsers().subscribe({
      next: (users) => this.remoteUsers.set(users || []),
      error: (err) => console.error('Failed to load remote users', err),
    });
  }

  viewUser(user: RemoteUser): void {
    this.router.navigate(['/user', user.id]);
  }

  deleteUser(user: RemoteUser): void {
    if (!confirm(`¿Eliminar al usuario ${user.name} ${user.surname}?`)) return;

    this.usersApi.deleteUser(user.id).subscribe({
      next: () => this.loadRemoteUsers(),
      error: (err) => {
        console.error('Error al eliminar usuario', err);
        alert(err?.error?.message || 'Error al eliminar el usuario.');
      }
    });
  }
}
