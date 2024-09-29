import { Component } from '@angular/core';
import myAppConfig from '../../config/my-app-config';
import { OKTA_AUTH } from '@okta/okta-angular';
import { OktaAuth, pkce } from '@okta/okta-auth-js';
import OktaSignIn from '@okta/okta-signin-widget'
import { Inject } from '@angular/core';//questo import é da verificare


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  oktaSignin: any;

  constructor(@Inject(OKTA_AUTH) private oktaAuth: OktaAuth){
    this.oktaSignin= new OktaSignIn({
      logo:'assets/images/logo.png',
      baseUrl:myAppConfig.oidc.issuer.split('/oauth2')[0],
      clientId: myAppConfig.oidc.clientId,
      redirectUri: myAppConfig.oidc.redirectUri,
      authParams:{
        pkce:true,
        issuer: myAppConfig.oidc.issuer,
        scopes: myAppConfig.oidc.scopes
      },
      debug: true
    });
  }

  ngOnInit(): void{
    this.oktaSignin.remove();

    this.oktaSignin.renderEl({
      el: '#okta-sign-in-widget'},//questo nome deve essere lo stesso nel file html
      (response: any)=>{
        if (response.status === 'SUCCESS'){
          console.log("response status:"+ response.status);
          this.oktaAuth.signInWithRedirect();
        }else {
        console.log("response status: " + response.status);
        }
      },
      (error: any)=>{
        console.error('Error rendering Okta Sign-In Widget:', error);
      });
  }

}
