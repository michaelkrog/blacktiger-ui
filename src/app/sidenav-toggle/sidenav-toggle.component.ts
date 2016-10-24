import { Component, OnInit, Inject } from 'ng-metadata/core';

interface Entry {
  title: string;
  icon: string;
  key: string;
}
@Component({
  selector: 'bt-sidenav-toggle',
  template: `
    <md-button hide-gt-sm class="md-icon-button" aria-label="Settings" ng-click="$ctrl.toggleMenu()">
        <md-icon>menu</md-icon>
    </md-button>
    `
})
export class SidenavToggleComponent {

    constructor(@Inject('$mdSidenav') private mdSideNav: ng.material.ISidenavService) {}

    toggleMenu() {
        this.mdSideNav('menu').toggle();
    }
}