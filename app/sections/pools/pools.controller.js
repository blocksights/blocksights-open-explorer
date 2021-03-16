(function () {
    'use strict';

    angular.module('app.pools')
        .controller('poolsCtrl', ['$scope', '$route', '$routeParams', '$location', '$filter', 'utilities', 'marketService',
            'chartService', 'appConfig',  poolsCtrl])
        .filter('to_trusted', ['$sce', function($sce){
            return function(text) {
                return $sce.trustAsHtml(text);
            };
        }]);

    function mapPool(item, utilities, base) {
        let price = item.details.price_sell_a_per_percent[1] ? parseFloat(item.details.price_sell_a_per_percent[1].toPrecision(5)) : "-";
        try {
            return {
                id_float: parseInt(item.id.split(".")[2]),
                pair: item.details.asset_a.symbol + "/" + item.details.asset_b.symbol,
                asset_a: utilities.formatBalance(item.details.asset_a.float) + " " + item.details.asset_a.symbol,
                asset_a_symbol: item.details.asset_a.symbol,
                asset_a_float: item.details.asset_a.float,
                asset_b: utilities.formatBalance(item.details.asset_b.float) + " " + item.details.asset_b.symbol,
                asset_b_symbol: item.details.asset_b.symbol,
                asset_b_float: item.details.asset_b.float,
                value_in_core: item.details.value_in_core,
                total_withdraw_value_in_core: item.details.share_asset.value.total_withdraw_value_in_core,
                share_asset_symbol: item.details.share_asset.symbol,
                share_asset_float: item.details.share_asset.float,
                share_asset: utilities.formatBalance(item.details.share_asset.float) + " " + item.details.share_asset.symbol,
                share_asset_holders: item.details.share_asset.holders,
                price_sell_a_float: price == "-" ? 0 : price,
                price_sell_a_unit: item.details.price_sell_a_per_percent.unit,
                price_sell_a: utilities.formatBalance(price) + " " + item.details.price_sell_a_per_percent.unit,
                volume_a_24h: item.details.ticker.volume_a_24h,
                volume_b_24h: item.details.ticker.volume_b_24h,
                total_volume_24h_in_core: item.details.ticker.volume_b_24h,
                apy_24h_in_core: utilities.formatBalance(!item.details.ticker.apy_24h_in_core ? 0 : item.details.ticker.apy_24h_in_core),
                apy_24h_in_core_float: !item.details.ticker.apy_24h_in_core ? 0 : item.details.ticker.apy_24h_in_core,
                apy_in_core: utilities.formatBalance(item.details.ticker.apy_in_core),
                activity: item.details.activity,
                score: item.details.score,
                baseSymbol: base
            }
        } catch (e) {
            console.error(e);
            throw e;
        }
    }

    function poolsCtrl($scope, $route, $routeParams, $location, $filter, utilities, marketService, chartService, appConfig) {

        const path = $location.path();
        let name = $routeParams.name;

        $scope.baseSymbol = appConfig.branding.coreSymbol;

        if(name) {
            if (path.includes("pools")) {
                $scope.loading = true;
                marketService.getLiquidityPool(name, function (item) {
                    $scope.loading = false;
                    $scope.pool = {
                        id: item.id,
                        ...item,
                        ...mapPool(item, utilities, $scope.baseSymbol)
                    };
                    $scope.total_ops = item.statistics.total_deposit_count + item.statistics.total_exchange_a2b_count + item.statistics.total_exchange_b2a_count + item.statistics.total_withdrawal_count;

                    $scope.pool.asset_a_link = $filter('translateWithLinks')('Asset Link', {
                        assetLink: {
                            text: $scope.pool.asset_a_symbol,
                            href: `/#/assets/${$scope.pool.asset_a_symbol}`
                        }
                    });

                    // laod default tab
                    $scope.loadTabsCharts("price_chart");
                }).catch(() => {
                    $scope.loadingError = true;
                });
                // lazy load on tab change
                $scope.chartsData = {
                    depth_chart: chartService.loadingChart(),
                    balance_chart: chartService.loadingChart()
                }
                $scope.loadTabsCharts = function(tabName) {
                    const isChartLoading = (chartDataItem) => {
                        return chartDataItem && !chartDataItem.series;
                    };
                    if (tabName == "depth_chart") {
                        if(isChartLoading($scope.chartsData.depth_chart)) {
                            chartService.depthChart($scope.pool).then((returnData) => {
                                $scope.chartsData.depth_chart = returnData;
                            }).catch((error) => {
                                $scope.chartsData.depth_chart = chartService.noDataChart($filter('translate')('No data'));
                            });
                        }
                    } else if (tabName == "price_chart") {
                        chartService.PoolTradingView($scope.pool.id);
                    } else if (tabName == "balance_chart") {
                        if(isChartLoading($scope.chartsData.balance_chart)) {
                            chartService.balanceChart($scope.pool).then((returnData) => {
                                $scope.chartsData.balance_chart = returnData;
                            }).catch((error) => {
                                $scope.chartsData.balance_chart = chartService.noDataChart($filter('translate')('No data'));
                            });
                        }
                    }
                };

                $scope.operationsColumns = [
                    {
                        title: $filter('translate')('Operation'),
                        index: 'operation_text',
                    },
                    {
                        title: $filter('translate')('ID'),
                        index: 'operation_id'
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
                $scope.select = function(page_operations) {
                    const page = page_operations - 1;
                    const limit = 20;
                    const from = page * limit;

                    $scope.operationsLoading = true;
                    $scope.operationsLoadingError = false;
                    marketService.getLiquidityPoolHistory(name, limit, from, function (returnData) {
                        $scope.operationsLoading = false;
                        $scope.operations = returnData;
                        $scope.currentPage = page_operations;
                    }).catch(err => {
                        $scope.operationsLoadingError = true;
                        throw err;
                    });
                }
                $scope.select(1);
            }
        }
        else {
            if(path === "/pools") {
                $scope.columns = [
                    {
                        title: 'ID',
                        index: 'id',
                        sortingIndex: 'id_float',
                        sort: true,
                    },
                    {
                        title: 'Pair',
                        index: 'pair',
                        sort: true,
                    },
                    {
                        title: 'Daily Percentage Yield (DPY)',
                        index: 'apy_24h_in_core',
                        sortingIndex: 'apy_24h_in_core_float',
                        sortByDefault: true,
                        sortReverse: true,
                        sort: true,
                    },
                    {
                        title: 'Total Value Locked (TVL)',
                        index: 'value_in_core',
                        sort: true,
                    },
                    {
                        title: '24h Volume',
                        index: 'total_volume_24h_in_core',
                        sort: true,
                    },
                    {
                        title: '24h Score',
                        index: 'score',
                        sort: true,
                        hidden: ['xs', 'sm', 'md']
                    },
                    {
                        title: 'Asset A',
                        index: 'asset_a',
                        sortingIndex: 'asset_a_float',
                        sort: true,
                        hidden: ['xs', 'sm', 'md', 'lg']
                    },
                    {
                        title: 'Asset B',
                        index: 'asset_b',
                        sortingIndex: 'asset_b_float',
                        sort: true,
                        hidden: ['xs', 'sm', 'md', 'lg']
                    },
                    {
                        title: 'Price',
                        index: 'price_sell_a',
                        sortingIndex: 'price_sell_a_float',
                        sort: true,
                        hidden: ['xs', 'sm', 'md']
                    },
                    {
                        title: 'Pool Bit',
                        index: 'share_asset',
                        sortingIndex: 'share_asset_float',
                        sort: true,
                        hidden: ['xs', 'sm', 'md', 'lg']
                    },
                    {
                        title: 'Pool Bit Holders',
                        index: 'share_asset_holders',
                        sort: true,
                        hidden: ['xs', 'sm', 'md', 'lg']
                    },
                    {
                        title: '24h Activity',
                        index: 'activity',
                        sort: true,
                        sortReverse: true,
                        hidden: ['xs', 'sm', 'md', 'lg']
                    },
                    {
                        title: 'Taker Fee',
                        index: 'taker_fee_percent',
                        sort: true,
                        hidden: ['xs', 'sm', 'md', 'lg']
                    },
                    {
                        title: 'Withdrawal Fee',
                        index: 'withdrawal_fee_percent',
                        sort: true,
                        hidden: ['xs', 'sm', 'md', 'lg']
                    }
                ];
                // if user navigated here with a ?search parameter, use that one
                $scope.updateSearchParam = () => {
                    if (!!$scope.search) {
                        $route.updateParams({search: $scope.search});
                    } else {
                        $location.search({});
                    }
                };
                $scope.search = $routeParams.search;
                $scope.listLoading = true;
                marketService.getLiquidityPools(function (returnData) {
                    $scope.listLoading = false;
                    $scope.listItems = returnData.map(item => {
                        return {
                            id: item.id,
                            ...item,
                            ...mapPool(item, utilities, $scope.baseSymbol)
                        }
                    });
                }).catch(() => {
                    $scope.listLoadingError = true;
                });
            }
        }
    }

})();
