import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Route, Router } from '@angular/router';


// ── Interfaces ──────────────────────────────────────────────
export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}
 
export interface CheckoutForm {
  // Delivery
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  note: string;
  // Payment — Card
  cardName: string;
  cardNumber: string;
  expiry: string;
  cvv: string;
}

export interface BankDetails {
  bankName: string;
  accountNumber: string;
  branchCode: string;
  accountType: string;
}

export const BANK_DETAILS: BankDetails = {
  bankName: 'First National Bank',
  accountNumber: '62 4401 8820',
  branchCode: '250 655',
  accountType: 'Cheque / Current',
};


@Component({
  selector: 'app-checkout',
  imports: [FormsModule],
  templateUrl: './checkout.html',
  styleUrl: './checkout.css',
})


export class Checkout implements OnInit {
 
  // ── State ──────────────────────────────────────────────────
  currentStep = 1;
  paymentMethod: 'card' | 'eft' | 'cod'|''='';
  agreedToTerms = false;
  isPlacingOrder = false;
  orderPlaced = false;
  orderRef = '';
 
  errors: Record<string, string> = {};
  bank=BANK_DETAILS;
 
  // ── Cart Items (replace with your CartService injection) ───
  cartItems: CartItem[] = [
    {
      productId: '1',
      name: 'Sample Product A',
      price: 299.99,
      quantity: 2,
      image: 'https://placehold.co/100x100/f5ede0/1a1814?text=A',
    },
    {
      productId: '2',
      name: 'Sample Product B',
      price: 149.50,
      quantity: 1,
      image: 'https://placehold.co/100x100/f5ede0/1a1814?text=B',
    },
  ];
 
  // ── Form Model ─────────────────────────────────────────────
  checkoutForm: CheckoutForm = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    province: '',
    postalCode: '',
    note: '',
    cardName: '',
    cardNumber: '',
    expiry: '',
    cvv: '',
  };
 
  // ── Constructor ────────────────────────────────────────────
  constructor(private router: Router) {}
 
  // ── Lifecycle ──────────────────────────────────────────────
  ngOnInit(): void {
    // If you have a CartService, load items here:
    // this.cartService.getItems().subscribe(items => this.cartItems = items);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
 
  // ── Navigation ─────────────────────────────────────────────
  goBack(): void {
    this.router.navigate(['/cart']);
  }
 
  continueShopping(): void {
    this.router.navigate(['/']);
  }
 
  goToStep(step: number): void {
    if (step === 2 && !this.validateDelivery()) return;
    if (step === 3 && !this.validatePayment()) return;
    this.currentStep = step;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
 
  // ── Totals ─────────────────────────────────────────────────
  getTotalItems(): number {
    return this.cartItems.reduce((sum, item) => sum + item.quantity, 0);
  }
 
  getSubtotal(item: CartItem): number {
    return item.price * item.quantity;
  }
 
  getOrderTotal(): number {
    return this.cartItems.reduce((sum, item) => sum + this.getSubtotal(item), 0);
  }
 
  getDeliveryFee(): number {
    return this.getOrderTotal() >= 500 ? 0 : 50;
  }
 
  getFinalTotal(): number {
    return this.getOrderTotal() + this.getDeliveryFee();
  }
 
  // ── Card Type Detection ─────────────────────────────────────
  getCardType(): 'visa' | 'mastercard' | null {
    const num = this.checkoutForm.cardNumber.replace(/\s/g, '');
    if (/^4/.test(num)) return 'visa';
    if (/^5[1-5]/.test(num) || /^2[2-7]/.test(num)) return 'mastercard';
    return null;
  }
 
  // ── Validation ─────────────────────────────────────────────
  private validateDelivery(): boolean {
    const f = this.checkoutForm;
    this.errors = {};
 
    if (!f.firstName.trim())
      this.errors['firstName'] = 'First name is required.';
 
    if (!f.lastName.trim())
      this.errors['lastName'] = 'Last name is required.';
 
    if (!f.email.trim())
      this.errors['email'] = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email))
      this.errors['email'] = 'Please enter a valid email.';
 
    if (!f.phone.trim())
      this.errors['phone'] = 'Phone number is required.';
    else if (!/^[\d\s\+\-\(\)]{7,15}$/.test(f.phone))
      this.errors['phone'] = 'Please enter a valid phone number.';
 
    if (!f.address.trim())
      this.errors['address'] = 'Street address is required.';
 
    if (!f.city.trim())
      this.errors['city'] = 'City is required.';
 
    if (!f.province)
      this.errors['province'] = 'Please select a province.';
 
    if (!f.postalCode.trim())
      this.errors['postalCode'] = 'Postal code is required.';
    else if (!/^\d{4}$/.test(f.postalCode.trim()))
      this.errors['postalCode'] = 'Enter a valid 4-digit postal code.';
 
    return Object.keys(this.errors).length === 0;
  }
 
  private validatePayment(): boolean {
    this.errors = {};
 
    if (this.paymentMethod === 'card') {
      const f = this.checkoutForm;
 
      if (!f.cardName.trim())
        this.errors['cardName'] = 'Name on card is required.';
 
      const rawCard = f.cardNumber.replace(/\s/g, '');
      if (!rawCard)
        this.errors['cardNumber'] = 'Card number is required.';
      else if (!/^\d{16}$/.test(rawCard))
        this.errors['cardNumber'] = 'Enter a valid 16-digit card number.';
 
      if (!f.expiry.trim())
        this.errors['expiry'] = 'Expiry date is required.';
      else if (!this.isValidExpiry(f.expiry))
        this.errors['expiry'] = 'Enter a valid expiry (MM / YY).';
 
      if (!f.cvv.trim())
        this.errors['cvv'] = 'CVV is required.';
      else if (!/^\d{3,4}$/.test(f.cvv))
        this.errors['cvv'] = 'Enter a valid 3 or 4 digit CVV.';
    }
 
    // EFT and Payflex need no form validation
    return Object.keys(this.errors).length === 0;
  }
 
  private validateConfirm(): boolean {
    this.errors = {};
    if (!this.agreedToTerms)
      this.errors['terms'] = 'Please agree to the Terms & Conditions.';
    return Object.keys(this.errors).length === 0;
  }
 
  private isValidExpiry(value: string): boolean {
    const match = value.replace(/\s/g, '').match(/^(\d{2})\/(\d{2})$/);
    if (!match) return false;
    const month = parseInt(match[1], 10);
    const year = parseInt('20' + match[2], 10);
    if (month < 1 || month > 12) return false;
    const now = new Date();
    const expiry = new Date(year, month - 1, 1);
    return expiry >= new Date(now.getFullYear(), now.getMonth(), 1);
  }
 
  // ── Place Order ─────────────────────────────────────────────
  placeOrder(): void {
    if (!this.validateConfirm()) return;
 
    this.isPlacingOrder = true;
 
    // Simulate API call — replace with your OrderService call
    setTimeout(() => {
      this.isPlacingOrder = false;
      this.orderPlaced = true;
      this.orderRef = this.generateOrderRef();
 
      // Optionally clear the cart via CartService:
      // this.cartService.clearCart();
 
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 2000);
  }
 
  // ── Helpers ─────────────────────────────────────────────────
  private generateOrderRef(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    return Array.from({ length: 8 }, () =>
      chars[Math.floor(Math.random() * chars.length)]
    ).join('');
  }
 
  // Format card number with spaces as user types: 1234 5678 9012 3456
  formatCardNumber(event: Event): void {
    const input = event.target as HTMLInputElement;
    const raw = input.value.replace(/\D/g, '').substring(0, 16);
    this.checkoutForm.cardNumber = raw.replace(/(.{4})/g, '$1 ').trim();
  }
 
  // Format expiry as MM / YY
  formatExpiry(event: Event): void {
    const input = event.target as HTMLInputElement;
    const raw = input.value.replace(/\D/g, '').substring(0, 4);
    if (raw.length >= 3) {
      this.checkoutForm.expiry = raw.substring(0, 2) + ' / ' + raw.substring(2);
    } else {
      this.checkoutForm.expiry = raw;
    }
  }
}
