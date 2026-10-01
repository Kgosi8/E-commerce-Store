import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { Product, ProductListResponse } from '../../interfaces/product';

export interface ProductFilters {
  page?: number;
  limit?: number;
}

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private baseUrl = 'http://localhost:5000/api/products';

  constructor(private http: HttpClient) {}

  // Existing — get all products
  getProducts(filters: ProductFilters = {}): Observable<ProductListResponse> {
    const params: Record<string, string> = {};
    if (filters.page) params['page'] = String(filters.page);
    if (filters.limit) params['limit'] = String(filters.limit);
    return this.http.get<ProductListResponse>(this.baseUrl, { params });
  }

  // Get by tag — e.g. 'Men', 'Caps', 'Jackets'
  getByTag(tag: string, filters: ProductFilters = {}): Observable<ProductListResponse> {
    const params: Record<string, string> = {};
    if (filters.page) params['page'] = String(filters.page);
    if (filters.limit) params['limit'] = String(filters.limit);
    return this.http.get<ProductListResponse>(`${this.baseUrl}/tag/${encodeURIComponent(tag)}`, {
      params,
    });
  }

  // Get by category
  getByCategory(category: string, filters: ProductFilters = {}): Observable<ProductListResponse> {
    const params: Record<string, string> = {};
    if (filters.page) params['page'] = String(filters.page);
    if (filters.limit) params['limit'] = String(filters.limit);
    return this.http.get<ProductListResponse>(
      `${this.baseUrl}/category/${encodeURIComponent(category)}`,
      { params },
    );
  }

  // Search
  search(
    q: string,
    filters: ProductFilters & { tag?: string; category?: string } = {},
  ): Observable<ProductListResponse> {
    const params: Record<string, string> = { q };
    if (filters.tag) params['tag'] = filters.tag;
    if (filters.category) params['category'] = filters.category;
    if (filters.page) params['page'] = String(filters.page);
    if (filters.limit) params['limit'] = String(filters.limit);
    return this.http.get<ProductListResponse>(`${this.baseUrl}/search`, { params });
  }

  // Get single product
  getById(id: string): Observable<{ success: boolean; product: Product }> {
    return this.http.get<{ success: boolean; product: Product }>(`${this.baseUrl}/${id}`);
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
