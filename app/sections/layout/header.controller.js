(function () {
    'use strict';

    angular.module('app.header')
        .controller('headerCtrl', ['$scope', '$filter', '$routeParams', '$location', '$http', 'appConfig', headerCtrl]);

    function headerCtrl($scope, $filter, $routeParams, $location, $http, appConfig) {
        $scope.blockchain = appConfig.branding.name;
        
        const watcher = $scope.$watch(() => appConfig.branding.name, () => {
            $scope.blockchain = appConfig.branding.name;
        })
        
        $scope.$on('$destroy', () => {
            watcher();
        });
    }

})();
