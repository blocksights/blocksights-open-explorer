(function () {
    'use strict';

    angular.module('app').controller('DashboardCtrl', ['$scope', 'Notify', '$timeout', '$window', 'networkService',
        'chartService', 'appConfig', '$filter', DashboardCtrl])

        .filter('to_trusted', ['$sce', function($sce){
            return function(text) {
                return $sce.trustAsHtml(text);
            };
        }]);

    function DashboardCtrl($scope, Notify, $timeout, $window, networkService, chartService, appConfig, $filter) {

        networkService.getHeader(function (returnData) {
            $scope.dynamic = returnData;
        }).catch(() => {
            $scope.dynamic = 'error'
        });

        $scope.branding = appConfig.branding;
        
        $scope.chartsData = {
            operations_chart: chartService.loadingChart(),
            proxies_chart: chartService.loadingChart(),
            markets_chart: chartService.loadingChart(),
            smartcoins_chart: chartService.loadingChart(),
            uias_chart: chartService.loadingChart(),
            holders_chart: chartService.loadingChart(),
        };

        // lazy load on tab change
        $scope.loadTabsCharts = function(tabName) {

            const loadingText = $filter('translate')('Loading');

            const isChartLoading = (chartDataItem) => {
                return chartDataItem && !chartDataItem.series;
            };

            if (tabName == "operations") {

                if(isChartLoading($scope.chartsData.operations_chart)) {

                    chartService.topOperationsChart().then((returnData) => {
                        $scope.chartsData.operations_chart = returnData;
                    }).catch((error) => {
                        $scope.chartsData.operations_chart = chartService.noDataChart($filter('translate')('No data about operations'));
                    });

                }

            } else if (tabName == "proxies") {
                if(isChartLoading($scope.chartsData.proxies_chart)) {

                    chartService.topProxiesChart().then((returnData) => {
                        $scope.chartsData.proxies_chart = returnData;
                    }).catch((error) => {
                        $scope.chartsData.proxies_chart = chartService.noDataChart($filter('translate')('No data about proxies'));
                    });
                }

            } else if (tabName == "markets") {
                if(isChartLoading($scope.chartsData.markets_chart)) {

                    chartService.topMarketsChart().then((returnData) => {
                        $scope.chartsData.markets_chart = returnData;
                    }).catch((error) => {
                        $scope.chartsData.markets_chart = chartService.noDataChart($filter('translate')('No data about markets'));
                    });
                }

            } else if (tabName == "smartcoin") {
                if(isChartLoading($scope.chartsData.smartcoins_chart)) {
                    chartService.topSmartCoinsChart().then((returnData) => {
                        $scope.chartsData.smartcoins_chart = returnData;
                    }).catch((error) => {
                        $scope.chartsData.smartcoins_chart = chartService.noDataChart($filter('translate')('No data about smartcoins'));
                    });
                }

            } else if (tabName == "uia") {
                if(isChartLoading($scope.chartsData.uias_chart)) {
                    chartService.topUIAsChart().then((returnData) => {
                        $scope.chartsData.uias_chart = returnData;
                    }).catch((error) => {
                        $scope.chartsData.uias_chart = chartService.noDataChart($filter('translate')('No data about UIAs'));
                    });
                }

            } else if (tabName == "holders") {
                if(isChartLoading($scope.chartsData.holders_chart)) {
                    chartService.topHoldersChart().then((returnData) => {
                        $scope.chartsData.holders_chart = returnData;
                    }).catch((error) => {
                        $scope.chartsData.holders_chart = chartService.noDataChart($filter('translate')('No data about holders'));
                    });
                }
            }
        };

        // laod default tab
        $scope.loadTabsCharts("operations");

    }
})();
