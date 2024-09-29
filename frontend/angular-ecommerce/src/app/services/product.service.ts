import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Product } from '../common/product';
import { map } from 'rxjs/operators';
import { ProductCategory } from '../common/product-category';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  private baseUrl = environment.slavoShopUrl+'/products';
  private categoryUrl = environment.slavoShopUrl+'/product-category'

  constructor(private httpCliente: HttpClient) { }

  getProductList(theCatrgoryId: number): Observable<Product[]> {

    //need to buil URL based on category id
    const searchUrl = `${this.baseUrl}/search/findByCategoryId?id=${theCatrgoryId}`;//da notare il metodo di concatenazione di stringe
    //dove si usano gli accenti $ e parentesi {}
    return this.getProducts(searchUrl);
  }

  getProductListPaginate(thePage: number, thePageSize: number, theCatergoryId: number): Observable<GetResponseProducts> {
    //qui abbiamo bisogno di costruire un url apposta per questo scopo
    const searchUrl = `${this.baseUrl}/search/findByCategoryId?id=${theCatergoryId}` + `&page=${thePage}&size=${thePageSize}`;
    return this.httpCliente.get<GetResponseProducts>(searchUrl);
  }

  getProductCategories(): Observable<ProductCategory[]> {
    return this.httpCliente.get<GetResponseProductCategory>(this.categoryUrl).pipe(
      map(response => response._embedded.productCategory)
    );
  }

  searchProduct(theKeyword: string): Observable<Product[]> {
    //need to buil URL based on category id
    const searchUrl = `${this.baseUrl}/search/findByNameContaining?name=${theKeyword}`;//da notare il metodo di concatenazione di stringe
    //dove si usano gli accenti $ e parentesi {}
    return this.getProducts(searchUrl);
  }

  searchProductListPaginate(thePage: number, thePageSize: number, theKeyword: string): Observable<GetResponseProducts> {
    //é facile notare come questo metodo sia molto simile a getProductListPaginate con l'aggiunta di searchProduct
    const searchUrl = `${this.baseUrl}/search/findByNameContaining?name=${theKeyword}` + `&page=${thePage}&size=${thePageSize}`;
    return this.httpCliente.get<GetResponseProducts>(searchUrl);
  }


  private getProducts(searchUrl: string): Observable<Product[]> {
    return this.httpCliente.get<GetResponseProducts>(searchUrl).pipe(
      map(response => response._embedded.products)
    );
  }

  getProduct(theProductId: number) {
    //abbiamo bisogno di creare il nostro url di risposta 
    const productUrl = `${this.baseUrl}/${theProductId}`
    //ora possiamo continuare come al solito ma ricordando che dell'altra parte in /src/app/components/product-details/product-details.component.ts
    //aspettiamo un array
    return this.httpCliente.get<Product>(productUrl);
  }
}
interface GetResponseProducts {
  _embedded: {
    products: Product[];
  },
  page: {
    size: number,
    totalElements: number,
    totalPages: number,
    number: number
  }
}

interface GetResponseProductCategory {
  _embedded: {
    productCategory: ProductCategory[];
  }
}
