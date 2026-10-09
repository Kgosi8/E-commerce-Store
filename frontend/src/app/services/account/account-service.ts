import { Injectable, signal } from '@angular/core';
import { Order } from '../../interfaces/order';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/internal/operators/tap';
import { Observable } from 'rxjs';
import { User, UserResponse } from '../../interfaces/user';

export interface OrdersResponse {
  status: string;
  data: Order[];
}

export interface UpdateAddressPayload {
  address?: string;
  phoneNumber?: string;
}

@Injectable({
  providedIn: 'root',
})

export class AccountService {

  private readonly baseUrl = 'http://localhost:5000/api';
  readonly user= signal<User | null>(null);

  constructor(private http: HttpClient) { }

  getUser(): Observable<UserResponse> {

    return this.http.get<UserResponse>(`${this.baseUrl}/user`,{
      withCredentials: true,
    }).pipe(
      tap(res=> this.user.set(res.data))
    );
  }

  updateAddress(payload: UpdateAddressPayload): Observable<UserResponse> {
    return this.http.put<UserResponse>(`${this.baseUrl}/user/address`, payload, {
      withCredentials: true,
    }).pipe(
      tap(res => this.user.set(res.data))
    );
  }

  getOrders(): Observable<OrdersResponse> {
    return this.http.get<OrdersResponse>(`${this.baseUrl}/orders`, {
      withCredentials: true,
    });
  }

  logout(): Observable<any> {
    return this.http.post(`${this.baseUrl}/logout`, {}, {
      withCredentials: true,
    });
  }
}
