(function () {
    'use strict';
    
    angular.module('app.ui').directive('loadingError', Loading);
    
    function Loading() {
        
        return {
            restrict: 'E',
            template: '<span><span data-translate="Data unavailable"></span></span>'
        }
        
    }
    
})();
