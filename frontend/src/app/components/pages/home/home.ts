import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { ProductService } from '../../../services/products/product-service';

@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {

  products: any[] = [];

  constructor(private productService: ProductService, private router: Router) {
  }
  ngOnInit(): void {
    this.loadProducts();

    // Detect when the route is re-visited and reload products
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        if (this.router.url === '/home') {
          this.loadProducts();
        }
      }
    });
  }

  loadProducts(): void {
    this.productService.getProducts().subscribe((products) => {
      console.log('Products:', products);
      this.products = products;
    });
  }

}
