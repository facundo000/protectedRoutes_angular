import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from './service/auth.service';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-login-in',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login-in.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true
})
export class LoginInComponent {

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  loginError = signal<string | null>(null);

  public loginForm: FormGroup = this.fb.group({
    username: ['', [Validators.required]],
    password: ['', [Validators.required]]
  });

  onSubmit() {
    if (this.loginForm.invalid) return;

    this.loginError.set(null);
    const { username, password } = this.loginForm.value;

    this.authService.login(username, password).subscribe({
      next: () => {
        const userId = this.authService.getCurrentUserId();
        if (userId) {
          this.router.navigate(['/user', userId]);
        } else {
          this.router.navigate(['/dashboard']);
        }
      },
      error: (err) => {
        this.loginError.set(err?.error?.message || 'Usuario o contraseña incorrectos');
      }
    });
  }
}
