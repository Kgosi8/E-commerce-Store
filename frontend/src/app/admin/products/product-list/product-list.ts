import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Product } from '../../../interfaces/product';
import { ProductService } from '../../../services/products/product-service';

@Component({
  selector: 'app-product-list',
  imports: [CommonModule, RouterLink],
  templateUrl: './product-list.html',
  styleUrl: './product-list.css',
})
export class ProductList implements OnInit {

  products    = signal<Product[]>([]);
  isLoading   = signal(true);
  error       = signal<string | null>(null);
  deletingId  = signal<string | null>(null);
  deleteError = signal<string | null>(null);

  constructor(private productService: ProductService){}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.isLoading.set(true);
    this.productService.getProducts().subscribe({
      next: (res) => {
        this.products.set(res.products);
        this.isLoading.set(false);
      },
      error: () => {
        this.error.set('Failed to load products.');
        this.isLoading.set(false);
      },
    });
  }

  deleteProduct(id: string, name: string): void {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;

    this.deletingId.set(id);
    this.deleteError.set(null);

    this.productService.deleteProduct(id).subscribe({
      next: () => {
        this.products.update(list => list.filter(p => p._id !== id));
        this.deletingId.set(null);
      },
      error: () => {
        this.deleteError.set('Failed to delete product. Please try again.');
        this.deletingId.set(null);
      },
    });
  }

  formatCurrency(amount: number): string {
    return `R ${Number(amount).toFixed(2)}`;
  }

}
