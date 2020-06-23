(function () {
    'use strict';

    angular.module('app.blocks')
        .controller('blocksCtrl', ['$scope', '$filter', '$routeParams', '$location', 'utilities',
            'networkService', blocksCtrl]);

    function blocksCtrl($scope, $filter, $routeParams, $location, utilities, networkService) {

        const path = $location.path();
        let name = $routeParams.name;
        if(name) {
            
            $scope.showRawData = false;
            
            name = name.toUpperCase();
            if(path.includes("blocks")) {

                networkService.getBlock(name, function (returnData) {
                    $scope.data = returnData;
                    $scope.transactions = {};
                    
                    if($scope.data && $scope.data.transactions) {
                        $scope.data.transactions.map((transaction) => {
                            
                            $scope.transactions[transaction.trx_id] = {
                              data: undefined,
                              operations: undefined,
                            };
                            
                            networkService.getTransaction(transaction.trx_id, function (trxData) {
                                $scope.transactions[transaction.trx_id] = {
                                    data: trxData.meta,
                                    operations: trxData.operations,
                                }
                            }).catch(() => {
                                $scope.transactions[transaction.trx_id] = {
                                    data: 'error',
                                    operations: 'error',
                                }
                            });
                        });
                    }
                    
                });
            }
        }
        else
        {
            if (path === "/blocks") {

                networkService.getBigBlocks(function (returnData) {
                    $scope.blocks = returnData;
                });

                utilities.columnsort($scope, "operations", "sortColumn", "sortClass", "reverse", "reverseclass",
                    "column");

            }
        }
    }
})();
