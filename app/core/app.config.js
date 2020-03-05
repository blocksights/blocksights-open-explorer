import {getGATag, getConnections, getConfig} from "../branding";

(function() {
    'use strict';

    angular.module('app')
        .factory('appConfig', [appConfig]);

    let gatag = getGATag();
    if (gatag != null) {
        angular.module('app').config(['AnalyticsProvider', function (AnalyticsProvider) {
            // Add configuration code as desired
            AnalyticsProvider.setAccount(gatag);  //UU-XXXXXXX-X should be your tracking code
        }]).run(['Analytics', function (Analytics) {}]);
    }

    angular.module('app').config(['$locationProvider', function($locationProvider) {
        $locationProvider.hashPrefix('');
    }]);

    function appConfig() {
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
            websocket: getConnections().blockchain,
            python_backend: getConnections().api,
            elasticsearch_wrapper: getConnections().api,
            udf_wrapper: getConnections().api + "/udf"
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
