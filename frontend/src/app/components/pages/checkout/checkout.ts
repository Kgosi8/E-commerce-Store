import { Component, OnInit, Signal }  from '@angular/core';
import { CommonModule }        from '@angular/common';
import { Router }              from '@angular/router';
import { CheckoutService }    from '../../../services/checkout/checkout-service';
import { OrderService }       from '../../../services/order/order';
import { CartService }        from '../../../services/cart/cart-service';       // TODO: adjust path
import { BankDetails, Order, PaymentMethod }              from '../../../interfaces/order';
import { CheckoutForm, CheckoutValidationErrors } from '../../../interfaces/checkout';
import { CartItem } from '../../../interfaces/cart-item';

@Component({
  selector:    'app-checkout',
  imports:     [CommonModule],
  templateUrl: './checkout.html',
  styleUrls:   ['./checkout.css'],
})
export class Checkout implements OnInit {  



  // ── Signals — assigned in constructor, not at declaration
  currentStep:   Signal<number>;
  form:          Signal<CheckoutForm>;
  errors:        Signal<CheckoutValidationErrors>;
  paymentMethod: Signal<PaymentMethod | ''>;
  cartItems:     Signal<CartItem[]>;
  subtotal:      Signal<number>;
  deliveryFee:   Signal<number>;
  total:         Signal<number>;
  cartLoading:   Signal<boolean>;
  cartError:     Signal<string | null>;
  bank:          BankDetails;

  // ── Local UI state
  orderPlaced  = false;
  isSubmitting = false;
  submitError: string | null = null;
  placedOrder: Order | null  = null;

  get orderRef(): string {
    return this.placedOrder?.orderId ?? '';
  }

  constructor(
    public  checkout:     CheckoutService,
    private orderService: OrderService,
    private cartService:  CartService,
    private router:       Router,
  ) {
    // ── Safe to reference injected services here
    this.currentStep   = this.checkout.currentStep;
    this.form          = this.checkout.form;
    this.errors        = this.checkout.errors;
    this.paymentMethod = this.checkout.paymentMethod;
    this.cartItems     = this.checkout.cartItems;
    this.subtotal      = this.checkout.subtotal;
    this.deliveryFee   = this.checkout.deliveryFee;
    this.total         = this.checkout.total;
    this.cartLoading   = this.checkout.cartLoading;
    this.cartError     = this.checkout.cartError;
    this.bank          = this.orderService.bankDetails;
  }

  ngOnInit(): void {}

  // ── Navigation
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

        this.cartService.clearCart().subscribe({
          next:  () => this.checkout.reset(),
          error: () => this.checkout.reset(),
        });

        window.scrollTo({ top: 0, behavior: 'smooth' });
      },
      error: (err) => {
        this.isSubmitting = false;
        this.submitError  =
          err?.error?.message     ??
          err?.error?.errors?.[0] ??
          'Something went wrong. Please try again.';
      },
    });
  }

}