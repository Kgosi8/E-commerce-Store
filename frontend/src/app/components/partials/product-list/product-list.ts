import { Component, OnInit, signal } from '@angular/core';
import { Product } from '../../../interfaces/product';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ProductService } from '../../../services/products/product-service';
import { ROUTE_TAG_MAP } from '../../../config/category-tags';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-product-list',
  imports: [CommonModule, RouterLink],
  templateUrl: './product-list.html',
  styleUrl: './product-list.css',
})
export class ProductList implements OnInit {

  products= signal<Product[]>([]);
  isLoading= signal<boolean>(true);
  error= signal<string | null>(null);
  pageTitle= signal<string>('');
  total= signal<number>(0);

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService
  ) {}

  ngOnInit(): void {

    this.route.url.subscribe(segments=>{
      const routePath= segments[0]?.path ?? '';
      const tag= ROUTE_TAG_MAP[routePath];

      if(tag){
        this.pageTitle.set(tag);
        this.loadByTag(tag);
      }
    });
  }

  loadByTag(tag: string): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.productService.getByTag(tag).subscribe({
      next: (res) => {
        this.products.set(res.products);
        this.total.set(res.total);
        this.isLoading.set(false);
      },
      error: () => {
        this.error.set(`Failed to load products for "${tag}".`);
        this.isLoading.set(false);
      }
    });
  }

}
