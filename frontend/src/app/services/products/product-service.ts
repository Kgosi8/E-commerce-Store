import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs/internal/Observable';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private baseUrl = 'http://localhost:5000/api/products';

  constructor(private http: HttpClient) {}

  getProducts(): Observable<any> {
    return this.http.get<any>(this.baseUrl);
  }

  getProductById(id: string | null) {
    return this.http.get<any>(`${this.baseUrl}/${id}`);
  }

  createProduct(formData: FormData) {
    return this.http.post<any>(this.baseUrl, formData);
  }

  deleteProduct(id: string) {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }
}
