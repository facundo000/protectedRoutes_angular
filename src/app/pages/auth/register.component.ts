import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from './service/auth.service';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true
})
export class RegisterComponent {

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  registerError = signal<string | null>(null);
  success = signal(false);

  public registerForm: FormGroup = this.fb.group({
    username: ['', [Validators.required, Validators.minLength(2)]],
    name: ['', [Validators.required, Validators.minLength(2)]],
    surname: ['', [Validators.required, Validators.minLength(2)]],
    password: ['', [Validators.required, Validators.minLength(5)]],
  });

  onSubmit() {
    if (this.registerForm.invalid) return;

    this.registerError.set(null);
    const { username, name, surname, password } = this.registerForm.value;

    this.authService.register({ username, name, surname, password }).subscribe({
      next: () => {
        this.success.set(true);
        setTimeout(() => this.router.navigate(['/']), 2000);
      },
      error: (err) => {
        this.registerError.set(err?.error?.message || 'Error al registrarse. Inténtalo de nuevo.');
      }
    });
  }
}
