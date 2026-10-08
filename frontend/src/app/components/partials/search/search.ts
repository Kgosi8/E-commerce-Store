import { Component, OnInit, signal } from '@angular/core';
import { Product } from '../../../interfaces/product';
import { ProductService } from '../../../services/products/product-service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-search',
  imports: [RouterLink, CommonModule],
  templateUrl: './search.html',
  styleUrl: './search.css',
})
export class Search implements OnInit {

  products= signal<Product[]>([]);
  isLoading= signal<boolean>(false);
  error= signal<string | null>(null);
  query= signal<string>('');
  total= signal<number>(0);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService
  ) {}

  ngOnInit(): void {

    this.route.queryParams.subscribe(params=>{
      const q = params['q']?.trim() ?? '';
      this.query.set(q);
      if(q){
        this.search(q);
      }else{
        this.products.set([]);
        this.total.set(0);
      }
    });
  }

  search(q: string): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.productService.search(q).subscribe({
      next: (res) => {
        this.products.set(res.products);
        this.total.set(res.total);
        this.isLoading.set(false);
      },
      error: () => {
        this.error.set('Seach failed. Please try again.');
        this.isLoading.set(false);
      }
    });
  }
}
