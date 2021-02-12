(function () {
    'use strict';

    angular.module('app.fees')
        .controller('feesCtrl', ['$scope', 'utilities', 'networkService', '$filter', feesCtrl]);

    function feesCtrl($scope, utilities, networkService, $filter) {

        $scope.feesColumns = [
            {
                title: $filter('translate')('ID'),
                index: 'identifier',
                sort: true,
                sortByDefault: true,
                sortReverse: true,
            },
            {
                title: $filter('translate')('Operation'),
                index: 'operation',
                sort: true,
            },
            {
                title: $filter('translate')('Basic'),
                index: 'basic_fee',
                sort: true,
                hidden: ['xs']
            },
            {
                title: $filter('translate')('Premium'),
                index: 'premium_fee',
                sort: true,
                hidden: ['xs']
            },
            {
                title: $filter('translate')('Price per KB'),
                index: 'price_per_kbyte',
                sort: true,
                hidden: ['xs', 'sm']
            },

        ]

        $scope.feesLoading = true;
        networkService.getFees(function (returnData) {
            $scope.feesLoading = false;
            $scope.fees = returnData;
        }).catch(() => {
            $scope.feesLoadingError = true;
            $scope.fees = 'error';
        });

        utilities.columnsort($scope, "identifier", "sortColumn", "sortClass", "reverse", "reverseclass", "column");

    }
})();
