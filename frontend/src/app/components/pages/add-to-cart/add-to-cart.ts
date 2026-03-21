import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { AsyncPipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ProductService } from '../../../services/products/product-service';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Product } from '../../../interfaces/product';
import { CartService } from '../../../services/cart/cart-service';

@Component({
  selector: 'app-add-to-cart',
  imports: [AsyncPipe], // 👈 add AsyncPipe to imports
  templateUrl: './add-to-cart.html',
  styleUrl: './add-to-cart.css',
})
export class AddToCart implements OnInit {
  product$!: Observable<Product>;
  activeIndex = 0;
  imageCount = 0;

  //UI state

  isAdding = false; // disables button while request is in flight
  addedToCart = false; // shows success feedback
  errorMessage = ''; // shows error if something goes wrong

  constructor(
    private route: ActivatedRoute,
    private productServices: ProductService,
    private cartService: CartService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    this.product$ = this.productServices.getProductById(id).pipe(
      map((response) => response.data),
      tap((product) => {
        this.imageCount = product?.images?.length ?? 0;
      }),
    );
  }

  addToCart(productId: string) {
    this.isAdding = true;
    this.errorMessage = '';
    this.addedToCart = false;

    this.cartService.addToCart(productId).subscribe({
      next: () => {
        this.isAdding = false;
        this.addedToCart = true;
        this.cdr.detectChanges();

        // Reset button back to normal after 2.5 seconds
        setTimeout(() => {
          this.addedToCart = false;
          this.cdr.detectChanges();
        }, 2500);
      },
      error: (err) => {
        this.isAdding = false;
        this.errorMessage =
          err.status === 401
            ? 'Please log in to add items to your cart.'
            : 'Something went wrong. Please try again.';
        this.cdr.detectChanges();
      },
    });
  }

  goToSlide(index: number) {
    this.activeIndex = index;
  }

  next() {
    if (this.activeIndex < this.imageCount - 1) {
      this.activeIndex++;
    }
  }

  prev() {
    if (this.activeIndex > 0) {
      this.activeIndex--;
    }
  }
}
