import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  computed,
  OnInit,
  signal,
} from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Product } from '../../../interfaces/product';
import { ProductService } from '../../../services/products/product-service';

interface TagFilter {
  label: string;
  value: string;
}

const ALL_TAGS: TagFilter[] = [
  { label: 'All', value: '' },
  { label: 'Men', value: 'Men' },
  { label: 'Women', value: 'Women' },
  { label: 'Kids', value: 'Kids' },
  { label: 'T-Shirts', value: 'T-Shirts' },
  { label: 'Pants', value: 'Pants' },
  { label: 'Hoodies', value: 'Hoodies' },
  { label: 'Caps', value: 'Caps' },
  { label: 'Beanies', value: 'Beanies' },
  { label: 'Slutchi', value: 'Slutchi' },
];

@Component({
  selector: 'app-products-page',
  imports: [CommonModule, RouterLink],
  templateUrl: './products-page.html',
  styleUrl: './products-page.css',
})
export class ProductsPage implements OnInit {
  allProducts = signal<Product[]>([]);
  isLoading = signal(true);
  error = signal<string | null>(null);
  activeTag = signal<string>('');
  searchQuery = signal<string>('');

  readonly tags = ALL_TAGS;

  readonly filteredProducts = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    const tag = this.activeTag();
    let list = this.allProducts();

    if (tag) {
      list = list.filter((p) => p.tags?.includes(tag));
    }
    if (q) {
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.tags?.some((t) => t.toLowerCase().includes(q)),
      );
    }
    return list;
  });

  constructor(
    private productService: ProductService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {

    this.route.queryParams.subscribe(params =>{
      if (params['tag']){
        this.activeTag.set(params['tag']);
      }
    })
    this.loadProducts();
  }

  loadProducts(): void {
    this.isLoading.set(true);
    this.productService.getProducts().subscribe({
      next: (res: any) => {
        const products = Array.isArray(res) ? res : (res.products ?? []);
        this.allProducts.set(products);
        this.isLoading.set(false);
        this.cdr.detectChanges();
      },
      error: () => {
        this.error.set('Failed to load products.');
        this.isLoading.set(false);
      },
    });
  }

  setTag(tag: string): void {
    this.activeTag.set(tag);
    this.searchQuery.set('');
  }

  onSearch(value: string): void {
    this.searchQuery.set(value);
    this.activeTag.set('');
  }

  clearFilters(): void {
    this.activeTag.set('');
    this.searchQuery.set('');
  }
}
