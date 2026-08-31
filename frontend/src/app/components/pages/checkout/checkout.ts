import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CheckoutService } from '../../../services/checkout/checkout-service';
import {Order} from '../../../interfaces/order';
import { OrderService } from '../../../services/order/order';


 




@Component({
  selector: 'app-checkout',
  imports: [FormsModule,CommonModule],
  templateUrl: './checkout.html',
  styleUrl: './checkout.css',
})


export class Checkout implements OnInit {


  // ── Exposed service signals directly to template
  readonly currentStep;

  readonly form;
  readonly errors;
  readonly paymentMethod;
  readonly cartItems;
  readonly subtotal;
  readonly deliveryFee;
  readonly total;
  readonly bank;
 
  // ── State ──────────────────────────────────────────────────

  agreedToTerms = false;
  isPlacingOrder = false;
  orderPlaced = false;
  isSubmitting: boolean = false;
  submitError: string| null = null;
  placedOrder: Order | null = null;

 
 

 get orderRef(): string {
    return this.placedOrder?.orderId ?? '';
  }
  
 
  // ── Constructor ────────────────────────────────────────────
  constructor(
    private router: Router,
    public checkout: CheckoutService,
    private orderService: OrderService

  ) {
    this.currentStep= this.checkout.currentStep;
    this.form= this.checkout.form;
    this.errors= this.checkout.errors;
    this.paymentMethod= this.checkout.paymentMethod;
    this.cartItems = this.checkout.cartItems;
    this.subtotal    = this.checkout.subtotal;
    this.deliveryFee = this.checkout.deliveryFee;
    this.total       = this.checkout.total;
    this.bank = this.orderService.bankDetails;
  }

  


 
  // ── Lifecycle ──────────────────────────────────────────────
  ngOnInit(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  goBack(): void {
    this.router.navigate(['/cart']);
  }
  
  continueShopping(): void {
    this.checkout.reset();
    this.router.navigate(['/']);
  }
 
  goToStep(step: number): void {
    this.checkout.goToStep(step);
  }


  // ── Place order
  placeOrder(): void {
    if (this.isSubmitting) return;

    this.isSubmitting = true;
    this.submitError  = null;

    const payload = this.checkout.buildOrderPayload();

    this.orderService.createOrder(payload).subscribe({
      next: (res) => {
        this.placedOrder  = res.order;
        this.orderPlaced  = true;
        this.isSubmitting = false;
        this.checkout.reset();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },
      error: (err) => {
        this.isSubmitting = false;
        this.submitError  =
          err?.error?.message   ??
          err?.error?.errors?.[0] ??
          'Something went wrong. Please try again.';
      },
    });
  }
 
  
}
 
  
 
  
 
  
