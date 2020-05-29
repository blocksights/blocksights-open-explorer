(function () {
    'use strict';

    angular.module('app.workers')
        .controller('workersCtrl', ['$scope', 'utilities', 'governanceService', 'appConfig', workersCtrl]);

    function workersCtrl($scope, utilities, governanceService, appConfig) {

        $scope.branding = appConfig.branding;

        governanceService.getWorkers(function (returnData) {
            $scope.workers_current = returnData[0];
            $scope.workers_expired = returnData[1];
        }).catch(() => {
            $scope.workers_current = 'error';
            $scope.workers_expired = 'error';
        });

        utilities.columnsort($scope, "votes_for", "sortColumn", "sortClass", "reverse", "reverseclass", "column");
        utilities.columnsort($scope, "votes_for", "sortColumn2", "sortClass2", "reverse2", "reverseclass2", "column2");
    }

})();
