import { Injectable, signal } from '@angular/core';

export interface User {
  id: number;
  role: string;
  name: string;
  email?: string;
  phone?: string;
  department?: string;
  joinDate?: string;
  lastLogin?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private usersSignal = signal<User[]>([
    { 
      id: 1, 
      role: 'Admin', 
      name: 'Juan Pérez',
      email: 'juan.perez@empresa.com',
      phone: '+34 123 456 789',
      department: 'Administración',
      joinDate: '2023-01-15',
      lastLogin: '2024-01-15 10:30'
    },
    { 
      id: 2, 
      role: 'User', 
      name: 'María González',
      email: 'maria.gonzalez@empresa.com',
      phone: '+34 987 654 321',
      department: 'Ventas',
      joinDate: '2023-03-20',
      lastLogin: '2024-01-14 16:45'
    },
    { 
      id: 3, 
      role: 'User', 
      name: 'Carlos Rodríguez',
      email: 'carlos.rodriguez@empresa.com',
      phone: '+34 555 123 456',
      department: 'Marketing',
      joinDate: '2023-05-10',
      lastLogin: '2024-01-13 09:15'
    },
    { 
      id: 4, 
      role: 'User', 
      name: 'Ana Martínez',
      email: 'ana.martinez@empresa.com',
      phone: '+34 666 789 012',
      department: 'Recursos Humanos',
      joinDate: '2023-07-05',
      lastLogin: '2024-01-12 14:20'
    },
    { 
      id: 5, 
      role: 'User', 
      name: 'Luis Fernández',
      email: 'luis.fernandez@empresa.com',
      phone: '+34 777 345 678',
      department: 'Desarrollo',
      joinDate: '2023-09-12',
      lastLogin: '2024-01-11 11:30'
    }
  ]);

  users = this.usersSignal.asReadonly();

  getUserById(id: number): User | undefined {
    return this.users().find(user => user.id === id);
  }

  deleteUser(id: number): void {
    this.usersSignal.update(users => users.filter(user => user.id !== id));
  }

  addUser(user: Omit<User, 'id'>): void {
    const currentUsers = this.users();
    const newUser: User = {
      ...user,
      id: Math.max(...currentUsers.map(u => u.id)) + 1,
    };
    this.usersSignal.update(users => [...users, newUser]);
  }

  updateUser(updatedUser: User): void {
    this.usersSignal.update(users => 
      users.map(user => user.id === updatedUser.id ? updatedUser : user)
    );
  }
}