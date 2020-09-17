(function () {
    'use strict';

    angular.module('app.committee_members')
        .controller('committeeCtrl', ['$scope', '$filter', 'utilities', 'governanceService', committeeCtrl]);

    function committeeCtrl($scope, $filter, utilities, governanceService) {

        $scope.committeeColumns = [
            {
                title: $filter('translate')('Position'),
                index: 'counter',
                sort: true,
            },
            {
                title: $filter('translate')('ID'),
                index: 'id',
                sort: true,
            },
            {
                title: $filter('translate')('Account'),
                index: 'committee_member_account_name',
                sort: true,
            },
            {
                title: $filter('translate')('Url'),
                index: 'url',
                sort: true,
                hidden: ['xs'],
            },
            {
                title: $filter('translate')('Total votes'),
                index: 'total_votes',
                sort: true,
                sortByDefault: true,
                sortReverse: true,
            },
        ];

        $scope.committeeLoading = true;
        governanceService.getCommitteeMembers(function (returnData) {
            $scope.committeeLoading = false;
            $scope.active_committee = returnData[0];
            $scope.standby_committee = returnData[1];
        }).catch(() => {
            $scope.committeeLoadingError = true;
            $scope.active_committee = 'error';
            $scope.standby_committee = 'error';
        });

        utilities.columnsort($scope, "total_votes", "sortColumn", "sortClass", "reverse", "reverseclass", "column");
        utilities.columnsort($scope, "total_votes", "sortColumn2", "sortClass2", "reverse2", "reverseclass2", "column2");

    }
})();
