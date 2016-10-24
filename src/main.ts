import { bootstrap } from 'ng-metadata/platform-browser-dynamic';
import { enableProdMode } from 'ng-metadata/core';

import * as ngMaterial from 'angular-material';
import { AppComponent, PROVIDERS } from './app';
import * as router from 'angular-route';

if ( ENV === 'production' ) {
  enableProdMode();
}

bootstrap( AppComponent, [router, ngMaterial, PROVIDERS] );
