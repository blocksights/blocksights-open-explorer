(function () {
    'use strict';

    angular.module('app').controller('HTTPErrorHandlerModalCtrl', ['$scope', '$location', HTTPErrorHandlerModalCtrl]);

    function HTTPErrorHandlerModalCtrl($scope, $location) {

        /*
        * This is a controller for http-error-handler-modal
        * You can do any logic's manipulations here ... :)
        */

        function goTo(target) {
            $scope.$close(target)
        }

        $scope.goTo = goTo;

    }

})();
