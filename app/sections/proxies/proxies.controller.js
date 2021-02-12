(function () {
    'use strict';

    angular.module('app.proxies')
        .controller('proxiesCtrl', ['$scope', '$filter', '$routeParams', '$http', 'appConfig', 'utilities',
            proxiesCtrl]);

    function proxiesCtrl($scope, $filter, $routeParams, $http, appConfig, utilities) {

        $scope.proxiesColumns = [
            {
                title: $filter('translate')('Position'),
                index: 'position',
                sort: true,
                sortByDefault: true,
            },
            {
                title: $filter('translate')('Account'),
                index: 'account_name',
                sort: true,
            },
            {
                title: $filter('translate')('Voting Power'),
                index: 'power',
                sort: true,
            },
            {
                title: $filter('translate')('Followers'),
                index: 'followers',
                sort: true,
                hidden: ['xs']
            },
            {
                title: $filter('translate')('Percent of all active Voting Power'),
                index: 'perc',
                sort: true,
                hidden: ['xs']
            },

        ]

        $scope.proxiesLoading = true;
        $http.get(appConfig.urls.python_backend() + "/top_proxies").then(function(response) {
                let proxies = [];
                let counter = 1;
                angular.forEach(response.data, function(value, key) {
                    const parsed = {
                        position: counter,
                        account: value.id,
                        account_name: value.name,
                        power: utilities.formatBalance(value.voting_weight, 5),
                        followers: value.followers,
                        perc: value.voting_weight_percentage
                    };
                    if(counter <= 100)
                        proxies.push(parsed);
                    counter++;
                });
                $scope.proxies = proxies;
                $scope.proxiesLoading = false;
            }).catch(() => {
                $scope.proxiesLoadingError = true;
                $scope.proxies = 'error';
        });

        $scope.column = 'position';
        $scope.reverse = false;
        $scope.sortColumn = function(col){
            $scope.column = col;
            if($scope.reverse) {
                $scope.reverse = false;
                $scope.reverseclass = 'arrow-up';
            }
            else {
                $scope.reverse = true;
                $scope.reverseclass = 'arrow-down';
            }
        };
        $scope.sortClass = function(col) {
            if ($scope.column == col) {
                if ($scope.reverse) {
                    return 'arrow-down';
                } else {
                    return 'arrow-up';
                }
            } else {
                return '';
            }
        }
    }

})();
