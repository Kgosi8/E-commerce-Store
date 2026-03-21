import { Component, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthService } from '../../../services/auth/auth-service';
import { CartService } from '../../../services/cart/cart-service';
import { AccountDetails } from "../account-details/account-details";

@Component({
  selector: 'app-header',
  imports: [AsyncPipe, RouterLink, MatIconModule, AccountDetails],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class Header implements OnInit {
  isLoggedIn$: any;
  initials$: any;
  showAccountDetails=false;



  // convert observable to signal — cleaner in templates
  cartCount = signal(0);

  constructor(
    private router: Router,
    private authService: AuthService,
    private cartService: CartService
  ) {
    // Initialize properties after services are available
    this.isLoggedIn$ = this.authService.isLoggedIn$;
    this.initials$ = this.authService.initials$;
    
    // subscribe once, push into signal
    this.cartService.cartCount$
      .pipe(takeUntilDestroyed())
      .subscribe(count => this.cartCount.set(count));
  }

  ngOnInit() {
    this.cartService.getCart().subscribe();
  }

  goTohomePage() { this.router.navigate(['/']); }
  goTocartPage()  { this.router.navigate(['/cart']); }
}