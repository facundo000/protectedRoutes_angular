import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UsersApiService, RemoteUser } from '../../services/users-api.service';

@Component({
  selector: 'app-user',
  imports: [],
  templateUrl: './user.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserComponent { 
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private usersApi = inject(UsersApiService);

  private userId = signal<number | null>(null);
  // user holds the remote user profile or null
  user = signal<RemoteUser | null>(null);

  constructor() {
    // Get user ID from route params
    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        // request remote profile
        this.usersApi.getUserProfile(id).subscribe({
          next: (u) => this.user.set(u),
          error: (err) => {
            console.error('Error fetching user profile', err);
            this.user.set(null);
          }
        });
      } else {
        this.user.set(null);
      }
    });
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  formatDate(dateString: string | undefined): string {
    if (!dateString) return 'No especificado';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  formatDateTime(dateTimeString: string | undefined): string {
    if (!dateTimeString) return 'No especificado';
    const date = new Date(dateTimeString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }

  deleteUser(): void {
    const currentUser = this.user();
    if (!currentUser) return;

    if (confirm(`¿Está seguro de que desea eliminar al usuario ${currentUser.name}?`)) {
      alert('Eliminación no implementada en el backend desde este cliente.');
      this.router.navigate(['/']);
    }
  }
}
