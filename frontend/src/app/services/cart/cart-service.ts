import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CartService {

  private baseUrl= 'http://localhost:5000/api/cart';

  //cart count observable for header updates

  private cartCount = new BehaviorSubject<number>(0);

  cartCount$ = this.cartCount.asObservable();

  constructor(private http:HttpClient) { }

  //add product to cart

  addToCart(productId: string){
    return this.http.post<any>(`${this.baseUrl}/add`,{ productId },{ withCredentials: true })
  }

  //fetch cart

  getCart(){
    return this.http.get<any>(`${this.baseUrl}`,{ withCredentials: true });
  }

  //update cart count

  setCartCount(count: number){
    this.cartCount.next(count);
  }

  //remove cart product

  removeFromCart(productId: string){
    return this.http.delete<any>(`${this.baseUrl}/remove/${productId}`,{ withCredentials: true });
  }

  //Update cart product quantity

  updateCartItem(productId: string, quantity: number){
    return this.http.put<any>(`${this.baseUrl}/update`, { productId, quantity },{ withCredentials: true });
  }

  //CALCULATE CART COUNT FROM CART ITEMS

  calculateCartCount(cartItems: any[]) {
    const total= cartItems.reduce((sum, item) => sum + item.quantity, 0);
    this.setCartCount(total);
  }

  
}
