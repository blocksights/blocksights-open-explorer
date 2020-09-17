(function () {
    'use strict';

    angular.module('app.workers')
        .controller('workersCtrl', ['$scope', '$filter', 'utilities', 'governanceService', 'appConfig', workersCtrl]);

    function workersCtrl($scope, $filter, utilities, governanceService, appConfig) {

        $scope.workersColumns = [
            {
                title: $filter('translate')('Name'),
                index: 'name',
                sort: true,
            },
            {
                title: $filter('translate')('Worker'),
                index: 'worker_name',
                sort: true,
                hidden: ['xs']
            },
            {
                title: $filter('translate')('Start'),
                index: 'start',
                sort: true,
                hidden: ['xs', 'sm', 'md']
            },
            {
                title: $filter('translate')('End'),
                index: 'end',
                sort: true,
                hidden: ['xs', 'sm', 'md']
            },
            {
                title: `${$filter('translate')('Daily pay')} (${appConfig.branding.coreSymbol})`,
                index: 'daily_pay',
                sort: true,
                hidden: ['xs']
            },
            {
                title: $filter('translate')('Url'),
                index: 'url',
                sort: true,
                hidden: ['xs', 'sm', 'md']
            },
            {
                title: $filter('translate')('Votes for'),
                index: 'votes_for',
                sort: true,
                sortByDefault: true,
                sortReverse: true,
                hidden: ['xs', 'sm', 'md']
            },
            {
                title: $filter('translate')('Funded'),
                index: 'perc',
                sort: true,
            },
        ];

        $scope.workersExpiredColumns = $scope.workersColumns.slice(0, -1);

        $scope.workersLoading = true;
        governanceService.getWorkers(function (returnData) {
            $scope.workersLoading = false;
            $scope.workers_current = returnData[0];
            $scope.workers_expired = returnData[1];
        }).catch(() => {
            $scope.workersLoadingError = true;
            $scope.workers_current = 'error';
            $scope.workers_expired = 'error';
        });

        utilities.columnsort($scope, "votes_for", "sortColumn", "sortClass", "reverse", "reverseclass", "column");
        utilities.columnsort($scope, "votes_for", "sortColumn2", "sortClass2", "reverse2", "reverseclass2", "column2");
    }

})();
