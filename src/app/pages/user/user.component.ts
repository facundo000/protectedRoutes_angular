import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from './temp.service';

@Component({
  selector: 'app-user',
  imports: [],
  templateUrl: './user.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserComponent { 
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private userService = inject(UserService);

  private userId = signal<number | null>(null);
  user = computed(() => {
    const id = this.userId();
    return id ? this.userService.getUserById(id) : null;
  });

  constructor() {
    // Get user ID from route params
    this.route.params.subscribe(params => {
      const id = parseInt(params['id']);
      this.userId.set(isNaN(id) ? null : id);
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
    this.router.navigate(['/']);
  }

  deleteUser(): void {
    const currentUser = this.user();
    if (!currentUser) return;

    if (confirm(`¿Está seguro de que desea eliminar al usuario ${currentUser.name}?`)) {
      this.userService.deleteUser(currentUser.id);
      this.router.navigate(['/']);
    }
  }
}
