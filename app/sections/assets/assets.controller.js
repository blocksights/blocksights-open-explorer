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

                $scope.activeMarketsColumns = [
                    {
                        title: $filter('translate')('Name'),
                        index: 'pair',
                        sort: true,
                    },
                    {
                        title: $filter('translate')('Price'),
                        index: 'price',
                        sort: true,
                        hidden: ['xs']
                    },
                    {
                        title: $filter('translate')('Volume'),
                        index: 'volume',
                        sort: true,
                        sortByDefault: true,
                        sortReverse: true,
                    },
                ];

                $scope.topHoldersColumns = [
                    {
                        title: $filter('translate')('Account'),
                        index: 'name',
                        sort: true,
                    },
                    {
                        title: $filter('translate')('Amount'),
                        index: 'amount_float',
                        sortingIndex: 'amount',
                        sort: true,
                        sortByDefault: true,
                        sortReverse: true,
                    },
                ];

                $scope.accountsLoading = true;
                assetService.getAssetFull(name, function (returnData) {
                    $scope.data = returnData;
                    assetService.getAssetHoldersCount(name, function (returnDataHolders) {
                        $scope.data.holders = returnDataHolders;
                    });
                    const precision = returnData.precision;
                    assetService.getAssetHolders(name, precision, function (returnDataHolders) {
                        $scope.accountsLoading = false;
                        $scope.accounts = returnDataHolders;
                    }).catch(() => {
                        $scope.accountsLoadingError = true;
                    });
                });

                $scope.marketsLoading = true;
                marketService.getAssetMarkets(name, function (returnData) {
                    $scope.marketsLoading = false;
                    $scope.markets = returnData;
                }).catch(() => {
                    $scope.marketsLoadingError = true;
                });
            }
            utilities.columnsort($scope, "volume", "sortColumn", "sortClass", "reverse", "reverseclass", "column");
            utilities.columnsort($scope, "amount", "sortColumn2", "sortClass2", "reverse2", "reverseclass2", "column");
		}
		else {
            if(path === "/assets") {

                $scope.columns = [
                    {
                        title: '',
                        index: 'image_url',
                        sort: true,
                    },
                    {
                        title: $filter('translate')('Name'),
                        index: 'name',
                        sort: true,
                    },
                    {
                        title: $filter('translate')('Price'),
                        index: 'price',
                        sort: true,
                    },
                    {
                        title: $filter('translate')('24 Hours') + ' ' + $filter('translate')('volume'),
                        index: 'volume',
                        sort: true,
                        sortByDefault: true,
                        sortReverse: true,
                    },
                    {
                        title: $filter('translate')('Type'),
                        index: 'type',
                        hidden: ['xs', 'sm', 'md'],
                        sort: true,
                    },

                    {
                        title: $filter('translate')('Market cap'),
                        index: 'market_cap',
                        hidden: ['xs'],
                        sort: true,
                    },
                    {
                        title: $filter('translate')('Supply'),
                        index:'supply',
                        hidden: ['xs', 'sm'],
                        sort: true,
                    },
                    {
                        title: $filter('translate')('Holders'),
                        index:  'holders',
                        hidden: ['xs', 'sm'],
                        sort: true,
                    },
                ];

                assetService.getDexVolume(function (returnData) {
                    $scope.dynamic = returnData;
                });

                $scope.dex_volume_chart = chartService.loadingChart();
                chartService.dailyDEXChart().then(function (returnData) {
                    $scope.dex_volume_chart = returnData;
                }).catch(() => {
                    $scope.dex_volume_chart = chartService.noDataChart($filter('translate')('No data about volume'));
                });

                $scope.assetsListLoading = true;
                assetService.getActiveAssets(function (returnData) {
                    $scope.assetsListLoading = false;
                    $scope.assets = returnData;
                }).catch(() => {
                    $scope.assetsListLoadingError = true;
                });

                utilities.columnsort($scope, "volume", "sortColumn", "sortClass", "reverse", "reverseclass", "column");
            }
		}
    }

})();
