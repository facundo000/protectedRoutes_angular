import { Component, inject } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { NavbarComponent } from './shared/navbar/navbar.component';
import { AuthService } from './pages/auth/service/auth.service';
import { filter } from 'rxjs/operators';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent],
  templateUrl: './app.html',
})
export class App {
  private authService = inject(AuthService);
  private router = inject(Router);

  showNav = toSignal(
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd),
      map(() => {
        const url = this.router.url;
        return this.authService.isAuthenticated() && url !== '/' && url !== '/register';
      })
    ),
    { initialValue: false }
  );
}
