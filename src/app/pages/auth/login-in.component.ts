import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from './service/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login-in',
  imports: [ReactiveFormsModule],
  templateUrl: './login-in.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true
})
export class LoginInComponent {
  
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  public loginForm: FormGroup = this.fb.group({
    username: ['', [Validators.required]],
    password: ['', [Validators.required]]
  });

  onSubmit() {
    if (this.loginForm.invalid) {
      return;
    }

    const { username, password } = this.loginForm.value;
    this.authService.login(username, password).subscribe({
      next: (response) => {
        // Login successful (token stored by AuthService)
        console.log('login response', response);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        console.error('login error', err);
        // TODO: display error to user - simple alert for now
        alert(err?.error?.message || 'Error en el login');
      }
    })
  }
}
