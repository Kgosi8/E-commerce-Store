import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs/internal/Observable';

@Injectable({
  providedIn: 'root',
})
export class ProductService {

  private baseUrl = 'http://localhost:5000/api/products';

  constructor(private http: HttpClient) { }

  getProducts() :Observable<any> {
    return this.http.get<any>(this.baseUrl).pipe(
      map(response => response.data)
    );
  }

  getProductById(id: string | null) {
  return this.http.get<any>(`${this.baseUrl}/${id}`);
}
  
}
