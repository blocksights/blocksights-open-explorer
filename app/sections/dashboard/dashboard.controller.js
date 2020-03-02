(function () {
    'use strict';

    angular.module('app').controller('DashboardCtrl', ['$scope', '$timeout', '$window', 'networkService',
        'chartService', 'appConfig',  DashboardCtrl])

        .filter('to_trusted', ['$sce', function($sce){
            return function(text) {
                return $sce.trustAsHtml(text);
            };
        }]);

    function DashboardCtrl($scope, $timeout, $window, networkService, chartService, appConfig) {

        networkService.getHeader(function (returnData) {
            $scope.dynamic = returnData;
        });

        $scope.branding = appConfig.branding;

        $scope.select = function(page_operations) {
            const page = page_operations -1;
            const limit = 20;
            const from = page * limit;

            networkService.getLastOperations(limit, from, function (returnData) {
                $scope.operations = returnData;
                $scope.currentPage = page_operations;
                $scope.total_ops = 10000;
            });
        };
        $scope.select(1);

        // lazy load on tab change
        $scope.loadTabsCharts = function(tabName) {
            if (tabName == "operations") {
                chartService.topOperationsChart(function (returnData) {
                    $scope.operations_chart = returnData;
                });
            } else if (tabName == "proxies") {
                chartService.topProxiesChart(function (returnData) {
                    $scope.proxies_chart = returnData;
                });
            } else if (tabName == "markets") {
                chartService.topMarketsChart(function (returnData) {
                    $scope.markets_chart = returnData;
                });
            } else if (tabName == "smartcoin") {
                chartService.topSmartCoinsChart(function (returnData) {
                    $scope.smartcoins_chart = returnData;
                });
            } else if (tabName == "uia") {
                chartService.topUIAsChart(function (returnData) {
                    $scope.uias_chart = returnData;
                });
            } else if (tabName == "holders") {
                chartService.topHoldersChart(function (returnData) {
                    $scope.holders_chart = returnData;
                });
            }
        };

        // laod default tab
        $scope.currentTabIndex = 0;
        $scope.loadTabsCharts("operations")
    }
})();
