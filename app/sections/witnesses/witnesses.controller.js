(function () {
    'use strict';

    angular.module('app.witnesses')
        .controller('witnessesCtrl', ['$scope', '$routeParams', '$location',  'utilities', 'governanceService', 'witnessService', 'chartService', 'Notify', witnessesCtrl]);

    function witnessesCtrl($scope, $routeParams, $location, utilities, governanceService, witnessService, chartService, Notify) {

        const path = $location.path();
        const name = $routeParams.name;

        if (name) {
            if (path.includes("witness")) {

                $scope.witness = {};
                $scope.next_tally = {};
                $scope.voters = [];

                $scope.blocksProducedChartData = chartService.loadingChart();

                $scope.loadWitnessDetails = loadWitnessDetails;

                loadWitnessDetails(1);
                loadWitnessBlocksProducedChartData();

                function loadWitnessBlocksProducedChartData() {
                    chartService.blocksProducedChart().then((returnData) => {
                        $scope.blocksProducedChartData = returnData;
                    }).catch(() => {
                        $scope.blocksProducedChartData = chartService.noDataChart();
                        showLoadingErrorNotification();
                    });
                }

                function loadWitnessDetails(page) {
                    const limit = 20;
                    const offset =  (page - 1) * limit;

                    $scope.votersLoading = true;
                    witnessService.getWitnessById(name, offset, limit).then((response) => {
                        $scope.votersLoading = false;
                        $scope.witness = response.witness;
                        $scope.next_tally = response.next_tally;
                        $scope.voters = response.voters;
                        $scope.votersTotalCount = response.voters.length;
                    }).catch(() => {
                        $scope.votersLoadingError = true;
                        showLoadingErrorNotification();
                    });
                }
            }
        }
        else {
            if (path === "/witness") {
                governanceService.getWitnesses(function (returnData) {
                    $scope.active_witnesses = returnData[0];
                    $scope.standby_witnesses = returnData[1];
                }).catch(() => {
                    $scope.active_witnesses = 'error';
                    $scope.standby_witnesses = 'error';
                });

                utilities.columnsort($scope, "total_votes", "sortColumn", "sortClass", "reverse", "reverseclass", "column");
                utilities.columnsort($scope, "total_votes", "sortColumn2", "sortClass2", "reverse2", "reverseclass2", "column2");
            }
        }

        function showLoadingErrorNotification() {
            Notify.error({
                key: 'witnessError',
                message: 'Request to the server failed',
                allowMultiple: false,
            });
        }

    }

})();
