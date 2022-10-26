(function () {
    'use strict';

    angular.module('app.credit_offers')
        .controller('creditOffersCtrl', ['$scope', '$route', '$routeParams', '$location', '$filter', 'utilities', 'marketService',
            'chartService', 'appConfig', creditOffersCtrl])
        .filter('to_trusted', ['$sce', function($sce){
            return function(text) {
                return $sce.trustAsHtml(text);
            };
        }]);
    
    function humanizeTime(seconds, $filter) {
        if(seconds <= 60) {
            return seconds + ' ' + $filter('translate')('short-second')
        } else if (seconds / 60 / 60 < 1) {
            return Math.round(seconds / 60) + ' ' + $filter('translate')('short-minute')
        } else if (seconds / 60 / 60 <= 24) {
            return Math.round(seconds / 60 / 60) + ' ' + $filter('translate')('short-hour')
        } else if (seconds / 60 / 60 / 24 >= 1) {
            return Math.round(seconds / 60 / 60 / 24) + ' ' + $filter('translate')('short-day')
        }
    }
    
    function convertUTCDateToLocalDate(date) {
        const newDate = new Date(date.getTime()+date.getTimezoneOffset()*60*1000);
    
        const offset = date.getTimezoneOffset() / 60;
        const hours = date.getHours();
    
        newDate.setHours(hours - offset);
    
        return newDate;
    }
    
    function mapCreditOffers(item, $filter) {
        let expiration = 'expiration_date';
        return {
            id_float: parseInt(item.id.split(".")[2]),
            asset: item.asset,
            collateral: item.collateral,
            account: item.owner_account_name,
            total: parseFloat((item.total_balance / item.asset_precision).toFixed(8)),
            available: parseFloat((item.current_balance / item.asset_precision).toFixed(8)),
            minimum: parseFloat((item.min_deal_amount / item.asset_precision).toFixed(8)),
            rate: parseFloat((item.fee_rate / 10000).toFixed(8)),
            repay_period: humanizeTime(item.max_duration_seconds, $filter),
            expiration: convertUTCDateToLocalDate(new Date(item.auto_disable_time)),
        }
    }

    function creditOffersCtrl($scope, $route, $routeParams, $location, $filter, utilities, marketService, chartService, appConfig) {
        
        $scope.credit_offer_id = $routeParams.name;
        $scope.showOnlyActive = true;

        if($scope.credit_offer_id) {
            
            $scope.operationsColumns = [
                    {
                        title: $filter('translate')('Operation'),
                        index: 'operation_text',
                    },
                    {
                        title: $filter('translate')('ID'),
                        index: 'operation_id'
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
                        hidden: ['xs', 'sm', 'md']
                    }
                ];
            $scope.select = function(page_operations) {
                    const page = page_operations - 1;
                    const limit = 20;
                    const from = page * limit;

                    $scope.operationsLoading = true;
                    $scope.operationsLoadingError = false;
                    marketService.getCreditOfferOperationsHistory($scope.credit_offer_id, limit, from).then((returnData) => {
                        console.log('test?');
                        $scope.operationsLoading = false;
                        $scope.operations = returnData;
                        $scope.currentPage = page_operations;
                    }).catch(err => {
                        $scope.operationsLoadingError = true;
                        throw err;
                    });
                }
            $scope.select(1);
        } else {
            $scope.columns = [{
                title: 'ID',
                index: 'id',
                sortingIndex: 'id_float',
                sort: true,
            },
            {
                title: 'Active',
                index: 'enabled',
                sortingIndex: 'enabled',
                sort: true,
            },
            {
                title: 'Asset',
                index: 'asset',
            },
            {
                title: 'Collateral',
                index: 'collateral',
            },
            {
                title: 'Account',
                index: 'account',
                hidden: ['xs', 'sm', 'md']
            },
            {
                title: 'Total',
                index: 'total',
                sort: true,
                hidden: ['xs', 'sm', 'md']
            },
            {
                title: 'Available',
                index: 'available',
                sort: true,
                hidden: ['xs', 'sm']
            },
            {
                title: 'Minimum',
                index: 'minimum',
                sort: true,
                hidden: ['xs', 'sm', 'md']
            },
            {
                title: 'Rate',
                index: 'rate',
                sort: true,
            },
            {
                title: 'Repay Period',
                index: 'repay_period',
                sortingIndex: 'max_duration_seconds',
                sort: true,
                hidden: ['xs']
            },
            {
                title: 'Expiration date',
                index: 'expiration_date',
                hidden: ['xs', 'sm']
            }];
            
            const onlyActiveFilter = (item) => ($scope.showOnlyActive ? item.enabled === $scope.showOnlyActive : true);
            
            $scope.listLoading = true;
            marketService.getCreditOffers().then(function (returnData) {
                $scope.listLoading = false;
                $scope.listItems = returnData.map(item => {
                    return {
                        id: item.id,
                        ...item,
                        ...mapCreditOffers(item, $filter)
                    }
                });
                
                $scope.filteredItems = $scope.listItems.filter(onlyActiveFilter);
            }).catch((error) => {
                console.log('error:', error)
                $scope.listLoadingError = true;
            });
            
            const showOnlyActiveWatcher = $scope.$watch('showOnlyActive', () => {
                if($scope && $scope.listItems) {
                    $scope.filteredItems = $scope.listItems.filter(onlyActiveFilter);
                }
            })
            
            $scope.$on('$destroy', () => {
                showOnlyActiveWatcher();
            });
        
        }
    }

})();
