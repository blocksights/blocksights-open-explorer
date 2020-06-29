(function () {
    'use strict';

    angular.module('app.assets')
        .controller('assetsCtrl', ['$scope', '$routeParams', '$location', 'utilities', 'assetService', 'chartService', '$filter',
            'marketService', 'Notify', assetsCtrl]);

    function assetsCtrl($scope, $routeParams, $location, utilities, assetService, chartService, $filter, marketService, Notify) {

		const path = $location.path();
		let name = $routeParams.name;
		if(name) {
		    name = name.toUpperCase();
            if(path.includes("assets")) {

                assetService.getAssetFull(name, function (returnData) {
                    $scope.data = returnData;
                    assetService.getAssetHoldersCount(name, function (returnDataHolders) {
                        $scope.data.holders = returnDataHolders;
                    });
                    const precision = returnData.precision;
                    assetService.getAssetHolders(name, precision, function (returnDataHolders) {
                        $scope.accounts = returnDataHolders;
                    }).catch(() => {
                        $scope.accounts = 'error';
                    });
                });
                marketService.getAssetMarkets(name, function (returnData) {
                    $scope.markets = returnData;
                }).catch(() => {
                    $scope.markets = 'error';
                });
            }
            utilities.columnsort($scope, "volume", "sortColumn", "sortClass", "reverse", "reverseclass", "column");
            utilities.columnsort($scope, "amount", "sortColumn2", "sortClass2", "reverse2", "reverseclass2", "column");
		}
		else {
            if(path === "/assets") {

                assetService.getDexVolume(function (returnData) {
                    $scope.dynamic = returnData;
                });

                $scope.dex_volume_chart = chartService.loadingChart();
                chartService.dailyDEXChart().then(function (returnData) {
                    $scope.dex_volume_chart = returnData;
                }).catch(() => {
                    $scope.dex_volume_chart = chartService.noDataChart($filter('translate')('No data about volume'));
                    showLoadingErrorNotification();
                });

                assetService.getActiveAssets(function (returnData) {
                    $scope.assets = returnData;
                }).catch(() => {
                    $scope.assets = 'error';
                });

                utilities.columnsort($scope, "volume", "sortColumn", "sortClass", "reverse", "reverseclass", "column");
            }
		}
    
        function showLoadingErrorNotification() {
            Notify.error({
                key: 'assetsError',
                message: 'Request to the server failed',
                allowMultiple: false,
            });
        }
		
    }

})();
