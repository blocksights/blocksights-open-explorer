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
            showLoadingErrorNotification();
            $scope.dynamic = 'error'
        });

        $scope.branding = appConfig.branding;
        
        $scope.operationsColumns = [
            {
                title: $filter('translate')('Operation'),
                index: 'operation_text',
                html: (text) => text
            },
            {
                title: $filter('translate')('ID'),
                index: 'operation_id',
                html: (text) => `<a href='#/operations/${text}/'>${text}</a>`,
            },
            {
                title: $filter('translate')('Date and time'),
                index: 'time',
                // html: (text) => text
                hidden: ['xs']
            },
            {
                title: $filter('translate')('Block'),
                index: 'block_num',
                html: (text) => `<a href='#/blocks/${text}/'>${$filter('number')(text)}</a>`,
                hidden: ['xs', 'sm']
            },
            {
                title: $filter('translate')('Type'),
                index: 'type',
                html: (text, operation) => `<span class="badge badge-primary" style="background-color: #${operation.color};">${operation.type}</span>`,
                hidden: ['xs', 'sm', 'md']
            }
        ];

        $scope.select = function(page_operations) {
            const page = page_operations -1;
            const limit = 20;
            const from = page * limit;

            $scope.operationsLoading = true;
            networkService.getLastOperations(limit, from, function (returnData) {
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
                showLoadingErrorNotification();
            });
        };
        $scope.select(1);
        
        $scope.chartsData = {
            operations_chart: chartService.loadingChart(),
            proxies_chart: chartService.loadingChart(),
            markets_chart: chartService.loadingChart(),
            smartcoins_chart: chartService.loadingChart(),
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
                    }).catch(() => {
                        $scope.chartsData.operations_chart = chartService.noDataChart($filter('translate')('No data about operations'));
                        showLoadingErrorNotification();
                    });
                    
                }
                
            } else if (tabName == "proxies") {
                if(isChartLoading($scope.chartsData.proxies_chart)) {
    
                    chartService.topProxiesChart().then((returnData) => {
                        $scope.chartsData.proxies_chart = returnData;
                    }).catch(() => {
                        $scope.chartsData.proxies_chart = chartService.noDataChart($filter('translate')('No data about proxies'));
                        showLoadingErrorNotification();
                    });
                }
                
            } else if (tabName == "markets") {
                if(isChartLoading($scope.chartsData.markets_chart)) {

                    chartService.topMarketsChart().then((returnData) => {
                        $scope.chartsData.markets_chart = returnData;
                    }).catch(() => {
                        $scope.chartsData.markets_chart = chartService.noDataChart($filter('translate')('No data about markets'));
                        showLoadingErrorNotification();
                    });
                }
                
            } else if (tabName == "smartcoin") {
                if(isChartLoading($scope.chartsData.smartcoins_chart)) {
                    chartService.topSmartCoinsChart().then((returnData) => {
                        $scope.chartsData.smartcoins_chart = returnData;
                    }).catch(() => {
                        $scope.chartsData.smartcoins_chart = chartService.noDataChart($filter('translate')('No data about smartcoins'));
                        showLoadingErrorNotification();
                    });
                }
                
            } else if (tabName == "uia") {
                $scope.uias_chart = {options: {errorMsg: {text: loadingText, left: "center"}}};
    
                chartService.topUIAsChart().then((returnData) => {
                    $scope.uias_chart = returnData;
                }).catch(() => {
                    $scope.uias_chart = chartService._deprecated_noDataPieChart($filter('translate')('No data about UIAs'));
                    showLoadingErrorNotification();
                });
                
            } else if (tabName == "holders") {
                $scope.holders_chart = {options: {errorMsg: {text: loadingText, left: "center"}}};
                
                chartService.topHoldersChart().then((returnData) => {
                    $scope.holders_chart = returnData;
                }).catch(() => {
                    $scope.holders_chart = chartService._deprecated_noDataPieChart($filter('translate')('No data about holders'));
                    showLoadingErrorNotification();
                });
            }
        };

        // laod default tab
        $scope.currentTabIndex = 0;
        $scope.loadTabsCharts("operations");
        
        function showLoadingErrorNotification() {
            Notify.error({
                key: 'dashboardError',
                message: 'Request to the server failed',
                allowMultiple: false,
            });
        }
    }
})();
