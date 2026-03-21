import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CartItem } from '../../../interfaces/cart-item';
import { CartService } from '../../../services/cart/cart-service';
import { Router } from '@angular/router';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-cart',
  imports: [DecimalPipe],
  templateUrl: './cart.html',
  styleUrl: './cart.css',
})
export class Cart implements OnInit {
  cartItems: CartItem[] = [];
  isLoading = true;
  errorMessage = '';
  removingItemId: string | null = null; // tracks which item is being removed
  updatingItemId: string | null = null; // tracks which item quantity is updating

  constructor(
    private cartService: CartService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.loadCart();
  }

  loadCart() {
    this.isLoading = true;
    this.cartService.getCart().subscribe({
      next: (response) => {
        this.cartItems = response.cart.items;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage =
          err.status === 401
            ? 'Please log in to view your cart.'
            : 'Failed to load cart. Please try again.';
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  // ── Quantity Controls ──
  increaseQuantity(item: CartItem) {
    this.updatingItemId = item.productId;
    this.cartService.updateQuantity(item.productId, item.quantity + 1).subscribe({
      next: (response) => {
        this.cartItems = response.cart.items;
        this.updatingItemId = null;
        this.cdr.detectChanges();
      },
      error: () => {
        this.updatingItemId = null;
        this.cdr.detectChanges();
      },
    });
  }

  decreaseQuantity(item: CartItem) {
    if (item.quantity === 1) {
      // If quantity is 1 and user decreases, remove the item instead
      this.removeItem(item.productId);
      return;
    }
    this.updatingItemId = item.productId;
    this.cartService.updateQuantity(item.productId, item.quantity - 1).subscribe({
      next: (response) => {
        this.cartItems = response.cart.items;
        this.updatingItemId = null;
        this.cdr.detectChanges();
      },
      error: () => {
        this.updatingItemId = null;
        this.cdr.detectChanges();
      },
    });
  }

  // ── Remove Item ──
  removeItem(productId: string) {
    this.removingItemId = productId;
    this.cartService.removeFromCart(productId).subscribe({
      next: (response) => {
        this.cartItems = response.cart.items;
        this.removingItemId = null;
        this.cdr.detectChanges();
      },
      error: () => {
        this.removingItemId = null;
        this.cdr.detectChanges();
      },
    });
  }

  // ── Computed Totals ──
  getSubtotal(item: CartItem): number {
    return item.price * item.quantity;
  }

  getOrderTotal(): number {
    return this.cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  }

  getTotalItems(): number {
    return this.cartItems.reduce((sum, item) => sum + item.quantity, 0);
  }

  // ── Navigation ──
  continueShopping() {
    this.router.navigate(['/products']);
  }

  proceedToCheckout() {
    // Wire up once checkout route is ready
    this.router.navigate(['/checkout']);
  }
}
