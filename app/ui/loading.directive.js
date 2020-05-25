(function () {
    'use strict';
    
    angular.module('app.ui').directive('loading', Loading);
    
    function Loading() {
    
        return {
            restrict: 'E',
            template: '<span><img src="images/loading.svg" class=""/><span data-translate="Loading"></span></span>'
        }
        
    }
    
})();
