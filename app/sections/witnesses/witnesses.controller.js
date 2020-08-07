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

                $scope.loadWitnessDetails = loadWitness;

                loadWitness();
                loadWitnessVoters(1);
                loadWitnessBlocksProducedChartData();

                function loadWitnessBlocksProducedChartData() {
                    chartService.blocksProducedChart().then((returnData) => {
                        $scope.blocksProducedChartData = returnData;
                    }).catch((error) => {
                        $scope.blocksProducedChartData = chartService.noDataChart();
                        showLoadingErrorNotification(error);
                    });
                }

                function loadWitness() {
                    witnessService.getWitnessById(name).then((response) => {
                        $scope.witness = response.witness;
                        $scope.nextTally = response.nextTally;
                    }).catch((err) => {
                        showLoadingErrorNotification(err);
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
                        showLoadingErrorNotification(err);
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

        function showLoadingErrorNotification(error) {
            console.error('Notification', 'Request to the server failed', error);
            let message = "";
            if (error) {
                if (error.status) {
                    message = error.status + " - " + error.data.detail
                }
            }
            Notify.error({
                key: 'witnessError',
                message: 'Request to the server failed' + (message ? ': ' + message : ''),
                allowMultiple: false,
            });
        }

    }

})();
