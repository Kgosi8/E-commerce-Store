import { Component, computed, OnInit, signal } from '@angular/core';
import { Order, OrderStatus, PaymentStatus } from '../../../interfaces/order';
import { AdminOrderService, OrderFilters } from '../../../services/admin/admin-order-service';
import { Router } from '@angular/router';
import { DecimalPipe } from '@angular/common';

type FilterStatus = OrderStatus | '';
type FilterPaymentMethod = 'eft' | 'cod' | '';

const ORDER_STATUSES: OrderStatus[] = [
  'pending',
  'confirmed',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
];

const PAYMENT_STATUSES: PaymentStatus[] = ['awaiting_payment', 'paid', 'failed'];

@Component({
  selector: 'app-admin-orders',
  imports: [DecimalPipe],
  templateUrl: './admin-orders.html',
  styleUrl: './admin-orders.css',
})
export class AdminOrders implements OnInit {
  // ── List state
  orders = signal<Order[]>([]);
  totalOrders = signal<number>(0);
  currentPage = signal<number>(1);
  totalPages = signal<number>(1);
  isLoading = signal<boolean>(true);
  listError = signal<string | null>(null);

  // ── Filters
  filterStatus = signal<FilterStatus>('');
  filterPaymentMethod = signal<FilterPaymentMethod>('');

  // ── Detail / drawer state
  selectedOrder = signal<Order | null>(null);
  drawerOpen = signal<boolean>(false);
  detailLoading = signal<boolean>(false);
  detailError = signal<string | null>(null);

  // ── Update state
  isUpdating = signal<boolean>(false);
  updateError = signal<string | null>(null);
  updateSuccess = signal<boolean>(false);

  // ── Expose constants to template
  readonly orderStatuses = ORDER_STATUSES;
  readonly paymentStatuses = PAYMENT_STATUSES;
  readonly pageLimit = 15;

  // ── Computed summary counts
  readonly pendingCount = computed(
    () => this.orders().filter((o) => o.status === 'pending').length,
  );
  readonly awaitingPaymentCount = computed(
    () => this.orders().filter((o) => o.paymentStatus === 'awaiting_payment').length,
  );

  constructor(
    private adminOrderService: AdminOrderService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  // ── Load orders ─────────────────────────────────────────────────
  loadOrders(): void {
    this.isLoading.set(true);
    this.listError.set(null);

    const filters: OrderFilters = {
      page: this.currentPage(),
      limit: this.pageLimit,
    };
    if (this.filterStatus()) filters.status = this.filterStatus() as OrderStatus;
    if (this.filterPaymentMethod())
      filters.paymentMethod = this.filterPaymentMethod() as 'eft' | 'cod';

    this.adminOrderService.getOrders(filters).subscribe({
      next: (res) => {
        this.orders.set(res.orders);
        this.totalOrders.set(res.total);
        this.totalPages.set(res.pages);
        this.isLoading.set(false);
      },
      error: () => {
        this.listError.set('Failed to load orders. Please try again.');
        this.isLoading.set(false);
      },
    });
  }

  // ── Filters ─────────────────────────────────────────────────────
  setStatusFilter(value: FilterStatus): void {
    this.filterStatus.set(value);
    this.currentPage.set(1);
    this.loadOrders();
  }

  setPaymentMethodFilter(value: FilterPaymentMethod): void {
    this.filterPaymentMethod.set(value);
    this.currentPage.set(1);
    this.loadOrders();
  }

  // ── Pagination ──────────────────────────────────────────────────
  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages()) return;
    this.currentPage.set(page);
    this.loadOrders();
  }

  // ── Order detail drawer ─────────────────────────────────────────
  openOrder(order: Order): void {
    this.selectedOrder.set(order);
    this.drawerOpen.set(true);
    this.updateError.set(null);
    this.updateSuccess.set(false);
  }

  closeDrawer(): void {
    this.drawerOpen.set(false);
    this.selectedOrder.set(null);
  }

  // ── Update status ───────────────────────────────────────────────
  updateOrderStatus(orderId: string, status: OrderStatus): void {
    this.isUpdating.set(true);
    this.updateError.set(null);
    this.updateSuccess.set(false);

    this.adminOrderService.updateStatus(orderId, { status }).subscribe({
      next: (res) => {
        // Update in the list in-place
        this.orders.update((list) =>
          list.map((o) => (o.orderId === orderId ? { ...o, status: res.order.status } : o)),
        );
        // Update the open drawer
        this.selectedOrder.set(res.order);
        this.isUpdating.set(false);
        this.updateSuccess.set(true);
        setTimeout(() => this.updateSuccess.set(false), 2500);
      },
      error: () => {
        this.updateError.set('Failed to update status. Please try again.');
        this.isUpdating.set(false);
      },
    });
  }

  updatePaymentStatus(orderId: string, paymentStatus: PaymentStatus): void {
    this.isUpdating.set(true);
    this.updateError.set(null);
    this.updateSuccess.set(false);

    this.adminOrderService.updateStatus(orderId, { paymentStatus }).subscribe({
      next: (res) => {
        this.orders.update((list) =>
          list.map((o) =>
            o.orderId === orderId ? { ...o, paymentStatus: res.order.paymentStatus } : o,
          ),
        );
        this.selectedOrder.set(res.order);
        this.isUpdating.set(false);
        this.updateSuccess.set(true);
        setTimeout(() => this.updateSuccess.set(false), 2500);
      },
      error: () => {
        this.updateError.set('Failed to update payment status. Please try again.');
        this.isUpdating.set(false);
      },
    });
  }

  // ── Helpers ─────────────────────────────────────────────────────
  statusLabel(status: string): string {
    return status.replace(/_/g, ' ');
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-ZA', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }

  formatTime(dateStr: string): string {
    return new Date(dateStr).toLocaleTimeString('en-ZA', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}
