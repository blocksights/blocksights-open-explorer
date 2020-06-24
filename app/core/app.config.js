import {getGATag, getConnections, getConfig} from "../branding";

(function() {
    'use strict';

    angular.module('app')
        .factory('appConfig', ['Api', appConfig]);

    let gatag = getGATag();
    if (gatag != null) {
        angular.module('app').config(['AnalyticsProvider', function (AnalyticsProvider) {
            // Add configuration code as desired
            AnalyticsProvider.setAccount(gatag);  //UU-XXXXXXX-X should be your tracking code
        }]).run(['Analytics', function (Analytics) {}]);
    }

    angular.module('app').config(['$locationProvider', function($locationProvider) {
        $locationProvider.hashPrefix('');
    }]).config(['ApiProvider', function (ApiProvider) {
    
        /**
         * Tell ApiProvider what are the endpoints and chains we will handle and display as available for our user
         */
        
        ApiProvider.setKnownEndpoints([
            {
                translate: 'Mainnet',
                url: 'https://api.mvsdna.com/openexplorer',
            },
            {
                translate: 'Testnet',
                url: 'https://api.mvsdna.com/openexplorer',
                isDefault: true,
            }
        ]);
    
        ApiProvider.setKnownBlockchains([
            {
                translate: 'Testnet',
                chainId: '93b266081a68bea383ef613753a9cafaa01b3b7b04ed00a01e5dec5de8cb4983'
            }
        ]);
        
    }]);

    function appConfig(Api) {
        
        var pageTransitionOpts = [
            {
                name: 'Fade up',
                "class": 'animate-fade-up'
            }, {
                name: 'Scale up',
                "class": 'ainmate-scale-up'
            }, {
                name: 'Slide in from right',
                "class": 'ainmate-slide-in-right'
            }, {
                name: 'Flip Y',
                "class": 'animate-flip-y'
            }
        ];
        var date = new Date();
        var year = date.getFullYear();
        var branding = getConfig();
        var main = {
            brand: branding.name + " Explorer",
            name: branding.name,
            api_link: "https://github.com/bitshares/bitshares-explorer-api",
            source_code_link: "https://github.com/bitshares/open-explorer",
            year: year,
            pageTransition: pageTransitionOpts[0]
        };
        var color = {
            primary:    '#4E7FE1',
            success:    '#81CA80',
            info:       '#6BBCD7',
            infoAlt:    '#7266BD',
            warning:    '#E9C842',
            danger:     '#E96562',
            gray:       '#DCDCDC'
        };
        var urls = {
            python_backend: Api.getApiUrl,
            elasticsearch_wrapper: Api.getApiUrl,
            udf_wrapper: () => Api.getApiUrl() + "/udf"
        };
        return {
            pageTransitionOpts: pageTransitionOpts,
            main: main,
            color: color,
            urls: urls,
            branding: branding
        };
    }


})();
