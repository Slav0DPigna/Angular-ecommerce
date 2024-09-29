import { Component, OnInit } from '@angular/core';
import { ProductService } from '../../services/product.service';
import { Product } from '../../common/product';
import { ActivatedRoute } from '@angular/router';
import { CartItem } from '../../common/cart-item';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-product-list',
  //templateUrl: './product-list.component.html',abbiamo poi tolto questo file con il file relativo alla tabella in HTML
  //templateUrl: './product-list-table.component.html',//da questa tabella poi sono passato alla griglia 
  templateUrl: './product-list-grid.component.html',
  styleUrl: './product-list.component.css'
})
export class ProductListComponent {

  products: Product[] = [];
  currentCategoryId: number = 1;
  previusCategoryId: number=1;
  currentCategoryName: string = "";
  searchMode: boolean = false;

  //qui aggiungo altri attributi per il paging

  thePageNumber: number=1;
  thePageSize: number=10;
  theTotalElements: number=0;

  previousKeyword: string="";

  constructor(private productService: ProductService,
              private cartService: CartService,
              private route: ActivatedRoute,) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(() => {
      this.listProducts();
    });
  }


  listProducts() {
    this.searchMode=this.route.snapshot.paramMap.has('keyword');
    if(this.searchMode){
      this.handleSearchProducts();
    }
    else{
      this.handleListProducts();
    }
  }

  handleSearchProducts(){
    const theKeyword: string=this.route.snapshot.paramMap.get('keyword')!;//sempre il !
    //se abbiamo una parola chiave diversa rispetto alla precedente impostiamo la pagina(thePageNumber) a 1
    if(this.previousKeyword!=theKeyword)
      this.thePageNumber=1;
    this.previousKeyword=theKeyword;
    console.log(`keyword=${theKeyword}, thePageNumber=${this.thePageNumber}`);
    //ora cerchiamo i prodotti usando la parola chiave
    this.productService.searchProductListPaginate(this.thePageNumber-1,this.thePageSize,theKeyword).
                        subscribe(this.processResult());
  }

  handleListProducts() {
    //verifichiamo che l'id é disponibile
    const hasCategoryId: boolean = this.route.snapshot.paramMap.has('id');
    if (hasCategoryId) {
      /*prendiamo l'id e lo convertiamo a numero con l'operatore + prima ma il compilatore mi dice che protebbe essere null
      anche se l´ho verificato con l'if, questa cosa é stata risolta con il ! alla fine che a quanto pare comunica 
      che non puó essere null al compilatore ts*/
      this.currentCategoryId = +(this.route.snapshot.paramMap.get('id')!);
      //oltre all'id prendiamo il nome della categoria da inserire poi all'inizio della sezione
      this.currentCategoryName = (this.route.snapshot.paramMap.get('name')!);
    } else {
      //se non é disponibile mettiamo che la cetegoria di default é 1
      this.currentCategoryId = 1;
      this.currentCategoryName = 'Books'
    }//questo else molto probabilmente non serve a nulla 
    //ora possiamo prendere i prodotti con questo id
    //
    //Controlliamo che l'id della categoria precedente sia diverso dal corrente perché 
    //angular riusa i component se sono ancora visualizzati
    //se l'id é diverso dal precedente si ritorna alla pagina 1
    if(this.previusCategoryId != this.currentCategoryId)
      this.thePageNumber=1;
    this.previusCategoryId=this.currentCategoryId;
    console.log(`currentCategoryId=${this.currentCategoryId}, thePageNumber=${this.thePageNumber}`);
    this.productService.getProductListPaginate(this.thePageNumber-1,
                                               this.thePageSize,
                                               this.currentCategoryId).subscribe(this.processResult());
  }

  processResult(){
    return ((data: any)=>{
      this.products=data._embedded.products;
      this.thePageNumber=data.page.number +1;
      this.thePageSize=data.page.size;
      this.theTotalElements=data.page.totalElements})
  }

  updatePageSize(pageSize: string) {
    this.thePageSize=+pageSize;
    this.thePageNumber=1;
    this.listProducts();
    }

  addToCart(theProduct:Product){
    const theCartItem=new CartItem(theProduct);
    this.cartService.addToCart(theCartItem);
  }
}
