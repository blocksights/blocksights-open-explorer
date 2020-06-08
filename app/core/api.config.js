(function() {
    'use strict';
    
    /**
     * Url regexp to cache
     * --
     * All requests will be cached till page reload
     * */
    
    const REQUESTS_TO_CACHE = [
        {
            urlRegexp: /openexplorer\/asset\?asset_id=/,
        },
        {
            urlRegexp: /openexplorer\/account_name\?account_id=/,
        }
    ];
    
    angular.module('app')
           .config(['$httpProvider', addHttpInterceptor])
           .factory('apiCache', ['$cacheFactory', apiCache]);
    
    
    /**
     * apiCache factory to store all the cached http requests on it
     */
    function apiCache($cacheFactory) {
        
        /**
         * apiCache to store all the cached http requests on it
         */
        const apiCache = $cacheFactory('api-cache');
    
        /**
         * @param {Object} config - $http config - https://code.angularjs.org/1.7.9/docs/api/ng/service/$http#usage
         */
        function cacheRequest(config) {
        
            const enableCacheForRequest = REQUESTS_TO_CACHE.some((request) => {
                const urlRegexp = request.urlRegexp;
            
                return urlRegexp.test(config.url);
            });
        
            // if cache is defined and its value is `false` the request shouldn't be cached
            // because config.cache has a top priority over caching control
        
            if((config.method === 'GET' || config.method === 'JSONP') && enableCacheForRequest && config.cache !== false) {
                // put apiCache factory as a cache instead of boolean value
                // to split cached requests by current script and default $http caching (for e.g. default caching of templates)
                config.cache = apiCache;
            }
        
            return config;
        }
        
        return {
            cacheRequest: cacheRequest
        };
    }
    
    /**
     * This function adds interceptor and it will be executed on each $http request
     */

    function addHttpInterceptor($httpProvider) {
        $httpProvider.interceptors.push(['apiCache', (apiCache) => {
            return {
                request: apiCache.cacheRequest
            }
        }]);
    }
    
})();
