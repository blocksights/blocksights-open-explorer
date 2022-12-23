(function () {
    'use strict';

    angular.module('app')
        .config(['$routeProvider', 'ApiProvider', function($routeProvider, ApiProvider) {
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
            
            const redirectTo = (params,url) => {
                // the idea of this script is to keep always "?network={network}" in user's url
                // if he surfing on a testnet blockchain
                const activeBlockchain = ApiProvider.getActiveBlockchain();
                
                if(url.indexOf('?network') === -1 && activeBlockchain.key === 'testnet') {
                    return `${url}?network=testnet`
                }
            }
            
            function getRouteParams(params) {
                return {
                    ...params,
                    redirectTo
                }
            }

            $routeProvider
                .when('/', {redirectTo: '/dashboard'})
                .when('/dashboard', getRouteParams({templateUrl: 'html/dashboard.html'}))

                .when('/assets', getRouteParams({templateUrl: 'html/assets.html'}))
                .when('/assets/:name', getRouteParams({templateUrl: 'html/asset.html'}))

                .when('/blocks', getRouteParams({templateUrl: 'html/blocks.html'}))
                .when('/blocks/:name', getRouteParams({templateUrl: 'html/block.html'}))

                .when('/objects/:name', getRouteParams({templateUrl: 'html/object.html'}))

                .when('/operations', getRouteParams({templateUrl: 'html/operations.html'}))
                .when('/operations/:name', getRouteParams({templateUrl: 'html/operation.html'}))

                .when('/404', getRouteParams({templateUrl: 'html/404.html'}))

                .when('/accounts', getRouteParams({templateUrl: 'html/accounts.html'}))
                .when('/accounts/:name', getRouteParams({templateUrl: 'html/account.html'}))

                .when('/fees', getRouteParams({templateUrl: 'html/fees.html'}))
                .when('/witness', getRouteParams({templateUrl: 'html/witnesses.html'}))
                .when('/witness/:name', getRouteParams({templateUrl: 'html/witness.html'}))
                .when('/workers', getRouteParams({templateUrl: 'html/workers.html'}))
                .when('/votes', getRouteParams({templateUrl: 'html/voting.html'}))
                .when('/committee_members', getRouteParams({templateUrl: 'html/committee_members.html'}))
                .when('/proxies', getRouteParams({templateUrl: 'html/proxies.html'}))

                .when('/search', getRouteParams({templateUrl: 'html/search.html'}))

                .when('/markets', getRouteParams({templateUrl: 'html/markets.html'}))
                .when('/markets/:name/:name2', getRouteParams({templateUrl: 'html/market.html'}))

                .when('/txs', getRouteParams({templateUrl: 'html/txs.html'}))
                .when('/txs/:name', getRouteParams({templateUrl: 'html/tx.html'}))

                .when('/pools', getRouteParams({templateUrl: 'html/pools.html', reloadOnSearch: false}))
                .when('/pools/:name', getRouteParams({templateUrl: 'html/pool.html'}))
                
                .when('/credit-offers', getRouteParams({templateUrl: 'html/credit_offers.html'}))
                .when('/credit-offers/:name', getRouteParams({templateUrl: 'html/credit_offer.html'}))

                .when('/welcome', getRouteParams({templateUrl: 'html/welcome.html'}))

                .otherwise({ redirectTo: '/404'});

        }]
    );

})();
