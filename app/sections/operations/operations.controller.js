(function () {
    'use strict';

    angular.module('app.operations')
        .controller('operationsCtrl', ['$scope', 'Notify', '$filter', '$routeParams', '$location', 'networkService', operationsCtrl]);

    function operationsCtrl($scope, Notify, $filter, $routeParams, $location, networkService) {

        const path = $location.path();
        const name = $routeParams.name;

        if(name) {
            if (path.includes("operations")) {
                networkService.getOperation(name, function (returnData) {
                    $scope.data = returnData;
                });
            }
        }
        else {
            if (path === "/operations") {

                $scope.operationsColumns = [
                    {
                        title: $filter('translate')('Operation'),
                        index: 'operation_text',
                    },
                    {
                        title: $filter('translate')('ID'),
                        index: 'operation_id',
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
                
                $scope.userOpenedFirstPageTime = null;

                $scope.select = function (page_operations) {
                    const page = page_operations - 1;
                    const limit = 50;
                    const from = page * limit;
                    
                    if(page_operations === 1 || !$scope.userOpenedFirstPageTime) { // if user switches back from page Y (Y>1) to page 1 we need to fetch new transactions and update time range
                        $scope.userOpenedFirstPageTime = new Date();
                    }
                    
                    const date_to = $scope.userOpenedFirstPageTime.toISOString();

                    $scope.operationsLoading = true;
                    networkService.getLastOperations(limit, from, date_to, function (returnData) {
                        $scope.operationsLoading = false;
                        $scope.operations = returnData;
                        $scope.currentPage = page_operations;
                        $scope.total_ops = 10000;
                    }).catch(err => {
                        $scope.operationsLoadingError = true;
                    });
                };
                $scope.select(1);
            }
        }
    }
})();
