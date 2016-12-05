import { Component, OnInit, Inject } from 'ng-metadata/core';
import { StompClient } from './shared';
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

  stompClient: StompClient;

  constructor( @Inject('$log') private _$log: ng.ILogService,
    @Inject('$location') private locationService: ng.ILocationService,
    @Inject('$mdSidenav') private mdSideNav: ng.material.ISidenavService,
    private switchBoard: SwitchBoardService, private authService: AuthenticationService,
  ) {

    authService.onChange().subscribe(() => this.doAuthenticationRedirection());
  }

  ngOnInit() {
    this._$log.log('Initializing AppComponent');

    this.stompClient = new StompClient('http://localhost:8080/blacktiger/socket');
    this.stompClient.connect(null, null, () => {
      this._$log.info('Websocket connected');
      this.switchBoard.addDataSource(this.stompClient.subscribe('/queue/events/*'));
    }, () => {

    });

    this.doAuthenticationRedirection();
  }

  toggleMenu() {
    this.mdSideNav('menu').toggle();
  }

  private doAuthenticationRedirection() {
    if (!this.authService.isAuthorized()) {
      this.locationService.path('/signin');
    } else {
      this.locationService.path('/room');
    }
  }
}
