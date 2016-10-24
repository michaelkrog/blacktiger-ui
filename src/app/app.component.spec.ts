import { kebabCase } from 'lodash';
import { IRender, renderFactory } from 'ng-metadata/testing';
import { Component, getInjectableName, bundle } from 'ng-metadata/core';

import { AppComponent } from './app.component';

describe( `AppComponent`, () => {

  @Component( {
    selector: 'test-component',
    directives: [ AppComponent ],
    template: `<bt-app></bt-app>`
  } )
  class TestComponent {
  }

  const TestModule: string = bundle( TestComponent ).name;
  let render: IRender<TestComponent>;

  beforeEach( angular.mock.module( TestModule ) );

  beforeEach( angular.mock.inject( ( $injector: ng.auto.IInjectorService ) => {

    const $compile = $injector.get<ng.ICompileService>( '$compile' );
    const $rootScope = $injector.get<ng.IRootScopeService>( '$rootScope' );
    const $scope = $rootScope.$new();

    render = renderFactory( $compile, $scope );

  } ) );

  it( `should render Hello Pluto!!!`, () => {

    const {compiledElement} = render(TestComponent);

    // now we need to get our tested component
    const { debugElement, componentInstance } = queryByDirective( compiledElement, AppComponent );

    expect( componentInstance instanceof AppComponent ).toBe( true );
    expect( debugElement.text() ).toContain( 'Hello from Pluto!!!' );

  } );


} );

/**
 * helper for getting tested components
 * - this is just temporary and will be removed when it's part if ngMetadata
 */
export function queryByDirective<T extends Function>( host: ng.IAugmentedJQuery, Type: T ) {
  const ctrlName = getInjectableName( Type );
  const selector = kebabCase( ctrlName );
  const debugElement = host.find( selector );
  const componentInstance = debugElement.controller( ctrlName ) as T;

  return { debugElement, componentInstance };
}
