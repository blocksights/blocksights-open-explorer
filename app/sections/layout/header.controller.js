(function () {
    'use strict';

    angular.module('app.header')
        .controller('headerCtrl', ['$scope', '$filter', '$routeParams', '$location', '$http', 'appConfig', headerCtrl]);

    function headerCtrl($scope, $filter, $routeParams, $location, $http, appConfig) {
        $scope.blockchain = appConfig.branding.name;
    }

})();
