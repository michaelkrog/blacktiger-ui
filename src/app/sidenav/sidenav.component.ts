import { Component, OnInit, Inject } from 'ng-metadata/core';
import { AuthenticationService } from '../shared';

interface Entry {
  title: string;
  icon: string;
  key: string;
}
@Component({
  selector: 'bt-sidenav',
  styles: [ require( './sidenav.component.scss' ) ],
  template: `
    <md-sidenav layout="column" class="md-sidenav-left md-whiteframe-4dp" md-is-locked-open="$mdMedia('gt-sm') && $ctrl.showMenu()" 
      md-component-id="menu">
      <md-toolbar class="md-theme-light">
        <div class="md-toolbar-tools">
          <md-button class="md-icon-button" aria-label="logo">
            <md-icon>phone</md-icon>
          </md-button>
          <h2>
            <span>Telesal</span>
          </h2>
          <span flex></span>
        </div>
      </md-toolbar>
      
      <md-list>
        <md-list-item ng-repeat="entry in $ctrl.entries" ng-class="{active:$ctrl.activeEntry === entry.key}" 
          ng-click="$ctrl.goto(entry.key)">
          <md-icon>{{entry.icon}}</md-icon>
          <p>{{entry.title}}</p>
        </md-list-item>
     </md-list>
   </md-sidenav>
  `
})
export class SidenavComponent implements OnInit {

  private entries: Entry[] = [
    {title: 'Møderum', icon: 'people', key: 'room'},
    {title: 'Medier', icon: 'music_video', key: 'media'},
    {title: 'Indstillinger', icon: 'settings', key: 'settings'},
    {title: 'Opret lytter', icon: 'person_add', key: 'create_listener'},
    {title: 'Hjælp', icon: 'help', key: 'help'}
  ];

  private activeEntry = 'room';

  constructor( @Inject( '$log' ) private _$log: ng.ILogService,
    @Inject('$mdSidenav') private mdSideNav: ng.material.ISidenavService,
    private authService: AuthenticationService) {}

  ngOnInit() {
    this._$log.log( 'Initializing sidenav' );
  }

  goto(key) {
    this.activeEntry = key;
    this.mdSideNav('menu').close();
  }

  showMenu() {
    return this.authService.isAuthorized();
  }
}
