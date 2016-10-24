
// we need to manually annotate DI
provideState.$inject = ['$routeProvider', '$mdThemingProvider'];
export function provideState($routeProvider, $mdThemingProvider) {
   // $mdThemingProvider.theme('default')
    //    .accentPalette('blue-grey');
    /*$mdThemingProvider.theme('default')
        .primaryPalette('purple')
        .accentPalette('blue-grey', {
              'default': '700' // use shade 200 for default, and keep all other shades the same
        });
*/
     $routeProvider
        .when('/room', {template: '<bt-meeting-room flex layout="column"></bt-meeting-room>'})
        .otherwise({redirectTo: '/room'});
}
