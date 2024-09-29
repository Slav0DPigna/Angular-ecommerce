import { Component } from '@angular/core';
import { Product } from '../../common/product';
import { ProductService } from '../../services/product.service';
import { ActivatedRoute } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { CartItem } from '../../common/cart-item';

@Component({
  selector: 'app-product-details',
  templateUrl: './product-details.component.html',
  styleUrl: './product-details.component.css'
})
export class ProductDetailsComponent {

  product!:Product;//ricordiamo sempre che il ! dice al compilatore che questa cosa non puó essere null

  constructor(private productService: ProductService,
              private cartService: CartService,
              private route: ActivatedRoute
  ){}

  ngOnInit():void{
    this.route.paramMap.subscribe(()=>
      this.handleProductDetails());
  }
  handleProductDetails(){
    //prendiamo l'id del prodotto e lo convertiamo in stringa
    const theProductId: number=+this.route.snapshot.paramMap.get('id')!;
    this,this.productService.getProduct(theProductId).subscribe(
      data=>{
        this.product=data;
      }
    );
  }

  addToCart(){
    console.log(`adding to cart ${this.product.name} ${this.product.unitPrice}`);
    const theCartItem=new CartItem(this.product);
    this.cartService.addToCart(theCartItem);
  }

}
