(function () {
    'use strict';

    angular.module('app.txs')
        .controller('txsCtrl', ['$scope', '$routeParams', '$location', 'networkService', txsCtrl]);

    function txsCtrl($scope, $routeParams, $location, networkService) {

        const path = $location.path();
        const name = $routeParams.name;

        if(name) {
            if (path.includes("txs")) {
                networkService.getTransaction(name, function (returnData) {
                    $scope.data = returnData.meta;
                    $scope.operations = returnData.operations;
                    $scope.count = returnData.operations.length;
                });
            }
        }
        else {
            if (path === "/txs") {
                const ofLastHours = 128;
                $scope.ofLastHours = ofLastHours;
                networkService.getBigTransactions(function (returnData) {
                    $scope.transactions = returnData;
                }, ofLastHours);
            }
        }
    }

})();
