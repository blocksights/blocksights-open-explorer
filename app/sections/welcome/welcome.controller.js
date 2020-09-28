(function () {
    'use strict';

    angular.module('app.search')
        .controller('welcomeCtrl', ['$scope', '$filter', '$routeParams', '$location', '$http', 'appConfig', welcomeCtrl]);

    function welcomeCtrl($scope, $filter, $routeParams, $location, $http, appConfig) {

        $scope.branding = appConfig.branding;
        $scope.supportedBy = appConfig.globalConfig.supportedBy;
        $scope.submit = function() {
            if ($scope.block)
                $location.path('/blocks/' + $scope.block + '/');
            else if ($scope.account)
                $location.path('/accounts/' + $scope.account + '/');
            else if ($scope.object)
                $location.path('/objects/' + $scope.object + '/');
            else if ($scope.asset)
                $location.path('/assets/' + $scope.asset + '/');
            else if ($scope.tx)
                $location.path('/txs/' + $scope.tx + '/');
        };
    }

})();
