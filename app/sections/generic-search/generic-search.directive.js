(function () {
    'use strict';

    angular.module('app.generic-search')
           .directive('genericSearch', genericSearch)
           .directive('genericSearchClickOut', ['$window', '$parse', function ($window, $parse) {
               return {
                   restrict: 'A',
                   link: function (scope, element, attrs) {
                       const clickOutHandler = $parse(attrs.genericSearchClickOut);

                       angular.element($window).on('click', function (event) {
                           if (element[0].contains(event.target)) return;
                           clickOutHandler(scope, {$event: event});
                           scope.$apply();
                       });
                   }
               };
           }])

    function genericSearch() {
        return {
            replace: true,
            scope: true,
            templateUrl: 'html/generic-search.html',
            controller: ['$scope', 'GenericSearchService', '$location', ($scope, GenericSearchService, $location) => {

                /* Search statuses. This helps the UI to display the correct dropdown result */
                const STATUSES = {
                    OK: 'OK',
                    LOADING: 'LOADING',
                    EMPTY: 'EMPTY',
                    ERROR: 'ERROR',
                    INVALID_TAG: 'INVALID_TAG',
                };

                $scope.matches = [];
                $scope.isOpen = false;
                $scope.STATUSES = STATUSES;

                /* ng-model-options for search input */
                $scope.modelOptions = {
                    debounce: 500,
                    getterSetter: true
                };

                $scope.onFocus = onFocus;

                $scope.select = selectSearchItem;

                $scope.onClickOut = userClickOutOfSearch;

                $scope.search = search;

                function userClickOutOfSearch() {
                    hideDropdown();
                }

                function selectSearchItem(match) {

                    if(match.type === GenericSearchService.types.OPERATION) {
                        $location.path("/operations/"+match.identifier);
                    } else if (match.type === GenericSearchService.types.ACCOUNT) {
                        $location.path("/accounts/"+match.identifier);
                    } else if (match.type === GenericSearchService.types.ASSET) {
                        $location.path("/assets/"+match.identifier);
                    } else if (match.type === GenericSearchService.types.BLOCK) {
                        $location.path("/blocks/"+match.identifier);
                    } else if (match.type === GenericSearchService.types.TRANSACTION) {
                        $location.path("/txs/"+match.identifier);
                    }

                    hideDropdown();
                }

                function search(searchString) {

                    // in case if user delete the text from search input - hide dropdown and reset status
                    if(!searchString) {
                        resetDropdown();
                        hideDropdown();
                        return ;
                    }

                    // if search string is not valid - display the supported tags list
                    if(!GenericSearchService.validateSearchString(searchString)) {
                        showInvalidTagsDropdown();
                        return;
                    }

                    // show loading before do the search
                    showLoadingDropdown();

                    return GenericSearchService.find(searchString).then((response) => {

                        if(response && response.items && !response.items.length) {
                            showNoResultsDropdown();
                            return;
                        }

                        if(response && response.items && response.items.length) {
                            showResultsDropdown(response);
                        }

                        if(response && !response.items) {
                            showErrorDropdown();
                        }

                    }).catch((err) => {

                        // the GenericSearchService.find abort the outgoing request
                        // if one already in progress when function called
                        // in this case we should not display the error window
                        if(err && (err.xhrStatus !== "abort")) {
                            showErrorDropdown();
                        }
                    });
                }

                function resetDropdown() {
                    $scope.status = '';
                }

                function showResultsDropdown(response) {
                    $scope.matches = response.items;
                    $scope.status = STATUSES.OK;
                    showDropdown();
                }

                function showNoResultsDropdown() {
                    showDropdown();
                    $scope.status = STATUSES.EMPTY;
                }

                function showErrorDropdown() {
                    showDropdown();
                    $scope.status = STATUSES.ERROR;
                }

                function showInvalidTagsDropdown() {
                    showDropdown();
                    $scope.status = STATUSES.INVALID_TAG;
                }

                function showLoadingDropdown() {
                    showDropdown();
                    $scope.status = STATUSES.LOADING;
                }

                function showDropdown() {
                    $scope.isOpen = true;
                }

                function hideDropdown() {
                    $scope.isOpen = false;
                }

                function onFocus() {
                    if($scope.searchString && $scope.searchString.length) {
                        showDropdown();
                    }
                }

            }]
        }
    }
})();
