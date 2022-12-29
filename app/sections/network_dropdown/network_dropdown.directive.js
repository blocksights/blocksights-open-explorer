(function () {
    'use strict';

    angular.module('app.network_dropdown')
           .directive('networkDropdown', networkDropdown);

    function networkDropdown() {
        return {
            restrict: 'E',
            replace: true,
            templateUrl: 'html/network_dropdown.html',
            controller: ['Api', '$scope', 'networkService', 'appConfig', '$route', '$location', networkDropdownCtrl]
        }
    }

    function networkDropdownCtrl(Api, $scope, networkService, appConfig, $route, $location) {
        $scope.darkMode = false;

        $scope.activeNetworkTitle = false;

        $scope.endpoints = Api.getEndpoints();

        $scope.onDarkModeToggle = toggleDarkMode;

        $scope.setEndpoint = setEndpoint;

        /** Fetch chain_id from API endpoint to identify which chain is active
         * and display its title on the app header */
        selectActiveChain();

        function selectActiveChain() {
            networkService.getBlockchain((response) => {
                if(response && response.chain_id && response.chain_id) {
                    Api.setActiveBlockchain(response.chain_id);
                    $scope.activeNetworkTitle = Api.getActiveEndpointTranslation();
                } else {
                    $scope.activeNetworkTitle = 'error';
                }
            }).catch((err) => {
                $scope.activeNetworkTitle = 'error';
            });
        }

        /** When user selects endpoint we should set it as active
         * and reload the app route to fetch data based on new api url
         * @param {Endpoint} endpoint - the api endpoint we want to make active */
        function setEndpoint(endpoint) {
            Api.setActiveEndpoint(endpoint);
            appConfig.update();
            // remove network from the query url when changes network by hands
            $location.search('network', undefined)
            $route.reload();
            selectActiveChain();
        }

        /** This is a checkbox without logic yet. This app logic will be released when Dark Theme be done */
        function toggleDarkMode() {
            $scope.darkMode = !$scope.darkMode;
        }

    }

})();
