import { Component, signal, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../core/auth.service';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="login-container">
      <div class="login-card">
        <div class="text-center mb-4">
          <img src="/LOGO-SMEK-baru2.png" alt="Logo SMEK" style="height: 60px; max-width: 100%; object-fit: contain; margin-bottom: 0.5rem;">
          <p class="text-light" style="margin: 0; font-size: 0.9rem;">Sistem Manajemen Event Kampus</p>
        </div>
        
        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label>Email</label>
            <input type="email" formControlName="email" placeholder="Masukkan email">
          </div>
          <div class="form-group">
            <label>Password</label>
            <div class="password-wrapper">
              <input [type]="showPassword() ? 'text' : 'password'" formControlName="password" placeholder="Masukkan password">
              <button type="button" class="toggle-password-btn" (click)="togglePasswordVisibility()">
                <svg *ngIf="showPassword()" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" style="width: 20px; height: 20px;">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.644C3.052 8.305 7.8 5 12 5c4.2 0 8.948 3.305 9.964 6.678c.079.186.079.39 0 .576C20.947 15.69 16.2 19 12 19c-4.2 0-8.948-3.305-9.964-6.678Z" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                </svg>
                <svg *ngIf="!showPassword()" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" style="width: 20px; height: 20px;">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                </svg>
              </button>
            </div>
          </div>
          
          <div *ngIf="error()" class="error-msg">{{ error() }}</div>
          
          <button type="submit" class="btn btn-primary w-100" [disabled]="loginForm.invalid || isLoading()">
            {{ isLoading() ? 'Loading...' : 'LOGIN' }}
          </button>
        </form>
        
        <div class="text-center mt-4">
          <small class="text-light">Belum punya akun? <a routerLink="/register">Daftar Akun</a></small>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background-color: var(--secondary-color);
    }
    .login-card {
      background: white;
      padding: 2.5rem;
      border-radius: 8px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
      width: 100%;
      max-width: 400px;
    }
    .text-center { text-align: center; }
    .text-light { color: var(--text-light); }
    .mb-4 { margin-bottom: 1.5rem; }
    .mt-4 { margin-top: 1.5rem; }
    .w-100 { width: 100%; }
    .form-group { margin-bottom: 1rem; }
    .password-wrapper {
      position: relative;
      display: flex;
      align-items: center;
      width: 100%;
    }
    .password-wrapper input {
      margin-bottom: 0 !important;
      padding-right: 2.5rem;
    }
    .toggle-password-btn {
      position: absolute;
      right: 0.75rem;
      background: transparent;
      border: none;
      color: #94a3b8;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0;
    }
    .toggle-password-btn:hover {
      color: #64748b;
    }
    label { display: block; margin-bottom: 0.5rem; font-weight: 500; font-size: 0.875rem; }
    .error-msg { color: var(--danger-color); font-size: 0.875rem; margin-bottom: 1rem; text-align: center; }
    a { color: var(--accent-color); text-decoration: none; font-weight: 500; }
    a:hover { text-decoration: underline; }
  `]
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = signal(false);
  showPassword = signal(false);
  error = signal('');
 
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
 
  constructor() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  togglePasswordVisibility() {
    this.showPassword.update(v => !v);
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.isLoading.set(true);
      this.error.set('');
      this.authService.login(this.loginForm.value).subscribe({
        next: (res) => {
          const role = this.authService.currentUserValue?.role;
          if (role === 'ADMIN') this.router.navigate(['/admin/dashboard']);
          else if (role === 'PANITIA') this.router.navigate(['/panitia/dashboard']);
          else if (role === 'PESERTA') this.router.navigate(['/peserta/dashboard']);
          else this.router.navigate(['/']);
        },
        error: (err) => {
          this.isLoading.set(false);
          this.error.set('Email atau password salah');
        }
      });
    }
  }
}
