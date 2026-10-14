import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '../../../interfaces/user';
import { Order } from '../../../interfaces/order';
import { AccountService } from '../../../services/account/account-service';
import { PopUpload } from '../pop-upload/pop-upload';


type ActiveTab = 'overview' | 'orders' | 'address' | 'returns';

@Component({
  selector: 'account-details',
  imports: [CommonModule,PopUpload],
  templateUrl: './account-details.html',
  styleUrl: './account-details.css',
})
export class AccountDetails implements OnInit {
  // ----- State

  activeTab = signal<ActiveTab>('overview');
  user = signal<User | null>(null);
  orders = signal<Order[]>([]);
  isLoadingUser = signal<boolean>(true);
  isLoadingOrders = signal<boolean>(false);
  isSaving = signal<boolean>(false);
  saveSuccess = signal<boolean>(false);
  saveError = signal<string | null>(null);
  ordersError = signal<string | null>(null);

  popOpenOrderId = signal<string | null>(null);

  // ---- Address form

  addressForm = {
    address: '',
    phoneNumber: '',
  };

  constructor(
    private accountService: AccountService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.loadUser();
  }

  //--- load user --------------

  loadUser(): void {
    // Use cached user if available
    const cached = this.accountService.user();
    if (cached) {
      this.user.set(cached);
      this.addressForm.address = cached.address ?? '';
      this.addressForm.phoneNumber = cached.phoneNumber ?? '';
      this.isLoadingUser.set(false);
      return;
    }

    this.accountService.getUser().subscribe({
      next: (res) => {
        this.user.set(res.data);
        this.addressForm.address = res.data.address ?? '';
        this.addressForm.phoneNumber = res.data.phoneNumber ?? '';
        this.isLoadingUser.set(false);
      },
      error: () => this.isLoadingUser.set(false),
    });
  }

  //--- Tab switching--------

  setTab(tab: ActiveTab): void {
    this.activeTab.set(tab);
    if (tab === 'orders' && this.orders().length === 0) {
      this.loadOrders();
    }
  }

  //--- load orders -----------

  loadOrders(): void {
    this.isLoadingOrders.set(true);
    this.ordersError.set(null);

    this.accountService.getOrders().subscribe({
      next: (res) => {
        this.orders.set(res.data);
        this.isLoadingOrders.set(false);
      },
      error: () => {
        this.ordersError.set('Failed to load orders. Please try again later.');
        this.isLoadingOrders.set(false);
      },
    });
  }

  // --- Toggle POP upload panel for a specific order

  togglePOP(orderId: string): void{
    this.popOpenOrderId.update(id => id=== orderId? null : orderId);
  }

  // --- update address -----------

  saveAddress(): void {
    if (this.isSaving()) return;
    this.isSaving.set(true);
    this.saveSuccess.set(false);
    this.saveError.set(null);

    this.accountService.updateAddress(this.addressForm).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.saveSuccess.set(true);
        setTimeout(() => this.saveSuccess.set(false), 3000);
      },
      error: () => {
        this.isSaving.set(false);
        this.saveError.set('Failed to save address. Please try again later.');
      },
    });
  }

  // --- logout ----------------

  logout(): void {
    this.accountService.logout().subscribe({
      next: () => this.router.navigate(['/login']),
      error: () => this.router.navigate(['/login']),
    });
  }

  // --- Helpers ----------------

  statusLabel(status: string): string {
    return status.replace(/_/g, ' ');
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-ZA', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }
}
