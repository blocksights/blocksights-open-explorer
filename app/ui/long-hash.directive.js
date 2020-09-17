(function () {
    'use strict';

    angular.module('app.ui').directive('longHash', longHash);

    function longHash() {

        return {
            replace: true,
            restrict: 'E',
            scope: {
                hash: '=',
                class: '@',
                style: '@',
                length: '=',
                href: '@',
            },
            templateUrl: 'html/long-hash.html',
            controller: ['$scope', ($scope) => {
                new ClipboardJS('.btn');

                const hashWatcher = $scope.$watch('hash', init);

                init();

                function init() {
                    let halfLength = Math.round(($scope.length || 16) / 2);
                    if($scope.hash) {
                        $scope.shortHash = $scope.hash.substr(0, halfLength) + '...' + $scope.hash.substr(-halfLength);
                    }
                }

                $scope.$on('$destroy', () => {
                    hashWatcher();
                });
            }]
        }

    }

})();
