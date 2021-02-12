(function () {
    'use strict';

    angular.module('app.witnesses')
        .controller('witnessesCtrl', ['$scope', '$filter', '$routeParams', '$location',  'utilities', 'governanceService', 'witnessService', 'chartService', 'Notify', witnessesCtrl]);

    function witnessesCtrl($scope, $filter, $routeParams, $location, utilities, governanceService, witnessService, chartService, Notify) {

        const path = $location.path();
        const name = $routeParams.name;

        if (name) {
            if (path.includes("witness")) {

                $scope.witness = {};
                $scope.next_tally = {};
                $scope.voters = [];

                $scope.loadWitnessDetails = loadWitness;

                loadWitness();
                loadWitnessVoters(1);

                function loadWitness() {
                    witnessService.getWitnessById(name).then((response) => {
                        $scope.witness = response.witness;
                        $scope.nextTally = response.nextTally;
                    });
                }

                function loadWitnessVoters(page) {
                    const limit = 20;
                    const offset =  (page - 1) * limit;

                    $scope.votersLoading = true;
                    witnessService.getWitnessVoters(name, offset, limit).then((response) => {
                        $scope.votersLoading = false;
                        $scope.voters = response.voters;
                        $scope.tally = response.tally;
                        $scope.votersTotalCount = response.voters.length;
                    }).catch((err) => {
                        $scope.votersLoadingError = true;
                    });
                }

                $scope.chartsData = {
                    blocks_produced: chartService.loadingChart(),
                    price_feed: chartService.loadingChart(),
                };

                // lazy load on tab change
                $scope.loadTabsCharts = function(tabName) {

                    const loadingText = $filter('translate')('Loading');

                    const isChartLoading = (chartDataItem) => {
                        return chartDataItem && !chartDataItem.series;
                    };

                    if (tabName == "blocks_produced") {
                        if(isChartLoading($scope.chartsData.blocks_produced)) {
                            chartService.blocksProducedChart().then((returnData) => {
                                $scope.chartsData.blocks_produced = returnData;
                            }).catch((error) => {
                                $scope.chartsData.blocks_produced = chartService.noDataChart($filter('translate')('No block production data'));
                            });
                        }
                    } else if (tabName == "price_feed") {
                        if(isChartLoading($scope.chartsData.price_feed)) {
                            chartService.priceFeedChart($scope.witness.witness_account).then((returnData) => {
                                $scope.chartsData.price_feed = returnData;
                            }).catch((error) => {
                                $scope.chartsData.price_feed = chartService.noDataChart($filter('translate')('No price feed data'));
                            });
                        }

                    }
                };

                // laod default tab
                $scope.currentTabIndex = 0;
                $scope.loadTabsCharts("blocks_produced");


            }
        }
        else {
            if (path === "/witness") {

                $scope.witnessColumns = [
                    {
                        title: $filter('translate')('Position'),
                        index: 'counter',
                        sort: true,
                        sortByDefault: true
                    },
                    {
                        title: $filter('translate')('ID'),
                        index: 'id',
                        sort: true,
                    },
                    {
                        title: $filter('translate')('Name'),
                        index: 'witness_account_name',
                        sort: true,
                    },
                    {
                        title: $filter('translate')('Url'),
                        index: 'url',
                        sort: true,
                        hidden: ['xs', 'sm', 'md'],
                    },
                    {
                        title: $filter('translate')('Total votes'),
                        index: 'total_votes',
                        sort: true,
                        hidden: ['xs']
                    },
                    {
                        title: $filter('translate')('Missed'),
                        index: 'total_missed',
                        sort: true,
                        hidden: ['xs', 'sm'],
                    },
                    {
                        title: $filter('translate')('Last confirmed block'),
                        index: 'last_confirmed_block_num',
                        sort: true,
                        hidden: ['xs'],
                    },
                ]

                $scope.activeWitnessesLoading = true;
                $scope.activeWitnessesLoadingError = false;
                governanceService.getWitnesses("active").then((witnesses) => {
                    $scope.activeWitnessesLoading = false;
                    $scope.activeWitnesses = witnesses;
                }).catch(() => {
                    $scope.activeWitnessesLoadingError = true;
                    $scope.activeWitnesses = 'error';
                });

                $scope.standbyWitnessesLoading = true;
                $scope.standbyWitnessesLoadingError = false;
                governanceService.getWitnesses("standby").then((witnesses) => {
                    $scope.standbyWitnessesLoading = false;
                    $scope.standbyWitnesses = witnesses;
                }).catch(() => {
                    $scope.standbyWitnessesLoadingError = true;
                    $scope.standbyWitnesses = 'error';
                });
            }
        }
    }

})();
