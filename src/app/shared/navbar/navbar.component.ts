import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../pages/auth/service/auth.service';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavbarComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  payload = computed(() => this.authService.getTokenPayload());
  isAdmin = computed(() => this.payload()?.role === 'admin');
  profileId = computed(() => this.payload()?.id);
  username = computed(() => this.payload()?.username ?? '');

  getInitials(): string {
    const name = this.username();
    return name ? name.charAt(0).toUpperCase() : '?';
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
