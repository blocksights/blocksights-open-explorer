(function () {
    'use strict';

    angular.module('app.txs')
        .controller('txsCtrl', ['$scope', '$filter', '$routeParams', '$location', 'networkService', txsCtrl]);

    function txsCtrl($scope, $filter, $routeParams, $location, networkService) {

        const path = $location.path();
        const name = $routeParams.name;

        if(name) {
            if (path.includes("txs")) {

                $scope.transactionOperationsColumns = [
                    {
                        title: $filter('translate')('Operation'),
                        index: 'operation_text'
                    },
                    {
                        title: $filter('translate')('ID'),
                        index: 'operation_id',
                        hidden: ['xs', 'sm', 'md']
                    },
                    {
                        title: $filter('translate')('Type'),
                        index: 'op_type'
                    },
                ]

                $scope.transactionLoading = true;
                networkService.getTransaction(name, function (returnData) {
                    $scope.transactionLoading = false;
                    $scope.data = returnData.meta;
                    $scope.operations = returnData.operations;
                    $scope.count = returnData.operations.length;
                }).catch(() => {
                    $scope.transactionLoadingError = true;
                    $scope.operations = 'error';
                });
            }
        }
        else {
            if (path === "/txs") {
                const ofLastHours = 24;
                $scope.ofLastHours = ofLastHours;
                networkService.getBigTransactions(function (returnData) {
                    $scope.transactions = returnData;
                }, ofLastHours).catch(() => {
                    $scope.transactions = 'error';
                });
            }
        }
    }

})();
