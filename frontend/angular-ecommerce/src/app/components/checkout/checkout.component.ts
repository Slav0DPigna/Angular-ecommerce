import { Component, numberAttribute } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { CcFormService } from '../../services/cc-form.service';
import { JsonPipe } from '@angular/common';
import { Country } from '../../common/country';
import { State } from '../../common/state';
import { CartService } from '../../services/cart.service';
import { ShopValidators } from '../../validators/shop-validators';
import { CheckoutService } from '../../services/checkout.service';
import { Router } from '@angular/router';
import { Order } from '../../common/order';
import { OrderItem } from '../../common/order-item';
import { Purchase } from '../../common/purchase';
import { environment } from '../../../environments/environment';
import { PaymentInfo } from '../../common/payment-info';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.css'
})
export class CheckoutComponent {

  checkoutFormGroup: FormGroup;

  totalPrice:number=0;
  totalQuantity:number=0;

  creditCardYears:number[]=[];
  creditCardMonths:number[]=[];
  
  countries: Country[]=[];

  shippingAddressStates: State[]=[];
  billingAddressStates: State[]=[];

  storage: Storage= sessionStorage;

  //inizializzo le stripe api
  stripe = Stripe(environment.stripePublishableKey);

  paymentInfo: PaymentInfo = new PaymentInfo();
  cardElement: any;
  displayError: any= "";

  isDisabled: boolean= false;
  constructor(private formBuilder:FormBuilder,
              private ccFormService:CcFormService,
              private cartService: CartService,
              private checkoutService: CheckoutService,
              private router:Router){}

  ngOnInit():void{
    //faccio il setup del form stripe
    this.setupStripePaymentForm();

    this.reviewCartDetails();
    //mi salvo l'indirizzo email per far si che quando un utente é loggato possa usare solo la sua mail per fare gli ordini
    const theEmail=this.storage.getItem('userEmail')!;//questo come gli altri ho dovuto rimuovere la parte JSON.stringfy 
    this.checkoutFormGroup=this.formBuilder.group({
      customer: this.formBuilder.group({
        firstName:new FormControl('',[Validators.required,Validators.minLength(2),ShopValidators.notOnlyWhitespace]),
        lastName:new FormControl('',[Validators.required,Validators.minLength(2),ShopValidators.notOnlyWhitespace]),
        email:new FormControl(theEmail,
          [Validators.required,
           Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$'),
           ShopValidators.notOnlyWhitespace])}),
      shippingAddress: this.formBuilder.group({
        street: new FormControl('',[Validators.required,Validators.minLength(2),ShopValidators.notOnlyWhitespace]),
        city: new FormControl('',[Validators.required,Validators.minLength(2),ShopValidators.notOnlyWhitespace]),
        state:  new FormControl('',Validators.required),
        country:  new FormControl('',Validators.required),
        zipCode: new FormControl('',[Validators.required,Validators.minLength(2),ShopValidators.notOnlyWhitespace])
      }),
      billingAddress: this.formBuilder.group({
        street: new FormControl('',[Validators.required,Validators.minLength(2),ShopValidators.notOnlyWhitespace]),
        city: new FormControl('',[Validators.required,Validators.minLength(2),ShopValidators.notOnlyWhitespace]),
        state: new FormControl('',Validators.required),
        country:  new FormControl('',Validators.required),
        zipCode: new FormControl('',[Validators.required,Validators.minLength(5),ShopValidators.notOnlyWhitespace])
      }),
      creditCard: this.formBuilder.group({
        /*
        cardType:new FormControl('',[Validators.required]),
        nameOnCard:new FormControl('',[Validators.required, ShopValidators.notOnlyWhitespace]),
        cardNumber:new FormControl('',[Validators.required, ShopValidators.notOnlyWhitespace, Validators.pattern('[0-9]{16}')]),
        securityCode:new FormControl('',[Validators.required, ShopValidators.notOnlyWhitespace, Validators.pattern('[0-9]{3}')]),
        expirationMonth:new FormControl('',[Validators.required]),
        expirationYear:new FormControl('',[Validators.required])*/
      })
    });//questi sono i campi che un cliente compilerá quando dovrá fare il checkout
    //let TPQ=this.cartService.computeCartTotals();
    //this.totalPrice=TPQ[0];
    //this.totalQuantity=TPQ[1];
    //nel file cart.service.ts ho modificato la funzione computeCartTotals in modo tale che mi restituisce un array
    //con il totale del carrello e il numero totale di elementi presenti all'interno. questa soluzione si puó migliorare
    //inatti all'inizio di questo metodo ho scritto un nuovo metodo per udare l'oggetto behaviorSubject che é molto elegante come soluzione.



   /*const startMonth:number=new Date().getMonth()+1;
   console.log("Start month "+startMonth);
    this.ccFormService.getCreditCardMonths(startMonth).subscribe(data=>{//come argomento alla fine ho passato uno cosí da farmi mostrare tutti i mesi
      console.log("retrieved credit card months: "+ JSON.stringify(data));
      this.creditCardMonths=data;
    });

    this.ccFormService.getCreditCardYears().subscribe(
      data=>{
        console.log("Retrived credi card years: "+ JSON.stringify(data))
        this.creditCardYears=data;
      }
    );*/
    //mettiamo le countries

    this.ccFormService.getCountries().subscribe(
      data=>{
        console.log("Retrived countries: "+ JSON.stringify(data));
        this.countries=data;
      });
  }

  setupStripePaymentForm() {
    var elements = this.stripe.elements();
    this.cardElement= elements.create('card',{hidePostalCode: true});
    this.cardElement.mount('#card-elemet');
    this.cardElement.on('change',(event: any)=>{
      this.displayError=document.getElementById('card-errors');
      if(event.complete){
        this.displayError.textContent="";
      }else if(event.error){
        this.displayError.textContent= event.error.message;
      }
    });
  }

  reviewCartDetails() {
    //subscribe cartService.totalQuantity
    this.cartService.totalQuantity.subscribe(
      totalQuantity=>this.totalQuantity=totalQuantity
    );
    //subscribe cartService.totalPrice
    this.cartService.totalPrice.subscribe(
      totalPrice=>this.totalPrice=totalPrice
    );
  }

  get firstName(){
    return this.checkoutFormGroup.get('customer.firstName');
  }

  get lastName(){
    return this.checkoutFormGroup.get('customer.lastName');
  }

  get email(){
    return this.checkoutFormGroup.get('customer.email');
  }

  get shippingAddressStreet(){
    return this.checkoutFormGroup.get('shippingAddress.street');
  }

  get shippingAddressCity(){
    return this.checkoutFormGroup.get('shippingAddress.city');
  }

  get shippingAddressState(){
    return this.checkoutFormGroup.get('shippingAddress.state');
  }

  get shippingAddressCountry(){
    return this.checkoutFormGroup.get('shippingAddress.country');
  }

  get shippingAddressZipCode(){
    return this.checkoutFormGroup.get('shippingAddress.zipCode');
  }

  get billingAddressStreet(){
    return this.checkoutFormGroup.get('billingAddress.street')
  }

  get billingAddressCity(){
    return this.checkoutFormGroup.get('billingAddress.city')
  }

  get billingAddressState(){
    return this.checkoutFormGroup.get('billingAddress.state')
  }

  get billingAddressCountry(){
    return this.checkoutFormGroup.get('billingAddress.country')
  }

  get billingAddressZipCode(){
    return this.checkoutFormGroup.get('billingAddress.zipCode')
  }

  get cardType(){
    return this.checkoutFormGroup.get('creditCard.cardType')
  }

  get nameOnCard(){
    return this.checkoutFormGroup.get('creditCard.nameOnCard')
  }

  get cardNumber(){
    return this.checkoutFormGroup.get('creditCard.cardNumber')
  }

  get secutiyuCode(){
    return this.checkoutFormGroup.get('creditCard.securityCode')
  }

  get expirationMonth(){
    return this.checkoutFormGroup.get('creditCard.expirationMonth')
  }

  get expirationYear(){
    return this.checkoutFormGroup.get('creditCard.expirationYear')
  }

  onSubmit(){//ho dei problemi con la carta di credito ma niente di che basta assicurarsi di mettere i dati
    console.log('Handling the submit button');
    if(this.checkoutFormGroup.invalid){
      console.log('Form is invalid:', this.checkoutFormGroup.controls);
      this.checkoutFormGroup.markAllAsTouched();
      return;
    }
    //imposto l'ordine
    let order=new Order();
    order.totalPrice=this.totalPrice;
    order.totalQuantity=this.totalQuantity;
    //prendo gli oggetti nel carrello
    const cartItems= this.cartService.cartItems;
    //creo orderItems da cartItems
    let orderItems: OrderItem[]=[];
    for(let i=0;i<cartItems.length;i++)
      orderItems[i]=new OrderItem(cartItems[i]);
    //imposto l'acquisto
    let purchase=new Purchase();
    //popolo purchase customer
    purchase.customer=this.checkoutFormGroup.controls['customer'].value;
    //popolo purchase shipping address
    purchase.shippingAddress=this.checkoutFormGroup.controls['shippingAddress'].value;
    const shippingState: State=JSON.parse(JSON.stringify(purchase.shippingAddress.state));
    const shippingCountry: State=JSON.parse(JSON.stringify(purchase.shippingAddress.country));
    purchase.shippingAddress.state=shippingState.name;
    purchase.shippingAddress.country=shippingCountry.name;
    //popolo purchase billing
    purchase.billingAddress=this.checkoutFormGroup.controls['billingAddress'].value;
    const billingState: State=JSON.parse(JSON.stringify(purchase.billingAddress.state));
    const billingCountry: State=JSON.parse(JSON.stringify(purchase.billingAddress.country));
    purchase.billingAddress.state=billingState.name;
    purchase.billingAddress.country=billingCountry.name;
    //popolo purchase order e orderItems
    purchase.order=order;
    purchase.orderItems=orderItems;
    //ricordiamo di convertire in centesimi
    this.paymentInfo.amount=Math.round(this.totalPrice*100);
    this.paymentInfo.currency="EUR";
    this.paymentInfo.receiptEmail=purchase.customer.email;
    //chiamo le rest api 
    if (!this.checkoutFormGroup.invalid && this.displayError.textContent===""){

      this.isDisabled=true;
      this.checkoutService.createPaymentIntent(this.paymentInfo).subscribe(
      (paymentIntentResponse)=>{
        this.stripe.confirmCardPayment(paymentIntentResponse.client_secret,
        {
          payment_method:{
            card: this.cardElement,
            billing_details:{
              email: purchase.customer.email,
              name: `${purchase.customer.firstName} ${purchase.customer.lastName}`,
              address: {
                line1: purchase.billingAddress.street,
                city: purchase.billingAddress.city,
                state: purchase.billingAddress.state,
                postal_code: purchase.billingAddress.zipCode,
                country: this.billingAddressCountry.value.code
              }
            }
          }
        },{handleActions: false})
        .then((result: any)=>{
            if(result.error){
              alert(`There was an error: ${result.error.message}`);
              this.isDisabled=false;
            }else{
              this.checkoutService.placeOlder(purchase).subscribe({
                next: (response: any)=>{
                  alert(`Your order has been received.\nOrder tracking number: ${response.orderTrackingNumber}`);
                  this.resetCart();
                  this.isDisabled=false;
                },
                error:(err:any)=> {
                  alert(`There was an error: ${err.massage}`);
                  this.isDisabled=false;
                }
              })
            }
          });
      }
      );
    }else{
      this.checkoutFormGroup.markAllAsTouched();
      return;
    }

  }

  resetCart() {
    //reset cart data
    this.cartService.cartItems=[];
    this.cartService.totalPrice.next(0);
    this.cartService.totalQuantity.next(0);
    this.cartService.persistCartItems();
    //reset the form
    this.checkoutFormGroup.reset();
    //vado indietro fino alla pagina dei prodotti
    this.router.navigateByUrl("/products");
  }

  copyShippingAddress(event: any) {
    if(event.target.checked){
        this.checkoutFormGroup.controls['billingAddress'].setValue(
          this.checkoutFormGroup.controls['shippingAddress'].value);
        this.billingAddressStates=this.shippingAddressStates;
      }
      else{
        this.checkoutFormGroup.controls['billingAddress'].reset();
        this.billingAddressStates=[];
      }
  }

  handleMonthAndYears() {
    const creditCardFormGroup= this.checkoutFormGroup.get('creditCard');

    const currentYear: number= new Date().getFullYear();
    const selectedYear: number= Number(creditCardFormGroup.value.expirationYear);

    let startMonth: number;

    if(currentYear===selectedYear){
      startMonth=new Date().getMonth() +1;
    }else{
      startMonth=1;
    }

    this.ccFormService.getCreditCardMonths(startMonth).subscribe(
      data=>{
        console.log("retrieved credit card months: "+JSON.stringify(data));
        this.creditCardMonths=data;
      });
  }

  getState(formGroupName: string) {
    const formGroup = this.checkoutFormGroup.get(formGroupName);

    const countryCode = formGroup.value.country.code;
    const countryName = formGroup.value.country.name;

    console.log(`${formGroupName} country code: ${countryCode}`);
    console.log(`${formGroupName} country code: ${countryName}`);

    this.ccFormService.getStates(countryCode).subscribe(
      data=>{
        if(formGroupName === 'shippingAddress'){
          this.shippingAddressStates=data;
        }else{
          this.billingAddressStates=data;
        }

        //selezioniamo il primo elemento di default
        formGroup.get('state').setValue(data[0]);
      });
  }

}
