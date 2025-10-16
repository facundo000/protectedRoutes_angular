import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { Router } from '@angular/router';
import { UsersApiService, RemoteUser } from '../../services/users-api.service';

interface User {
  id: number;
  role: string;
  name: string;
}

@Component({
  selector: 'app-dashboard',
  imports: [],
  templateUrl: './dashboard.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent { 
   constructor(
    private router: Router,
    private usersApi: UsersApiService
  ) {
    // Cargar usuarios remotos al crear el componente
    this.loadRemoteUsers();
  }

  // Remote users fetched from backend
  remoteUsers = signal<RemoteUser[]>([]);

  loadRemoteUsers(): void {
    this.usersApi.getUsers().subscribe({
      next: (users) => this.remoteUsers.set(users || []),
      error: (err) => {
        console.error('Failed to load remote users', err);
        alert('Error al obtener usuarios remotos');
      }
    });
  }

  // Señal para el usuario actual
  currentUser = signal('Admin');

  // Señales computadas
  adminCount = computed(() => this.remoteUsers().filter(u => u.role === 'admin').length);

  viewUser(user: RemoteUser): void {
    // Navegar a la página de detalles del usuario
    this.router.navigate(['/user', user.id]);
  }

  deleteUser(user: RemoteUser): void {
    const confirmDelete = confirm(`¿Está seguro de que desea eliminar al usuario ${user.name} ${user.surname}?`);
    
    if (confirmDelete) {
      this.usersApi.deleteUser(user.id).subscribe({
        next: (result) => {
          if (result) {
            alert('Usuario eliminado exitosamente');
            // Recargar la lista de usuarios
            this.loadRemoteUsers();
          } else {
            alert('No se pudo eliminar el usuario');
          }
        },
        error: (err) => {
          console.error('Error al eliminar usuario', err);
          alert('Error al eliminar el usuario. Por favor, intente nuevamente.');
        }
      });
    }
  }
}
