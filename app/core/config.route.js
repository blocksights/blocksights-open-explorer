(function () {
    'use strict';

    angular.module('app')
        .config(['$routeProvider', function($routeProvider) {
            var routes, setRoutes;

            routes = [
                'dashboard', 'assets', 'fees', 'witness', 'votes', 'workers', 'charts', 'search', 'txs', 'accounts',
                'markets'
            ];

            setRoutes = function(route) {
                var config, url;
                url = '/' + route;
                config = {
                    templateUrl: '' + route + '.html'
                };
                $routeProvider.when(url, config);
                return $routeProvider;
            };

            routes.forEach(function(route) {
                return setRoutes(route);
            });

            $routeProvider
                .when('/', {redirectTo: '/dashboard'})
                .when('/dashboard', {templateUrl: 'html/dashboard.html'})

                .when('/assets', {templateUrl: 'html/assets.html'})
                .when('/assets/:name', {templateUrl: 'html/asset.html'})

                .when('/blocks', {templateUrl: 'html/blocks.html'})
                .when('/blocks/:name', {templateUrl: 'html/block.html'})

                .when('/objects/:name', {templateUrl: 'html/object.html'})

                .when('/operations', {templateUrl: 'html/operations.html'})
                .when('/operations/:name', {templateUrl: 'html/operation.html'})

                .when('/404', {templateUrl: 'html/404.html'})

                .when('/accounts', {templateUrl: 'html/accounts.html'})
                .when('/accounts/:name', {templateUrl: 'html/account.html'})

                .when('/fees', {templateUrl: 'html/fees.html'})
                .when('/witness', {templateUrl: 'html/witnesses.html'})
                .when('/witness/:name', {templateUrl: 'html/witness.html'})
                .when('/workers', {templateUrl: 'html/workers.html'})
                .when('/votes', {templateUrl: 'html/voting.html'})
                .when('/committee_members', {templateUrl: 'html/committee_members.html'})
                .when('/proxies', {templateUrl: 'html/proxies.html'})

                .when('/search', {templateUrl: 'html/search.html'})

                .when('/markets', {templateUrl: 'html/markets.html'})
                .when('/markets/:name/:name2', {templateUrl: 'html/market.html'})

                .when('/txs', {templateUrl: 'html/txs.html'})
                .when('/txs/:name', {templateUrl: 'html/tx.html'})

                .when('/pools', {templateUrl: 'html/pools.html', reloadOnSearch: false})
                .when('/pools/:name', {templateUrl: 'html/pool.html'})
                
                .when('/credit-offers', {templateUrl: 'html/credit_offers.html'})
                .when('/credit-offers/:name', {templateUrl: 'html/credit_offer.html'})

                .when('/welcome', {templateUrl: 'html/welcome.html'})

                .otherwise({ redirectTo: '/404'});

        }]
    );

})();
