import { ChangeDetectorRef, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../../services/products/product-service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-dashboard',
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css',
})
export class AdminDashboard {
  // ── Available tags — matches your nav and search
 availableTags = [
    'Men', 'Women', 'Kids', 'New & Featured',
    'Caps', 'T-Shirts', 'Jackets',
    'Footwear', 'Accessories', 'Winter Collection',
  ];

  product = {
    name:        '',
    description: '',
    price:       0,
    stock:       0,
    category:    '',
    tags:        [] as string[],
  };

  selectedFiles: File[]   = [];
  previewUrls:   string[] = [];
  errors:        Record<string, string> = {};
  isSubmitting   = false;
  submitSuccess  = false;
  submitError:   string | null = null;

  constructor(
    private productService: ProductService,
    private cdr:            ChangeDetectorRef,   // ← add this
  ) {}

  toggleTag(tag: string): void {
    const idx = this.product.tags.indexOf(tag);
    if (idx === -1) this.product.tags.push(tag);
    else            this.product.tags.splice(idx, 1);
  }

  onFileSelected(event: Event): void {
    const input   = event.target as HTMLInputElement;
    const files   = Array.from(input.files ?? []);
    const allowed = 6 - this.selectedFiles.length;

    files.slice(0, allowed).forEach(file => {
      this.selectedFiles.push(file);
      const reader = new FileReader();
      reader.onload = () => {
        this.previewUrls.push(reader.result as string);
        this.cdr.detectChanges();   // ← force preview to render
      };
      reader.readAsDataURL(file);
    });
  }

  removeImage(index: number): void {
    this.selectedFiles.splice(index, 1);
    this.previewUrls.splice(index, 1);
  }

  validate(): boolean {
    this.errors = {};
    const p = this.product;
    if (!p.name.trim())        this.errors['name']        = 'Product name is required';
    if (!p.description.trim()) this.errors['description'] = 'Description is required';
    if (!p.category)           this.errors['category']    = 'Category is required';
    if (p.price <= 0)          this.errors['price']       = 'Price must be greater than 0';
    if (p.stock < 0)           this.errors['stock']       = 'Stock cannot be negative';
    if (this.selectedFiles.length === 0)
                               this.errors['images']      = 'At least one image is required';
    return Object.keys(this.errors).length === 0;
  }

  submit(): void {
    if (!this.validate() || this.isSubmitting) return;

    this.isSubmitting  = true;
    this.submitError   = null;
    this.submitSuccess = false;

    const formData = new FormData();
    formData.append('name',        this.product.name);
    formData.append('description', this.product.description);
    formData.append('price',       this.product.price.toString());
    formData.append('stock',       this.product.stock.toString());
    formData.append('category',    this.product.category);
    formData.append('tags',        JSON.stringify(this.product.tags));
    this.selectedFiles.forEach(file => formData.append('images', file));

    this.productService.createProduct(formData).subscribe({
      next: () => {
        this.isSubmitting  = false;
        this.submitSuccess = true;
        this.cdr.detectChanges();   // ← force success banner to show

        setTimeout(() => {
          this.submitSuccess = false;
          this.reset();
          this.cdr.detectChanges();  // ← force clear
        }, 3000);
      },
      error: (err) => {
        this.isSubmitting = false;
        this.submitError  = err?.error?.message ?? 'Failed to add product. Please try again.';
        this.cdr.detectChanges();
      },
    });
  }

  reset(): void {
    this.product = {
      name: '', description: '', price: 0,
      stock: 0, category: '', tags: [],
    };
    this.selectedFiles = [];
    this.previewUrls   = [];
    this.errors        = {};
    this.submitError   = null;
  }
}
