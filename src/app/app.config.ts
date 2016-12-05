
// we need to manually annotate DI
provideState.$inject = ['$routeProvider', '$mdThemingProvider'];
export function provideState($routeProvider, $mdThemingProvider) {
     $routeProvider
        .when('/room', {template: '<bt-meeting-room flex layout="column"></bt-meeting-room>'})
        .when('/signin', {template: '<bt-signin flex layout="column"></bt-signin>'})
        .otherwise({redirectTo: '/signin'});
}
