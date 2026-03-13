import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UsersApiService, RemoteUser } from '../../services/users-api.service';
import { AuthService } from '../auth/service/auth.service';

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
  private authService = inject(AuthService);

  private baseUrl = 'http://localhost:3000';

  user = signal<RemoteUser | null>(null);
  uploading = signal(false);
  uploadError = signal<string | null>(null);

  isOwnProfile = computed(() => {
    const currentUser = this.user();
    if (!currentUser) return false;
    const token = this.authService.getToken();
    if (!token) return false;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.id === currentUser.id;
    } catch {
      return false;
    }
  });

  profileImageUrl = computed(() => {
    const currentUser = this.user();
    if (!currentUser?.profileImage) return null;
    return `${this.baseUrl}${currentUser.profileImage}`;
  });

  constructor() {
    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
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

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];
    this.uploading.set(true);
    this.uploadError.set(null);

    this.usersApi.uploadProfileImage(file).subscribe({
      next: (res) => {
        this.user.update(u => u ? { ...u, profileImage: res.profileImage } : u);
        this.uploading.set(false);
      },
      error: (err) => {
        console.error('Error uploading image', err);
        this.uploadError.set('Error al subir la imagen. Inténtalo de nuevo.');
        this.uploading.set(false);
      }
    });

    // Reset input so the same file can be re-selected
    input.value = '';
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
