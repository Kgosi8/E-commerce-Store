import { Component } from '@angular/core';
import {FormsModule} from "@angular/forms";
import { ProductService } from '../../../services/products/product-service';


@Component({
  selector: 'app-admin-dashboard',
  imports: [FormsModule],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css',
})
export class AdminDashboard {
  
  selectedFiles: File[] = [];
  previewUrls: string[] = [];

  product={
    name:'',
    description:'',
    price:0,
    stock:0,
    category:''
  }

  constructor(private productService: ProductService) {}

  onFileSelected(event: any) {
    this.selectedFiles = Array.from(event.target.files);
    this.previewUrls = [];
    this.selectedFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        this.previewUrls.push(reader.result as string);
      };
      reader.readAsDataURL(file);
    });
  }

  submit(){
    const formData = new FormData();
    formData.append('name', this.product.name);
    formData.append('description', this.product.description);
    formData.append('price', this.product.price.toString());
    formData.append('stock', this.product.stock.toString());
    formData.append('category', this.product.category); 

    this.selectedFiles.forEach((file) => {
      formData.append('images', file);
    });

    this.productService.createProduct(formData).subscribe(res=>{
      console.log('Product created successfully', res);
    });
  }
}
