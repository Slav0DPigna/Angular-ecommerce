import { Component } from '@angular/core';
import { CartItem } from '../../common/cart-item';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-cart-details',
  templateUrl: './cart-details.component.html',
  styleUrl: './cart-details.component.css'
})
export class CartDetailsComponent {

  cartItems: CartItem[]=[];
  totalPrice: number=0;
  totalQuantity: number=0;

  constructor(private cartService: CartService){}

  ngOnInit():void{
    this.listCartDetails();
  }


  listCartDetails() {
    //prendiamo gli elementi del carrello
    this.cartItems=this.cartService.cartItems;
    //aggiorniamo il prezzo totale del carrello
    this.cartService.totalPrice.subscribe(data=>this.totalPrice=data);
    //aggiorniamo la quantitá totale ottenuta nel carrello
    this.cartService.totalQuantity.subscribe(data=>this.totalQuantity=data);
    //calcoliamo il prezzo totale in base alla quantitá di oggetti
    this.cartService.computeCartTotals();
  }

  incrementQuantity(theCartItem: CartItem) {
      this.cartService.addToCart(theCartItem);
    }

  decrementQuantity(theCartItem: CartItem){
    this.cartService.decrementQuantity(theCartItem);
  }

  remove(theCartItem: CartItem){
    this.cartService.remove(theCartItem);
  }

}
