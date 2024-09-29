import { Component, Inject } from '@angular/core';
import { OKTA_AUTH, OktaAuthStateService } from '@okta/okta-angular';
import { OktaAuth } from '@okta/okta-auth-js';

@Component({
  selector: 'app-login-status',
  templateUrl: './login-status.component.html',
  styleUrl: './login-status.component.css'
})
export class LoginStatusComponent {

  isAutenticated: boolean =false;
  userFullName: string ='';
  storage: Storage = sessionStorage;

  constructor(private oktaAuthService: OktaAuthStateService,
             @Inject(OKTA_AUTH) private oktaAuth: OktaAuth){}

  ngOnInit(): void{
    this.oktaAuthService.authState$.subscribe(
      (result)=>{
        this.isAutenticated=result.isAuthenticated!;
        this.getUserDateils();
      }
    );
  }
  getUserDateils() {
    if(this.isAutenticated)
      this.oktaAuth.getUser().then(
        (res)=>{
          this.userFullName=res.name as string;
          //ci conserviamo anche la mail per ricavare dopo lo storico degli ordini
          const theEmail= res.email;
          this.storage.setItem('userEmail',theEmail);
        }
      );
  }

  logout(){
    this.oktaAuth.signOut();
  }

}
