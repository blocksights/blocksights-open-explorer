(function () {
    'use strict';

    angular.module('app.generic-search')
           .service('GenericSearchService', ['$http', 'appConfig', '$q', GenericSearchService])

    function GenericSearchService($http, appConfig, $q) {

        const SUPPORTED_TAGS = [
            'to',
            'from',
            'ops-account',
            'ops-asset',
            'account',
            'block',
            'trx',
            'asset',
        ];

        const SEARCH_TYPES = {
            OPERATION: 'operation',
            ACCOUNT: 'account',
            BLOCK: 'block',
            TRANSACTION: 'trx',
            ASSET: 'asset',
        };

        let cancelRequest = false;

        function validateSearchString(searchString)  {
            if (searchString.length >= 3) {
                // assume user has seen the smart help by now
                return true;
            }

            const searchArr = searchString.split(':');
            if(searchArr.length !== 2) {
                return false;
            }

            const searchTag = searchArr[0];
            const searchValue = searchArr[1];

            if(SUPPORTED_TAGS.indexOf(searchTag) === -1)
                return false;

            if(!searchValue.length)
                return false;

            return true;

        }

        function find(expression) {

            // if one request already in progress we should abort it
            if(!cancelRequest) {
                cancelRequest = $q.defer();
            } else {
                cancelRequest.resolve({
                    type: 'canceled',
                    items: []
                });
                cancelRequest = $q.defer();
            }

            return $http.get(appConfig.urls.python_backend() + "/search?expression=" + expression, { timeout: cancelRequest.promise }).then(function (response) {

                let items = [];

                if(response.data && response.data.found && Array.isArray(response.data.found) && response.data.found.length) {

                    // the code below generates the response in specific format and
                    // adds groups' titles to split accounts / transactions / blocks etc. in the dropdown list
                    
                    const mapOperationsProperType = (item) => {
                        return item.identifier.indexOf('1.11') === 0 ? {
                            ...item,
                            type: SEARCH_TYPES.OPERATION,
                        } : {
                            ...item,
                        }
                    }
                    
                    try {
                        items = (Array.isArray(response.data.found) ? response.data.found : []).map(mapOperationsProperType);

                        for(let i = 0; i < items.length; i++) {
                            if(i === 0) {
                                items.splice(0, 0, { isGroup: true, type: items[0].type });
                                i++;
                            } else {
                                if(items[i].type !== items[i-1].type) {
                                    items.splice(i, 0, { isGroup: true, type: items[i].type })
                                }
                                i++;
                            }
                        }

                    } catch (e) {
                        console.error('Error during parsing search results', e);
                        throw new Error('Error during parsing search results');
                    }
                }

                return {
                    status: "success",
                    items: items,
                }

            });
        }

        return {
            types: SEARCH_TYPES,
            SUPPORTED_TAGS: SUPPORTED_TAGS,
            find: find,
            validateSearchString: validateSearchString,
        };
    }

})();
