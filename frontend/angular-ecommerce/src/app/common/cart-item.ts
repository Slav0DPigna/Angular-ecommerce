import { Product } from "./product";

export class CartItem {

    id: string;
    name: string;
    imageUrl: string;
    unitPrice: number;

    quantity: number;

    //constructor(id:string,name:string,imageUrl:string,unitPrize:number,quantity:number){
    //    this.id=id;
    //    this.name=name;
    //    this.imageUrl=imageUrl;
    //    this.unitPrice=unitPrize;
    //    this.quantity=1;}

    constructor(prod:Product){
        this.id=(prod.id).toString();
        this.name=prod.name;
        this.imageUrl=prod.imageUrl;
        this.unitPrice=prod.unitPrice;
        this.quantity=1;
    }
}
