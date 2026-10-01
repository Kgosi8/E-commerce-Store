import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { ProductService } from '../../../services/products/product-service';
import { Product } from '../../../interfaces/product';

@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  products: Product[] = [];
  isLoading = true;
  error: string | null = null;

  constructor(
    private productService: ProductService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.productService.getProducts().subscribe({
      next: (res) => {
        this.products = res.products;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = 'Failed to load products. Please try again later.';
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  loadByTag(tag: string): void {
    this.isLoading = true;
    this.productService.getByTag(tag).subscribe({
      next: (res) => {
        this.products = res.products;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = `Failed to load products for "${tag}".`;
        this.isLoading = false;
      },
    });
  }

  productName(product: string) {
    console.log(product);
  }
}
