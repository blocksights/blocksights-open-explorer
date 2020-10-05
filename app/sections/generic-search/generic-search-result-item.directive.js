(function () {
    'use strict';

    angular.module('app.generic-search')
        .directive('genericSearchResultItem', genericSearchResultItem)

    function genericSearchResultItem() {
        return {
            replace: true,
            scope:{
                'itemType': '=',
                'itemModel': '=',
                'onSelect': '=',
            },
            templateUrl: 'html/generic-search-result-item.html',
            controller: ['$scope', 'networkService', 'GenericSearchService', 'accountService', 'assetService', ($scope, networkService, GenericSearchService, accountService, assetService) => {

                $scope.TYPES = GenericSearchService.types;

                if($scope.itemModel && $scope.itemType)
                    init();

                function init() {
                    if($scope.itemType === GenericSearchService.types.OPERATION) {
                        networkService.getOperation($scope.itemModel && $scope.itemModel.identifier, (response) => {
                            $scope.data = response;
                        });
                    }

                    if($scope.itemType === GenericSearchService.types.ACCOUNT) {
                        //accountService.getAccountName($scope.itemModel.identifier, (response) => {
                        //    $scope.data = $scope.itemModel.name;
                        //});
                    }

                    if($scope.itemType === GenericSearchService.types.BLOCK) {
                        //networkService.getBlock($scope.itemModel && $scope.itemModel.identifier, (response) => {
                        //    $scope.data = response;
                        //})
                    }

                    if($scope.itemType === GenericSearchService.types.TRANSACTION) {
                        //networkService.getTransaction($scope.itemModel.identifier, (response) => {
                        //    $scope.data = {
                        //        ...response.meta,
                        //        operations_count: response.operations.length,
                        //    };
                        //});
                    }

                    if($scope.itemType === GenericSearchService.types.ASSET) {
                        //assetService.getAssetFull($scope.itemModel.identifier, (response) => {
                        //    $scope.data = response;
                        //});
                    }
                }
            }]
        }
    }
})();
