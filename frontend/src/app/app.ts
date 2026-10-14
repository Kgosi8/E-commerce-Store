import { Component, signal } from '@angular/core';
import { NavigationEnd, RouterOutlet } from '@angular/router';

import { AuthService } from './services/auth/auth-service';
import { Header } from './components/partials/header/header';
import { Router } from '@angular/router';
import { filter } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet,Header, CommonModule,RouterOutlet ],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('frontend');
  isAdminRoute = signal(false);

  constructor(private authService: AuthService, private router: Router) {
    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe((e: any) =>{
        this.isAdminRoute.set(e.urlAfterRedirects.startsWith('/admin'));
      });

      this.isAdminRoute.set(this.router.url.startsWith('/admin'));
  }

  ngOnInit() {
    this.authService.loadUser();
  }
}
