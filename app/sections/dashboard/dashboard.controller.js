(function () {
    'use strict';

    angular.module('app').controller('DashboardCtrl', ['$scope', '$timeout', '$window', 'networkService',
        'chartService', 'appConfig', '$filter', DashboardCtrl])

        .filter('to_trusted', ['$sce', function($sce){
            return function(text) {
                return $sce.trustAsHtml(text);
            };
        }]);

    function DashboardCtrl($scope, $timeout, $window, networkService, chartService, appConfig, $filter) {

        networkService.getHeader(function (returnData) {
            $scope.dynamic = returnData;
        }).catch(() => {
            $scope.dynamic = 'error'
        });

        $scope.branding = appConfig.branding;

        $scope.select = function(page_operations) {
            const page = page_operations -1;
            const limit = 20;
            const from = page * limit;

            networkService.getLastOperations(limit, from, function (returnData) {
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
                $scope.operations = "error";
            });
        };
        $scope.select(1);

        // lazy load on tab change
        $scope.loadTabsCharts = function(tabName) {
            
            const loadingText = $filter('translate')('Loading');
            
            if (tabName == "operations") {
                $scope.operations_chart = {options: {errorMsg: {text: loadingText, left: "center"}}};
                
                chartService.topOperationsChart().then((returnData) => {
                    $scope.operations_chart = returnData;
                }).catch(() => {
                    $scope.operations_chart = chartService.noDataPieChart($filter('translate')('No data about operations'));
                });
                
            } else if (tabName == "proxies") {
                $scope.proxies_chart = {options: {errorMsg: {text: loadingText, left: "center"}}};
                
                chartService.topProxiesChart().then((returnData) => {
                    $scope.proxies_chart = returnData;
                }).catch(() => {
                    $scope.proxies_chart = chartService.noDataPieChart($filter('translate')('No data about proxies'));
                });
                
            } else if (tabName == "markets") {
                $scope.markets_chart = {options: {errorMsg: {text: loadingText, left: "center"}}};
                
                chartService.topMarketsChart().then((returnData) => {
                    $scope.markets_chart = returnData;
                }).catch(() => {
                    $scope.markets_chart = chartService.noDataPieChart($filter('translate')('No data about markets'));
                });
                
            } else if (tabName == "smartcoin") {
                $scope.smartcoins_chart = {options: {errorMsg: {text: loadingText, left: "center"}}};
    
                chartService.topSmartCoinsChart().then((returnData) => {
                    $scope.smartcoins_chart = returnData;
                }).catch(() => {
                    $scope.smartcoins_chart = chartService.noDataPieChart($filter('translate')('No data about smartcoins'));
                });
                
            } else if (tabName == "uia") {
                $scope.uias_chart = {options: {errorMsg: {text: loadingText, left: "center"}}};
    
                chartService.topUIAsChart().then((returnData) => {
                    $scope.uias_chart = returnData;
                }).catch(() => {
                    $scope.uias_chart = chartService.noDataPieChart($filter('translate')('No data about UIAs'));
                });
                
            } else if (tabName == "holders") {
                $scope.holders_chart = {options: {errorMsg: {text: loadingText, left: "center"}}};
                
                chartService.topHoldersChart().then((returnData) => {
                    $scope.holders_chart = returnData;
                }).catch(() => {
                    $scope.holders_chart = chartService.noDataPieChart($filter('translate')('No data about holders'));
                });
            }
        };

        // laod default tab
        $scope.currentTabIndex = 0;
        $scope.loadTabsCharts("operations")
    }
})();
