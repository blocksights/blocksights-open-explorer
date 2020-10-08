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

                $scope.blocksProducedChartData = chartService.loadingChart();

                $scope.loadWitnessDetails = loadWitness;

                loadWitness();
                loadWitnessVoters(1);
                loadWitnessBlocksProducedChartData();

                function loadWitnessBlocksProducedChartData() {
                    chartService.blocksProducedChart().then((returnData) => {
                        $scope.blocksProducedChartData = returnData;
                    }).catch((error) => {
                        $scope.blocksProducedChartData = chartService.noDataChart();
                    });
                }

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
