import { computed, Injectable, signal } from '@angular/core';
import { CartItem } from '../../interfaces/cart-item';
import { CheckoutForm, CheckoutValidationErrors } from '../../interfaces/checkout';
import { sign } from 'crypto';
import { PaymentMethod } from '../../interfaces/order';


const DELIVERY_FEE = 80; // Fixed delivery fee

const EMPTY_FORM: CheckoutForm = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  province: '',
  postalCode: '',
  note: '',
};

@Injectable({
  providedIn: 'root',
})
export class CheckoutService {

  readonly currentStep= signal<number>(1);

  readonly form= signal<CheckoutForm>({ ...EMPTY_FORM });
  readonly errors=signal<CheckoutValidationErrors>({});

  readonly paymentMethod= signal<PaymentMethod |''>('');

  // ── Cart
  // TODO: replace with your real CartService items signal
  readonly cartItems = signal<CartItem[]>([
    { productId: 'p1', name: 'Product A', price: 450, quantity: 1 },
    { productId: 'p2', name: 'Product B', price: 280, quantity: 2 },
  ]);

  // ── Computed totals
  readonly subtotal    = computed(() =>
    this.cartItems().reduce((sum, i) => sum + i.price * i.quantity, 0)
  );
  readonly deliveryFee = signal<number>(DELIVERY_FEE);
  readonly total       = computed(() => this.subtotal() + this.deliveryFee());

  // ── Navigation
  goToStep(step: number): void {
    if (step === 2 && !this.validateStep1()) return;
    if (step === 3 && !this.validateStep2()) return;
    this.currentStep.set(step);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ── Validation
  validateStep1(): boolean {
    const errs: CheckoutValidationErrors = {};
    const f = this.form();

    if (!f.firstName.trim())  errs['firstName']  = 'First name is required';
    if (!f.lastName.trim())   errs['lastName']   = 'Last name is required';
    if (!f.email.trim())      errs['email']      = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email))
                              errs['email']      = 'Enter a valid email';
    if (!f.phone.trim())      errs['phone']      = 'Phone number is required';
    if (!f.address.trim())    errs['address']    = 'Address is required';
    if (!f.city.trim())       errs['city']       = 'City is required';
    if (!f.province)          errs['province']   = 'Province is required';
    if (!f.postalCode.trim()) errs['postalCode'] = 'Postal code is required';
    else if (!/^\d{4}$/.test(f.postalCode))
                              errs['postalCode'] = 'Enter a valid 4-digit postal code';

    this.errors.set(errs);
    return Object.keys(errs).length === 0;
  }

  validateStep2(): boolean {
    if (!this.paymentMethod()) {
      this.errors.set({ paymentMethod: 'Please select a payment method' });
      return false;
    }
    this.errors.set({});
    return true;
  }

  // ── Build order payload
  buildOrderPayload() {
    const f = this.form();
    return {
      customer: {
        firstName:  f.firstName,
        lastName:   f.lastName,
        email:      f.email,
        phone:      f.phone,
        address:    f.address,
        city:       f.city,
        province:   f.province,
        postalCode: f.postalCode,
        note:       f.note,
      },
      items: this.cartItems().map(i => ({
        productId: i.productId,
        name:      i.name,
        price:     i.price,
        quantity:  i.quantity,
        image:     i.image,
      })),
      paymentMethod: this.paymentMethod() as PaymentMethod,
    };
  }

  // ── Reset after successful order
  reset(): void {
    this.currentStep.set(1);
    this.form.set({ ...EMPTY_FORM });
    this.errors.set({});
    this.paymentMethod.set('');
    this.cartItems.set([]);
    // TODO: call your real CartService.clearCart() here
  }

  // ── Field updater helper (used in template via event binding)
  updateField(field: keyof CheckoutForm, value: string): void {
    this.form.update(f => ({ ...f, [field]: value }));
  }

  
}
