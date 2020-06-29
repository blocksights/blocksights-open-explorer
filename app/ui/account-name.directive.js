/**
 * <account-name account-id="'1.2.1'"></account-name>
 *
 * Use this directive to display an account name using the account id.
 * The best purpose of using this directive is to avoid additional logic in controllers, services
 * to fetch the account names for our entries we get from the API.
 *
 * This directive will take care of displaying the account name and API cache will take care of performance :)
 *
 */

(function () {
    
    angular.module('app')
           .directive('accountName', [accountName]);
    
    function accountName() {
        return {
            restrict: 'E',
            replace: true,
            scope: {
                accountId: '='
            },
            template: '<span>{{accountName || " "}}</span>',
            controller: ['$scope', 'accountService', accountNameController]
        };
        
        function accountNameController($scope, accountService) {
            $scope.accountName = '';
            
            if($scope.accountId) {
                fetchAccountName();
            }
            
            const accountIdListener = $scope.$watch('accountId', () => {
                if($scope.accountId) {
                    fetchAccountName();
                }
            });
            
            $scope.$on('$destroy', () => {
                accountIdListener();
            });
            
            function fetchAccountName() {
                accountService.getAccountName($scope.accountId, (accountName) => {
                    if(accountName) {
                        $scope.accountName = accountName;
                    } else {
                        throw new Error('Cannot get account name for accountId: ' + $scope.accountId);
                    }
                });
            }
        }
    }
    
})();
