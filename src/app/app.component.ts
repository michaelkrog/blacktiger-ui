import { Component, OnInit, Inject } from 'ng-metadata/core';

@Component({
  selector: 'bt-app',
  styles: [ require( './app.scss' ) ],
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

  constructor( @Inject( '$log' ) private _$log: ng.ILogService,
    @Inject('$mdSidenav') private mdSideNav: ng.material.ISidenavService) {
      
    }

  ngOnInit() {
    this._$log.log( 'hello from OnInit' );
  }

  toggleMenu() {
    this.mdSideNav('menu').toggle();
  }
}
