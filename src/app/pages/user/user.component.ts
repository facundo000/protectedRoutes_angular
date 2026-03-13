import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UsersApiService, RemoteUser } from '../../services/users-api.service';
import { AuthService } from '../auth/service/auth.service';
import { environment } from '../../../environments/environment.development';

@Component({
  selector: 'app-user',
  imports: [ReactiveFormsModule],
  templateUrl: './user.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserComponent {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private usersApi = inject(UsersApiService);
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);

  private baseUrl = environment.apiUrl;

  user = signal<RemoteUser | null>(null);
  uploading = signal(false);
  uploadError = signal<string | null>(null);
  editMode = signal(false);
  saving = signal(false);
  saveError = signal<string | null>(null);

  editForm: FormGroup = this.fb.group({
    username: ['', [Validators.required, Validators.minLength(2)]],
    name: ['', [Validators.required, Validators.minLength(2)]],
    surname: ['', [Validators.required, Validators.minLength(2)]],
  });

  isOwnProfile = computed(() => {
    const currentUser = this.user();
    if (!currentUser) return false;
    const id = this.authService.getCurrentUserId();
    return id === currentUser.id;
  });

  isAdmin = computed(() => this.authService.getTokenPayload()?.role === 'admin');

  profileImageUrl = computed(() => {
    const currentUser = this.user();
    if (!currentUser?.profileImage) return null;
    // profileImage can be '/uploads/file.jpg' (from upload response) or 'file.jpg' (from DB)
    const path = currentUser.profileImage.startsWith('/')
      ? currentUser.profileImage
      : `${this.baseUrl}/uploads/${currentUser.profileImage}`;
    return `${this.baseUrl}${path}`;
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

    input.value = '';
  }

  openEditMode(): void {
    const u = this.user();
    if (!u) return;
    this.editForm.setValue({
      username: u.username,
      name: u.name,
      surname: u.surname,
    });
    this.saveError.set(null);
    this.editMode.set(true);
  }

  cancelEdit(): void {
    this.editMode.set(false);
    this.saveError.set(null);
  }

  saveChanges(): void {
    if (this.editForm.invalid) return;
    const currentUser = this.user();
    if (!currentUser) return;

    this.saving.set(true);
    this.saveError.set(null);

    const { username, name, surname } = this.editForm.value;

    this.usersApi.updateUser(currentUser.id, { username, name, surname }).subscribe({
      next: (updated) => {
        this.user.set(updated);
        this.saving.set(false);
        this.editMode.set(false);
      },
      error: (err) => {
        this.saveError.set(err?.error?.message || 'Error al guardar los cambios.');
        this.saving.set(false);
      }
    });
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

    if (!confirm(`¿Está seguro de que desea eliminar al usuario ${currentUser.name} ${currentUser.surname}?`)) return;

    this.usersApi.deleteUser(currentUser.id).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (err) => alert(err?.error?.message || 'Error al eliminar el usuario.'),
    });
  }
}
