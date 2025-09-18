import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../user/temp.service';

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
    public userService: UserService
  ) {}

  // Señal para el usuario actual
  currentUser = signal('Admin');

  // Señales computadas
  adminCount = computed(() => this.userService.users().filter(user => user.role === 'Admin').length);

  viewUser(user: any): void {
    console.log('Ver información del usuario:', user);
    this.router.navigate(['/user', user.id]);
  }

  deleteUser(user: any): void {
    if (confirm(`¿Está seguro de que desea eliminar al usuario ${user.name}?`)) {
      this.userService.deleteUser(user.id);
      console.log('Usuario eliminado:', user);
    }
  }

  addUser(): void {
    const name = prompt('Ingrese el nombre del nuevo usuario:');
    if (name && name.trim()) {
      const newUser = {
        role: 'User',
        name: name.trim(),
        email: `${name.trim().toLowerCase().replace(' ', '.')}@empresa.com`,
        phone: '+34 000 000 000',
        department: 'Sin asignar',
        joinDate: new Date().toISOString().split('T')[0],
        lastLogin: new Date().toISOString()
      };
      this.userService.addUser(newUser);
      console.log('Usuario agregado:', newUser);
    }
  }

  exportUsers(): void {
    const dataStr = JSON.stringify(this.userService.users(), null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'usuarios.json';
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  }
}
