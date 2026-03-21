import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { CartResponse } from '../../interfaces/cart-response';
import { CartItem } from '../../interfaces/cart-item';

@Injectable({
  providedIn: 'root',
})
export class CartService {

  private baseUrl= 'http://localhost:5000/api/cart';

  //cart count observable for header updates

  private cartItemCount$ = new BehaviorSubject<number>(0);

  cartCount$ = this.cartItemCount$.asObservable();

  constructor(private http:HttpClient) { }

  //add product to cart

  addToCart(productId: string): Observable<CartResponse>{
    return this.http.post<CartResponse>(`${this.baseUrl}/add`,{ productId },{ withCredentials: true }).pipe(
      tap(response=> this.updateCount(response.cart.items))
    )
  }

  // Get cart
  getCart(): Observable<CartResponse> {
    return this.http.get<CartResponse>(
      this.baseUrl,
      { withCredentials: true }
    ).pipe(
      tap(response => this.updateCount(response.cart.items))
    );
  }

  // Update quantity
  updateQuantity(productId: string, quantity: number): Observable<CartResponse> {
    return this.http.put<CartResponse>(
      `${this.baseUrl}/update`,
      { productId, quantity },
      { withCredentials: true }
    ).pipe(
      tap(response => this.updateCount(response.cart.items))
    );
  }

  // Remove item
  removeFromCart(productId: string): Observable<CartResponse> {
    return this.http.delete<CartResponse>(
      `${this.baseUrl}/remove/${productId}`,
      { withCredentials: true }
    ).pipe(
      tap(response => this.updateCount(response.cart.items))
    );
  }

  // Clear cart
  clearCart(): Observable<CartResponse> {
    return this.http.delete<CartResponse>(
      `${this.baseUrl}/clear`,
      { withCredentials: true }
    );
  }

  // Keeps cart count badge in sync across the app
  private updateCount(items: CartItem[]): void {
    const total = items.reduce((sum, item) => sum + item.quantity, 0);
    this.cartItemCount$.next(total);
  }
  
}
