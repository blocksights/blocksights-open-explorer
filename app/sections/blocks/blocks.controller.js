(function () {
    'use strict';

    angular.module('app.blocks')
        .controller('blocksCtrl', ['$scope', '$filter', '$routeParams', '$location', 'utilities', 'Notify',
            'networkService', blocksCtrl]);

    function blocksCtrl($scope, $filter, $routeParams, $location, utilities, Notify, networkService) {

        const path = $location.path();
        let name = $routeParams.name;
        if(name) {

            $scope.showRawData = false;

            name = name.toUpperCase();
            if(path.includes("blocks")) {

                $scope.blocksOperationsColumns = [
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

                $scope.blocksLoading = true
                $scope.blocksTransactionsLoading = {};
                $scope.blocksTransactionsLoadingError = {};
                networkService.getBlock(name, function (returnData) {
                    $scope.blocksOperationsLoading = false;
                    $scope.data = returnData;
                    $scope.transactions = {};

                    if($scope.data && $scope.data.transactions) {
                        $scope.data.transactions.map((transaction) => {

                            $scope.transactions[transaction.trx_id] = {
                              data: undefined,
                              operations: undefined,
                            };

                            $scope.blocksTransactionsLoading[transaction.trx_id] = true;
                            networkService.getTransaction(transaction.trx_id, function (trxData) {
                                $scope.blocksTransactionsLoading[transaction.trx_id] = false;
                                $scope.transactions[transaction.trx_id] = {
                                    data: trxData.meta,
                                    operations: trxData.operations,
                                }
                            }).catch(() => {
                                $scope.transactions[transaction.trx_id] = {
                                    data: 'error',
                                    operations: 'error',
                                }
                                $scope.blocksTransactionsLoadingError[transaction.trx_id] = true;
                            });
                        });
                    }

                });
            }
        }
        else
        {
            if (path === "/blocks") {

                $scope.blocksColumns = [
                    {
                        title: $filter('translate')('Block number'),
                        index: 'block_num',
                        sort: true,
                    },
                    {
                        title: $filter('translate')('Date'),
                        index: 'timestamp',
                        sort: true,
                    },
                    {
                        title: $filter('translate')('Transactions'),
                        index: 'transactions',
                        sort: true,
                        hidden: ['xs']
                    },
                    {
                        title: $filter('translate')('Operations'),
                        index: 'operations',
                        sort: true,
                        sortByDefault: true,
                        sortReverse: true,
                    },
                ]

                $scope.blocksLoading = true;
                networkService.getBigBlocks().then((returnData) => {
                    $scope.blocksLoading = false;
                    $scope.blocks = returnData;
                }).catch(() => {
                    $scope.blocksLoadingError = true;
                });

                utilities.columnsort($scope, "operations", "sortColumn", "sortClass", "reverse", "reverseclass",
                    "column");

            }
        }
    }
})();
