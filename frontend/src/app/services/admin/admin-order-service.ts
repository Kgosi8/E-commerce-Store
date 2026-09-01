import { Injectable } from '@angular/core';
import { Order, OrderStatus, PaymentStatus } from '../../interfaces/order';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ListOrdersResponse } from '../../interfaces/list-orders-response';

export interface OrderFilters {
  status?: OrderStatus | '';
  paymentMethod?: 'eft' | 'cod' | '';
  page?: number;
  limit?: number;
}

export interface UpdateStatusPayload {
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
}

@Injectable({
  providedIn: 'root',
})
export class AdminOrderService {
  private readonly baseUrl = 'http://localhost:5000/api/orders';

  constructor(private http: HttpClient) {}

  getOrders(filters: OrderFilters = {}): Observable<ListOrdersResponse> {
    const params: Record<string, string> = {};
    if (filters.status) params['status'] = filters.status;
    if (filters.paymentMethod) params['paymentMethod'] = filters.paymentMethod;
    if (filters.page) params['page'] = String(filters.page);
    if (filters.limit) params['limit'] = String(filters.limit);

    return this.http.get<ListOrdersResponse>(this.baseUrl, { params });
  }

  getOrder(orderId: string): Observable<{ success: boolean; order: Order }> {
    return this.http.get<{ success: boolean; order: Order }>(`${this.baseUrl}/${orderId}`);
  }

  updateStatus(
    orderId: string,
    payload: UpdateStatusPayload,
  ): Observable<{ success: boolean; order: Order }> {
    return this.http.patch<{ success: boolean; order: Order }>(
      `${this.baseUrl}/${orderId}/status`,
      payload,
    );
  }
}
