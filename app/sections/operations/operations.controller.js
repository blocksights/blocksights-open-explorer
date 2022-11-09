(function () {
    'use strict';

    angular.module('app.operations')
        .controller('operationsCtrl', ['$scope', '$routeParams', '$location', 'networkService', operationsCtrl]);

    function operationsCtrl($scope, $routeParams, $location, networkService) {

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

            }
        }
    }
})();
