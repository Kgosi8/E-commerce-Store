import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProductService } from '../../../services/products/product-service';

@Component({
  selector: 'app-add-to-cart',
  imports: [],
  templateUrl: './add-to-cart.html',
  styleUrl: './add-to-cart.css',
})
export class AddToCart implements OnInit {

  product: any;

  constructor(private route: ActivatedRoute, private productServices: ProductService){}

  ngOnInit(){
    const id=this.route.snapshot.paramMap.get('id');

    this.productServices.getProductById(id).subscribe(
      (product)=>{
        this.product=product;
        console.log(this.product);
      }
    )
  }

  addToCart(product: any){
    console.log('Added to cart: ',product);
  }
}
