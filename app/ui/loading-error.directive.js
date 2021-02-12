(function () {
    'use strict';
    
    angular.module('app.ui').directive('loadingError', Loading);
    
    function Loading() {
        
        return {
            scope: {
                text: '='
            },
            restrict: 'E',
            template: `<span>
                           <span ng-if="text !== undefined">{{text}}</span>
                           <span ng-if="text === undefined" data-translate="Data unavailable"></span>
                       </span>`
        }
        
    }
    
})();
