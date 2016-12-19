import { Component, OnInit, Inject } from 'ng-metadata/core';
import { AuthenticationService } from '../shared/authentication.service';

@Component({
  selector: 'bt-signin',
  template: `
    <div flex layout layout-align="center center">
        <md-whiteframe class="md-whiteframe-4dp" flex-xs="85" flex-sm="45" flex-gt-sm="45" flex-gt-md="25" layout-padding layout="column">
            <div layout layout-align="center">
                <h1 class="md-display-1">Telesal</h1>
            </div>
            <md-divider></md-divider>
            <form novalidate flex layout="column">
        
            <md-input-container>
                <label>Brugernavn</label>
                <input ng-model="$ctrl.username">
            </md-input-container>
            <md-input-container>
                <label>Password</label>
                <input type="password" ng-model="$ctrl.password">
            </md-input-container>
            <md-divider></md-divider>
            <div layout layout-align="end">
                <button type="submit" ng-click="$ctrl.signIn()" class="md-button md-raised md-primary">Log ind</button>
            </div>
            </form>
        </md-whiteframe>
        
    </div>
    `
})
export class SigninComponent {

    username: string;
    password: string;

    constructor(private authenticationService: AuthenticationService) {}

    public signIn() {
        this.authenticationService.authenticate(this.username, this.password).catch((message) => {
            alert(message);
        });
    }

}