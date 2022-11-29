import moment from 'moment'

/*
Use this directive like this:
<operations-table />

* * * * * * * * * * * * * * *
* * * * * Options * * * * * *
* * * * * * * * * * * * * * *

_ _ _ _ _ _ _ _
|   Grouping  |
- - - - - - - -
This is a way to display all operations of specific blockchain object (account/creditoffer/pool)

(Examples)
<operations-table group-by-account-id="1.2.0"/> - use if you want to display operations of specific account
<operations-table group-by-credit-offer-id="1.21.0"/> - use if you want to display operations of specific credit offer
<operations-table group-by-pool-id="1.21.0"/> - use if you want to display operations of specific pool

_ _ _ _ _ _ _ _ _ _ _ _ _
|   Enable User Filters  |
- - - - - - - - - - - - -
This show/hide filtering fields for the user to filter all operations by account/asset/operation

// By default all true

(Examples)
<operations-table filter-by-account-id-enabled="false"/> - use if you want to display operations of specific account
<operations-table filter-by-asset-id-enabled="false"/> - use if you want to display operations of specific credit offer
<operations-table filter-by-operation-type-enabled="false"/> - use if you want to display operations of specific pool

 _ _ _ _ _ _ _ _
|   Date From  |
 - - - - - - - -
Use this fields to optimize ES search by date limits

// By default: now-1M

(Example)
<operations-table default-date-from="now-1y"/> this is a date-from which applies when no filters
<operations-table filters-date-from="now-1y"/> this is a date-from which applies when any filter defined by the user

 _ _ _ _ _ _ _ _ _
|   Show filters  |
 - - - - - - - - -
Use this field show / hide user filters

// By default: undefined

(Example)
<operations-table show-filters="true"/>

*/
(function () {
    
    angular.module('app.operations')
           .directive('operationsTable', [operationsTable]);
    
    function operationsTable() {
        return {
            restrict: 'E',
            replace: true,
            scope: {
                showFilters: '=',
                groupByAccountId: '=',
                groupByCreditOfferId: '=',
                groupByPoolId: '=',
                defaultDateFrom: "@",
                filtersDateFrom: "@",
                filterByAccountIdEnabled: '=',
                filterByAssetIdEnabled: '=',
                filterByOperationTypeEnabled: '=',
            },
            templateUrl: 'html/operations-table.html',
            controller: ['$scope', '$filter', 'Notify', 'OperationsService', 'utilities', operationsTableController]
        };
        
        function operationsTableController($scope, $filter, Notify, OperationsService, utilities) {
            
            function filtersDefined() {
                return $scope.filters.operationType !== '-1' || $scope.filters.accountIdOrName || $scope.filters.assetIdOrName;
            }
            
            // list of values for filter by operation type <select>
            $scope.operationTypes = new Array(75).fill('#').map((item, key) => {
                const name = utilities.operationType(key)[0]
                if(!name)
                    return false;
                return {
                    value: key,
                    name,
                }
            }).filter((item) => !!item);
            
            $scope.itemsOnPage = 20;
            $scope.totalItems = 0;
            $scope.currentPage = 1;
            $scope.maxPage = 0;
            
            $scope.defaultDateFrom = $scope.defaultDateFrom || 'now-1M'
            $scope.filtersDateFrom = $scope.filtersDateFrom || 'now-1y'
            $scope.extendedDateFrom = null;
            
            // default values for filtering fields
            $scope.filters = {
                operationType: '-1',
                assetIdOrName: undefined,
                accountIdOrName: undefined,
            }
            
            // options for filtering fields (to prevent instant firing of change)
            $scope.inputFilterOptions = {
                debounce: 500,
                getterSetter: true
            };
            
            // this is a variable to track when user opens the page and proper pagination
            // see the issue: https://github.com/blocksights/blocksights-open-explorer/issues/15
            $scope.userOpenedFirstPageTime = null;
            
            const filters = [
                $scope.filterByAssetIdEnabled !== false ? {
                    width: '150px',
                    defaultValue: '',
                    placeholder: 'Search by asset',
                    onChange: (value) => {
                        $scope.filters.assetIdOrName = value;
                        $scope.select(1, true);
                    },
                    modelOptions: {
                        debounce: 500,
                        getterSetter: true
                    }
                } : null,
                $scope.filterByAccountIdEnabled !== false ? {
                    width: '150px',
                    defaultValue: '',
                    placeholder: 'Search by account',
                    onChange: (value) => {
                        $scope.filters.accountIdOrName = value;
                        $scope.select(1, true);
                    },
                    modelOptions: {
                        debounce: 500,
                        getterSetter: true
                    }
                } : null,
            ].filter((item) => !!item);
            
            $scope.operationsColumns = $scope.columns || [
                {
                    title: $filter('translate')('Operation'),
                    index: 'operation_text',
                    onFilterCancel: () => {
                        $scope.filters.assetIdOrName = undefined;
                        $scope.filters.accountIdOrName = undefined;
                        $scope.select(1, true)
                    },
                    filter: filters.length ? filters : undefined
                },
                {
                    title: $filter('translate')('ID'),
                    index: 'operation_id',
                },
                {
                    title: $filter('translate')('Date and time'),
                    index: 'time',
                    hidden: ['xs']
                },
                {
                    title: $filter('translate')('Block'),
                    index: 'block_num',
                    hidden: ['xs', 'sm']
                },
                {
                    title: $filter('translate')('Type'),
                    index: 'type',
                    hidden: ['xs', 'sm', 'md'],
                    onFilterCancel: () => {
                        $scope.filters.operationType = '-1';
                        $scope.select(1, true)
                    },
                    filter: $scope.filterByOperationTypeEnabled !== false ? [
                        {
                            width: '300px',
                            placeholder: 'Filter by operation id',
                            defaultValue: '-1',
                            onChange: (value) => {
                                $scope.filters.operationType = value;
                                $scope.select(1, true);
                            },
                            options: $scope.operationTypes
                        }
                    ] : undefined
                }
            ];
            
            $scope.loadMore = () => {
                if(!$scope.extendedDateFrom) {
                    $scope.extendedDateFrom = moment().subtract(1, 'year')
                } else {
                    $scope.extendedDateFrom = $scope.extendedDateFrom.subtract(1, 'year')
                }
                
                $scope.select($scope.currentPage)
            }
            
            $scope.select = function (page_operations, filtersChanged = false) {
                if(filtersChanged) {
                    $scope.totalItems = 0;
                    $scope.maxPage = 0;
                }
                
                const page = page_operations - 1;
                const limit = $scope.itemsOnPage;
                const offset = page * limit;
                
                if(page_operations === 1 || !$scope.userOpenedFirstPageTime) { // if user switches back from page Y (Y>1) to page 1 we need to fetch new transactions and update time range
                    $scope.userOpenedFirstPageTime = new moment();
                }
                
                const date_to = $scope.userOpenedFirstPageTime.format("YYYY-MM-DD");

                $scope.operationsLoading = true;
                $scope.operationsLoadingError = false;
                OperationsService.getOperationsHistory({
                    limit,
                    offset,
                    date_to,
                    date_from: $scope.extendedDateFrom ? $scope.extendedDateFrom.format("YYYY-MM-DD") : filtersDefined() ? $scope.filtersDateFrom : $scope.defaultDateFrom || undefined,
                    assetId: $scope.filters.assetIdOrName,
                    accountId: $scope.groupByAccountId || $scope.filters.accountIdOrName,
                    creditOfferId: $scope.groupByCreditOfferId,
                    poolId: $scope.groupByPoolId,
                    operationType: $scope.filters.operationType,
                }).then((response) => {
                    $scope.operationsLoading = false;
                    if(response && (response.asset_not_found || response.account_not_found)) {
                        let title, message;
                        if(response.asset_not_found) {
                            title = $filter('translate')('Asset not found', {
                                asset: $scope.filters.assetIdOrName
                            });
                            message = $filter('translate')('Please check the asset name');
                        }
                        if(response.account_not_found) {
                            title = $filter('translate')('Account not found', {
                                account: $scope.filters.accountIdOrName
                            })
                            message = $filter('translate')('Please check the account name');
                        }
                        return Notify.warning({
                            key: 'httpAssetOrAccountNotFound',
                            title: title,
                            message: message,
                            allowMultiple: true
                        });
                    } else {
                        if(page_operations > $scope.maxPage) { // next page
                            $scope.maxPage = page_operations;
                            $scope.totalItems += response.length;
                        } else if (page_operations === $scope.maxPage) { // loads more for current page
                            $scope.totalItems = $scope.totalItems - $scope.operations.length + response.length;
                        }
                        $scope.hasNextPage = response.length > limit;
                        $scope.operations = response.slice(0, limit) // remove the additional item which defines the existence of the next page
                        $scope.operationsWithoutDuplicates = $scope.operations.filter(OperationsService.filterOperationDuplicates);
                        $scope.currentPage = page_operations;
                        if (page_operations == 1) {
                            if (response.length > 0) {
                                $scope.total_ops = response[0].operation_id_num;
                            } else {
                                $scope.total_ops = 0;
                            }
                        }
                    }
                }).catch(err => {
                    $scope.operationsLoadingError = true;
                });
            };
            
            $scope.select(1);
            
            $scope.$on('$destroy', () => {
            
            });
        }
    }
    
})();
