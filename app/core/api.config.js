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

        const failedUrlRequests = {};

        // to do not spam the same modals in case of multiple same http errors
        // track the visible modal and show only if modal is hidden
        const visibleModalsIds = {};

        // store notifications' scopes in these variables
        // to be able to remove notifications
        let notificationWarningScope;
        let notificationErrorScope;

        $httpProvider.interceptors.push(['apiCache', '$injector', '$q', '$timeout', '$filter', '$location', '$rootScope', (apiCache, $injector, $q, $timeout, $filter, $location, $rootScope) => {
            return {
                request: apiCache.cacheRequest,
                responseError: function (response) {

                    /* show in console failed requests and retry number */
                    const DISPLAY_IN_CONSOLE = false;

                    /* time to retry the request */
                    const REPLAY_IN_MS = 2000;

                    /* HTTP statuses to replay in case of error  */
                    const HTTP_STATUSES_TO_REPLAY = ['404'];

                    /* HTTP statuses to replay in case of error  */
                    /* Instruction to extend this list:
                    * 1) add the HTTP code and some modalId (whatever but string) in object below
                    * 2) go to http-error-handler-modal.html and copy-paste a template
                    * */
                    const HTTP_STATUSES_TO_SHOW_MODAL = {
                        429: 'PREMIUM'
                    };

                    /* MAX number of tries to replay the request*/
                    const REPLAY_MAX_TRIES = 3;

                    /* Time to hide error/warning notifications automatically. Default: 60 minutes */
                    const NOTIFICATION_AUTO_DISAPPEAR_DELAY = 1000 * 60 * 60;

                    function showModal(modalId) {
                        if(visibleModalsIds[modalId])
                            return;

                        visibleModalsIds[modalId] = true;

                        const $uibModal = $injector.get('$uibModal');

                        // create a scope to pass modalId and detect it on the template
                        const $scope = $rootScope.$new();

                        // assign modalId to the controller's scope
                        $scope.modalId = modalId;

                        const modal = $uibModal.open({
                            templateUrl: 'html/http-error-handler-modal.html',
                            controller: 'HTTPErrorHandlerModalCtrl',
                            scope: $scope,
                            bindToController: true,
                        });

                        if(modal.closed && modal.closed.then) {
                            modal.closed.then((e) => {
                                let _modal = modal;
                                console.log("3", e)
                                visibleModalsIds[modalId] = false;

                            });
                        }

                        modal.result.then((e) => {
                            if (e && e.route) {
                                // change route after clicking OK button
                                $location.path(e.route)
                            }
                        });
                    }

                    function displayNotificationWarning() {
                        const Notify = $injector.get('Notify');

                        let promise = Notify.warning({
                            delay: NOTIFICATION_AUTO_DISAPPEAR_DELAY,
                            key: 'httpInterceptorWarningMessage',
                            title: $filter('translate')('Server Error'),
                            message: $filter('translate')('Request to fetch data failed'),
                            allowMultiple: false
                        });

                        if(promise && promise.then) {
                            promise.then((notificationScope) => {
                                notificationWarningScope = notificationScope;
                            });
                        }
                    }

                    function displayNotificationError({ maxAttempts } = {maxAttempts: -1}) {
                        const Notify = $injector.get('Notify');

                        if(notificationWarningScope && notificationWarningScope.kill) {
                            notificationWarningScope.kill();
                            notificationWarningScope = null;
                        }

                        if(notificationErrorScope && notificationErrorScope.kill) {
                            notificationErrorScope.kill();
                            notificationErrorScope = null;
                        }
                        let promise = Notify.error({
                            delay        : NOTIFICATION_AUTO_DISAPPEAR_DELAY,
                            key          : 'httpInterceptorErrorMessage',
                            title        : $filter('translate')('Server Error'),
                            message      : maxAttempts > 0 ?
                                $filter('translate')('Request to the server failed', {
                                    maxAttempts: maxAttempts
                                }) :
                                $filter('translate')('Request failed'),
                            allowMultiple: true,
                            priority     : 100,
                        });

                        if (promise && promise.then) {
                            promise.then((notificationScope) => {
                                notificationErrorScope = notificationScope;
                            });
                        }

                    }

                    function getRetryNumber(response) {
                        return failedUrlRequests[response.config.url] || 1;
                    }

                    function increaseRetryNumber(response) {
                        if(!response.config.url)
                            throw new Error('Cannot get url from response.config.url');

                        if(failedUrlRequests[response.config.url]) {
                            failedUrlRequests[response.config.url]++;
                        } else {
                            failedUrlRequests[response.config.url]  = 1;
                        }
                    }

                    function resetRetriesNumber(response) {
                        if(failedUrlRequests[response.config.url]) {
                            delete failedUrlRequests[response.config.url];
                        }
                    }

                    const retryNumber = getRetryNumber(response);

                    // if http code match modal - show the modal
                    // and reject the $http promise
                    if(HTTP_STATUSES_TO_SHOW_MODAL[Number(response.status)]) {
                        showModal(HTTP_STATUSES_TO_SHOW_MODAL[Number(response.status)]);

                        return $q.reject(response);
                    }

                    // if http code doesn't match a retry list we should reject it immediately
                    if(HTTP_STATUSES_TO_REPLAY.indexOf((response.status).toString()) === -1) {
                        displayNotificationError();
                        return $q.reject(response);
                    }


                    if (HTTP_STATUSES_TO_REPLAY.indexOf((response.status).toString()) !== -1 && REPLAY_MAX_TRIES >= retryNumber) {

                        increaseRetryNumber(response);

                        displayNotificationWarning();

                        if(DISPLAY_IN_CONSOLE)
                            console.log(`[httpInterceptor] Request to ${response.config.url} failed. Replay request. Try #${retryNumber}`);

                        return $timeout(function () {
                            const $http = $injector.get('$http');

                            return $http(response.config);
                        }, REPLAY_IN_MS);
                    } else {
                        if(DISPLAY_IN_CONSOLE)
                            console.log(`[httpInterceptor] Request to ${response.config.url} failed. Retry max number exceeded ${retryNumber}/${REPLAY_MAX_TRIES}`);
                    }

                    resetRetriesNumber(response);

                    displayNotificationError({
                        maxAttempts: REPLAY_MAX_TRIES
                    });

                    return $q.reject(response);
                }
            }
        }]);
    }

})();
