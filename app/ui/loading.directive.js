(function () {
    'use strict';
    
    angular.module('app.ui').directive('loading', Loading);
    
    function Loading() {
    
        return {
            restrict: 'E',
            scope: {
              stripImageHeight: '='
            },
            template: '<span><img src="images/loading.svg" ng-class="{inlineLoading: stripImageHeight}"/><span data-translate="Loading"></span></span>'
        }
        
    }
    
})();
