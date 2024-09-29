import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable , of} from 'rxjs';
import { Country } from '../common/country';
import { State } from '../common/state';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CcFormService {

  private baseUrl= environment.slavoShopUrl
  private countriesUrl = this.baseUrl+'/countries';
  private stateUrl = this.baseUrl+'/states';

  constructor(private httpClient: HttpClient) { }

  getCountries(): Observable<Country[]>{
    return this.httpClient.get<GetResponseCountries>(this.countriesUrl).pipe(
      map(response=> response._embedded.countries)
    );
  }

  getStates(theCountryCode: string): Observable<State[]>{
    const searchStateUrl=`${this.stateUrl}/search/findByCountryCode?code=${theCountryCode}`;
    return this.httpClient.get<GetResponseState>(searchStateUrl).pipe(
      map(response=> response._embedded.states)
    );
  }

  getCreditCardMonths(startMonth: number): Observable<number[]>{

    let data: number[]=[];
    //costruiamo un array(observable) con i mesi e successivamente con gli anni
    for(let theMonth=startMonth;theMonth<=12;theMonth++)
      data.push(theMonth);
    return of(data);
  }

  getCreditCardYears():Observable<number[]>{
    let data:number[]=[];
    const startYear: number=new Date().getFullYear();
    const endYear: number=startYear+10;

    for(let theYear=startYear;theYear<=endYear;theYear++)
      data.push(theYear);
    return of(data);
  }
}


interface GetResponseCountries{
  _embedded: {
    countries: Country[];
  }
}

interface GetResponseState{
  _embedded: {
    states: State[];
  }
}