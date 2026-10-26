import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  imports: [CommonModule,ReactiveFormsModule,RouterLink],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.css',
})
export class ForgotPassword {

  
  form!: FormGroup;
  

  isSubmitting = signal(false);
  success      = signal(false);
  error        = signal<string | null>(null);

  constructor(
    private fb:   FormBuilder,
    private http: HttpClient,
  ) {
    this.form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });
  }

  onSubmit(): void {
    if (this.form.invalid || this.isSubmitting()) return;

    this.isSubmitting.set(true);
    this.error.set(null);

    this.http.post<any>('http://localhost:5000/api/forgot-password', {
      email: this.form.value.email,
    }).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.success.set(true);
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.error.set(err?.error?.message ?? 'Something went wrong. Please try again.');
      },
    });
  }

}
