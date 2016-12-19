import { Component, OnInit, Inject } from 'ng-metadata/core';
import { SwitchBoardService, AuthenticationService } from './shared';

@Component({
  selector: 'bt-app',
  styles: [require('./app.scss')],
  template: `
  <div layout="row">
    <bt-sidenav></bt-sidenav>
    <div flex layout="column">
      <ng-view flex layout="row"></ng-view>
    </div>
  </div>
  `
})
export class AppComponent implements OnInit {

  constructor(@Inject('$log') private _$log: ng.ILogService,
    @Inject('$location') private locationService: ng.ILocationService,
    @Inject('$mdSidenav') private mdSideNav: ng.material.ISidenavService,
    private switchBoard: SwitchBoardService, private authService: AuthenticationService) { }

  ngOnInit() {
    this._$log.log('Initializing AppComponent');

    this.authService.onChange().subscribe((authenticated) => {
            this.doAuthenticationRedirection();
    });

    this.doAuthenticationRedirection();
  }

  toggleMenu() {
    this.mdSideNav('menu').toggle();
  }

  private doAuthenticationRedirection() {
    if (!this.authService.isAuthenticated()) {
      this.locationService.path('/signin');
    } else {
      this.locationService.path('/room');
    }
  }
}
