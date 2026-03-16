import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../services/auth/auth-service';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {

  loginForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {

    this.loginForm = this.fb.group({
      email: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

  }

  onSubmit() {

    if (this.loginForm.valid) {

      this.authService.login(this.loginForm.value).subscribe({

        next: (res: any) => {

          console.log('Login successful', res);

          // 🔹 Load user profile so header updates immediately
          this.authService.loadUser();

          // 🔹 Redirect to home
          this.router.navigate(['/']);
        },

        error: (err) => {
          console.error('Login failed', err);
        }

      });

    }

  }

}