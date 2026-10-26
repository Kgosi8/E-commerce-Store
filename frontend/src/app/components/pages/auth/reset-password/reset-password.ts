import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit, signal } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';


// Custom validator — passwords must match
function passwordsMatch(control: AbstractControl) {
  const pass    = control.get('password')?.value;
  const confirm = control.get('confirmPassword')?.value;
  return pass === confirm ? null : { mismatch: true };
}

@Component({
  selector: 'app-reset-password',
  imports: [CommonModule, ReactiveFormsModule,RouterLink],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.css',
})
export class ResetPassword implements OnInit{

  form!: FormGroup;

  isSubmitting = signal(false);
  success      = signal(false);
  error        = signal<string | null>(null);
  tokenValid   = signal(true);

  private token = '';
  private email = '';

  constructor(
    private fb:    FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private http:  HttpClient,
  ) {
    this.form = this.fb.group({
    password:        ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', Validators.required],
  }, { validators: passwordsMatch });
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.token = params['token'] ?? '';
      this.email = params['email'] ?? '';

      if (!this.token || !this.email) {
        this.tokenValid.set(false);
      }
    });
  }

  onSubmit(): void {
    if (this.form.invalid || this.isSubmitting()) return;

    this.isSubmitting.set(true);
    this.error.set(null);

    this.http.post<any>('http://localhost:5000/api/reset-password', {
      email:    this.email,
      token:    this.token,
      password: this.form.value.password,
    }).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.success.set(true);
        setTimeout(() => this.router.navigate(['/login']), 3000);
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.error.set(err?.error?.message ?? 'Something went wrong. Please try again.');
      },
    });
  }

}
