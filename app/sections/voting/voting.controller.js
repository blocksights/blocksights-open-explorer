(function () {
    'use strict';

    angular.module('app.voting')
        .controller('votingCtrl', ['$scope', 'governanceService', votingCtrl]);

    function votingCtrl($scope, governanceService) {

        governanceService.getProxies(function (returnData) {
            $scope.proxies = returnData;
        }).catch(() => {
            $scope.proxies = 'error';
        });
        
        governanceService.getWitnessVotes(function (returnData) {
            $scope.witnesses = returnData;
        }).catch(() => {
            $scope.witnesses = 'error';
        });
        
        governanceService.getWorkersVotes(function (returnData) {
            $scope.workers = returnData;
        }).catch(() => {
            $scope.workers = 'error';
        });
        
        governanceService.getCommitteeVotes(function (returnData) {
            $scope.committee = returnData;
        }).catch(() => {
            $scope.committee = 'error';
        });
    }

})();
