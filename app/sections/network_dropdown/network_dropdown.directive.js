(function () {
    'use strict';
    
    angular.module('app.network_dropdown')
           .directive('networkDropdown', networkDropdown);
    
    function networkDropdown() {
        return {
            restrict: 'E',
            replace: true,
            templateUrl: 'html/network_dropdown.html',
            controller: ['Api', '$scope', 'networkService', 'appConfig', '$route', networkDropdownCtrl]
        }
    }
    
    function networkDropdownCtrl(Api, $scope, networkService, appConfig, $route) {
        $scope.darkMode = false;
    
        $scope.activeChainTitle = false;
        
        $scope.endpoints = Api.getEndpoints();
    
        $scope.onDarkModeToggle = toggleDarkMode;
        
        $scope.setEndpoint = setEndpoint;
    
        /** Fetch chain_id from API endpoint to identify which chain is active
         * and display its title on the app header */
        selectActiveChain();
        
        function selectActiveChain() {
            networkService.getHeader((response) => {
                if(response && response.chain_id && response.chain_id) {
                    Api.setActiveBlockchain(response.chain_id);
                    $scope.activeChainTitle = Api.getActiveChainTranslation();
                } else {
                    $scope.activeChainTitle = 'error';
                }
            }).catch((err) => {
                $scope.activeChainTitle = 'error';
            });
        }
    
        /** When user selects endpoint we should set it as active
         * and reload the app route to fetch data based on new api url
         * @param {Endpoint} endpoint - the api endpoint we want to make active */
        function setEndpoint(endpoint) {
            Api.setActiveEndpoint(endpoint);
            $route.reload();
            selectActiveChain();
        }
        
        /** This is a checkbox without logic yet. This app logic will be released when Dark Theme be done */
        function toggleDarkMode() {
            $scope.darkMode = !$scope.darkMode;
        }
        
    }
    
})();
