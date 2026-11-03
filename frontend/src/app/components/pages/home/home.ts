import { ChangeDetectorRef, Component, inject, input, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ProductService } from '../../../services/products/product-service';
import { Product } from '../../../interfaces/product';
import { CloudinaryService } from '../../../services/cloudinary/cloudinary-service';
import { HOME_SECTIONS, Showcase } from '../../../interfaces/home-sections';

export interface VenueImage {
  src: string;
  alt: string;
  ratio: number;
}

@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterLink,],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  private productService = inject(ProductService);
  private router = inject(Router);
  private cloudinary = inject(CloudinaryService);

  // ── Hero + Shop Her/Him images
  readonly heroImage = signal(this.cloudinary.hero('models/model-8'));
  readonly ofentseImage = signal(this.cloudinary.hero('banners/ofentse'));
  readonly danzaImage = signal(this.cloudinary.hero('banners/daniel'));

  // ── Sections come from the config file
  readonly sections: Showcase[] = HOME_SECTIONS;

  // undefined = still loading, [] = loaded but empty
  readonly rows = signal<Record<string, Product[]>>({});

  readonly skeletons = [1, 2, 3, 4, 5];

  ngOnInit(): void {
    for (const s of this.sections) {
      this.productService.getByTag(s.tag, { limit: 12 }).subscribe({
        next: (res) => this.rows.update((r) => ({ ...r, [s.key]: res.products ?? [] })),
        error: () => this.rows.update((r) => ({ ...r, [s.key]: [] })),
      });
    }
  }

  bannerUrl(publicId: string): string {
    return this.cloudinary.hero(publicId);
  }

  scrollRow(track: HTMLElement, direction: 1 | -1): void {
    track.scrollBy({ left: direction * track.clientWidth * 0.8, behavior: 'smooth' });
  }

  openTag(tag: string): void {
    this.router.navigate(['/products'], { queryParams: { tag } });
  }

  shopBy(gender: string): void {
    this.openTag(gender);
  }
}
