import { Injectable } from '@angular/core';
import { CartItem } from '../common/cart-item';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CartService {

  cartItems: CartItem[]=[];

  totalPrice: BehaviorSubject<number>=new BehaviorSubject<number>(0);//subject come anche replaysubject o behaviorSubject sono sottoclassi di observable
  //quindi possiamo mettere in atto il design pattern Observer
  //replaySubject tiene traccia di ogni movimento fatto e ce lo mostra
  //behaviorSubject invece al massimo ci restituisce l'ultimo stato della variabile

  totalQuantity: BehaviorSubject<number>=new BehaviorSubject<number>(0);
  storage : Storage = sessionStorage;//al posto di session storage possiamo usare localstorage nel secondo 
  //caso i dati sopravvivono anche se riavvio il browser nel primo non vivono nemmeno dopo la chiusura del tab

  constructor() { 
    //legge i dati dallo storage del browser
    let data =JSON.parse(this.storage.getItem('cartItems')!);
    if(data !=null){
      this.cartItems=data;
      this.computeCartTotals();
    }
  }

  addToCart(theCartItem: CartItem){
    //controllo se abbiamo giá messo il prodotto nel carrello
    let alredyExistsInCart: boolean=false;
    let existingCartItem: CartItem=undefined;//qua dava un warning che é piú un problema grosso infatti ho dovuto far star zitto
    //il compolatore con la stringa in tsconfig.json "strictNullChecks": false ed é una cosa che non mi piace per niente

    if(this.cartItems.length>0){
    //vedo se ci sono prodotti uguali in base all'id 
      for(let tempCartItem of this.cartItems){
        /*if(tempCartItem.id===theCartItem.id){
          existingCartItem=tempCartItem;
          break;
        }*/
       existingCartItem=this.cartItems.find(tempCartItem=>tempCartItem.id===theCartItem.id);
      }
    }
    //controllo di averlo trovato
    alredyExistsInCart=(existingCartItem != undefined);
    if(alredyExistsInCart){
      //incrementiamo la quantitá
      existingCartItem.quantity++;
    }else{
      this.cartItems.push(theCartItem);
    }
    //calcolo il prezzo totale del carrello
    this.computeCartTotals();
  }


  computeCartTotals(){
    let totalPriceValue: number=0;
    let totalQuantityValue:number=0;

    for(let currentCartItem of this.cartItems){
      totalPriceValue+=currentCartItem.quantity*currentCartItem.unitPrice;
      totalQuantityValue+=currentCartItem.quantity;
    }

    //con i segueti due comandi aggiorniamo la pagina con i valori correnti
    this.totalPrice.next(totalPriceValue);
    this.totalQuantity.next(totalQuantityValue);

    //log per il debug
    this.logCartData(totalPriceValue, totalQuantityValue);

    //persist cart data
    this.persistCartItems();
  }

  logCartData(totalPriceValue: number, totalQuantityValue: number) {
    console.log(`Content of the cart:`)
    for(let tempCartItem of this.cartItems){
      const subTotalPrice=tempCartItem.quantity*tempCartItem.unitPrice;
      console.log(`name: ${tempCartItem.name} quantity: ${tempCartItem.quantity}, unit price:${tempCartItem.unitPrice} subtotal price:${subTotalPrice}`);
    }
    console.log(`total price:${totalPriceValue.toFixed(2)} , totalQuantity: ${totalQuantityValue}`)
    console.log('--------')
  }

  persistCartItems(){
    this.storage.setItem('cartItems', JSON.stringify(this.cartItems));
  }

  decrementQuantity(theCartItem: CartItem){
    theCartItem.quantity--;

    if(theCartItem.quantity===0){//rimuoviamo l'elemento nell'array
      this.remove(theCartItem);
    }else{
      this.computeCartTotals();
    }
  }

  remove(theCartItem: CartItem){
    const itemIndex= this.cartItems.findIndex(tempCartItem=>tempCartItem.id==theCartItem.id);
    if(itemIndex>-1){//se c'é lo rimuovo
      this.cartItems.splice(itemIndex,1);
      this.computeCartTotals();
    }
  }
}
