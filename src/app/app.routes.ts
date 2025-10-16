import { Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { LoginInComponent } from './pages/auth/login-in.component';
import { UserComponent } from './pages/user/user.component';
import { authGuard } from './core/auth.guard';

export const routes: Routes = [
    { path: '', component: LoginInComponent },
    { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
    { path: 'user/:id', component: UserComponent, canActivate: [authGuard] },
];
