import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../services/auth/auth-service';
import { Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { stat } from 'fs';

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
    private router: Router,
    private toastr: ToastrService,
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      console.log('Form Values:', this.loginForm.value);

      this.authService.login(this.loginForm.value).subscribe({
        next: (res: any) => {
           // 🔹 Load user profile so header updates immediately

          this.authService.loadUser();
          console.log(res.status);
          this.authService.role$.subscribe((role) => {
              if (role === 'admin') {
                // 🔹 Redirect to admin dashboard
                this.toastr.success(res.message, res.status);
                this.router.navigate(['/admin-dashboard']);
              } else {
                // 🔹 Redirect to home
                this.router.navigate(['/']);
                this.toastr.success(res.message, res.status);
              }
            });
            console.log('Login successful', res);
            return;
        },

        error: (err) => {
          const status=err.status;
          const errorData=err.error;

          if(status===400){
            this.toastr.error(errorData.message, errorData.status);
          }else if(status===500){
            this.toastr.error('Server error. Please try again later.', 'Error');
          }
        },
      });
    }
  }
}
