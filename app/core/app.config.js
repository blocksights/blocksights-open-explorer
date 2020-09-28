import {getGATag, getAvailableEndpoints, getAvailableBlockchains, getGlobalConfig} from "../branding";

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

        ApiProvider.setKnownEndpoints(
            getAvailableEndpoints()
        );

        ApiProvider.setKnownBlockchains(
            getAvailableBlockchains()
        );

        ApiProvider.enableLocalStorageSync();

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
        var getConfig = () => Api.getActiveBlockchain().config;
        var main = () => {
            let config = getConfig();
            return {
                brand: config.name + " Open Explorer",
                name: config.name,
                api_link: "https://api.bitshares.ws/",
                source_code_link: null,
                fork_of: "https://github.com/bitshares/open-explorer",
                year: year,
                pageTransition: pageTransitionOpts[0]
            }
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

        var dateFormat = 'dd MMM yyyy hh:mm:ss';

        const _appConfig = {
            pageTransitionOpts: pageTransitionOpts,
            getMain: main,
            color: color,
            urls: urls,
            dateFormat,
            getConfig: getConfig,
            globalConfig: getGlobalConfig()
        };
        _appConfig.update = () => {
            _appConfig.main = _appConfig.getMain();
            _appConfig.branding = _appConfig.getConfig();
        };
        return _appConfig;
    }


})();
