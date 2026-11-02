import { ChangeDetectorRef, Component, inject, input, OnInit, signal } from '@angular/core';
import { CommonModule} from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ProductService } from '../../../services/products/product-service';
import { Product } from '../../../interfaces/product';
import { CloudinaryService } from '../../../services/cloudinary/cloudinary-service';
import { CloudinaryPipe } from '../../../core/pipe/cloudinary-pipe-pipe';

export interface VenueImage{
  src: string;
  alt: string;
  ratio: number;
}


@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterLink,CloudinaryPipe],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  products: Product[] = [];
  isLoading = true;
  error: string | null = null;

  private readonly cloudinary = inject(CloudinaryService)

  
  readonly heroImage = signal(this.cloudinary.hero('models/model-8'));
  readonly logoImage = signal(this.cloudinary.logo('logos/logo_white_bg'));
  readonly ofentseImage=signal(this.cloudinary.hero('banners/ofentse'));
  readonly danzaImage = signal(this.cloudinary.hero('banners/daniel'));

  constructor(
    private productService: ProductService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {
    
  }

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
      error: () => {
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

  // readonly images = signal([
  //   { src: this.cloudinary.hero('models/ofentse'), alt: 'Shop Her'  },
  //   { src: this.cloudinary.hero('models/danza'),   alt: 'Shop Him'  },
  // ]);

  shopBy(gender:string): void{
    this.router.navigate(['/products'], {queryParams: {tag: gender}});
  }

  productName(product: string) {
    console.log(product);
  }
}
