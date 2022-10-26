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

        $scope.operationsColumns = [
            {
                title: $filter('translate')('Operation'),
                index: 'operation_text',
            },
            {
                title: $filter('translate')('ID'),
                index: 'operation_id',
            },
            {
                title: $filter('translate')('Date and time'),
                index: 'time',
                hidden: ['xs']
            },
            {
                title: $filter('translate')('Block'),
                index: 'block_num',
                hidden: ['xs', 'sm']
            },
            {
                title: $filter('translate')('Type'),
                index: 'type',
                hidden: ['xs', 'sm', 'md']
            }
        ];
        
        $scope.userOpenedFirstPageTime = null;

        $scope.select = function(page_operations) {
            const page = page_operations -1;
            const limit = 20;
            const from = page * limit;
            
            if(page_operations === 1 || !$scope.userOpenedFirstPageTime) { // if user switches back from page Y (Y>1) to page 1 we need to fetch new transactions and update time range
                $scope.userOpenedFirstPageTime = new Date();
            }
            
            const date_to = $scope.userOpenedFirstPageTime.toISOString();

            $scope.operationsLoading = true;
            $scope.operationsLoadingError = false;
            networkService.getLastOperations(limit, from, date_to, function (returnData) {
                $scope.operationsLoading = false;
                $scope.operations = returnData;
                $scope.currentPage = page_operations;
                if (page_operations == 1) {
                    if (returnData.length > 0) {
                        $scope.total_ops = returnData[0].operation_id_num;
                    } else {
                        $scope.total_ops = 0;
                    }
                }
            }).catch(err => {
                $scope.operationsLoadingError = true;
            });
        };
        $scope.select(1);

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
