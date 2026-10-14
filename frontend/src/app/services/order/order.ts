import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {Observable} from 'rxjs';
import {
  CreateOrderPayload,
  CreateOrderResponse,
  Order,
  BankDetails,
} from '../../interfaces/order';

@Injectable({
  providedIn: 'root',
})
export class OrderService {

  private baseUrl = 'http://localhost:5000/api/orders';

  readonly bankDetails: BankDetails = {
    bankName: 'Capitec Bank',
    accountNumber: '18 2086 3604',
    branchCode: '470 010',
    accountType: 'Savings / Current',
  };

  constructor(private http: HttpClient) {}

  createOrder(payload: CreateOrderPayload): Observable<CreateOrderResponse> {
    return this.http.post<CreateOrderResponse>(this.baseUrl, payload);
  }

  getOrderById(orderId: string): Observable<Order> {
    return this.http.get<Order>(`${this.baseUrl}/${orderId}`);
  }
  
}
