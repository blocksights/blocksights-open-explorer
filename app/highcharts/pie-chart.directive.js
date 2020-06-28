import Highcharts from 'highcharts';
import noDataToDisplayHighchartsPlugin from 'highcharts/modules/no-data-to-display';

noDataToDisplayHighchartsPlugin(Highcharts);

/**
 * <pie-chart options={highchartOptions} allow-fullscreen-for-mobile-></pie-chart>
 *
 * === Options ===
 *
 * options                      - highcharts options
 *
 * allow-fullscreen-for-mobile - if `true` the chart will display a `Enter fullscreen` button to see the chart on the
 *                                fullscreen for mobile devices
 * */

(function () {
    
    angular.module('app.highcharts').directive('pieChart', ['$window', pieChart]);
    
    function pieChart() {
        return {
            restrict: 'E',
            replace: true,
            template: '<div><div class="highcharts-container"></div><div ng-if="allowFullscreenForMobile" ng-click="enterFullscreen()" id="highcharts-enter-fullscreen-button" class="btn btn-default" data-translate="Show in fullscreen"></div></div>',
            scope: {
                options: '=',
                allowFullscreenForMobile: '='
            },
            link: function (scope, element) {
                let chart, optionsWatcher;
                
                scope.enterFullscreen = enterFullscreen;
                
                init();
                initWatchers();
                
                function init() {
                    if(scope.options) {
                        chart = Highcharts.chart(element.find('.highcharts-container')[0], scope.options);
                    }
                }
                
                function initWatchers() {
                    optionsWatcher = scope.$watch('options', () => {
                        init();
                    });
    
                    scope.$on('$destroy', destroyWatchers);
                }
                
                function destroyWatchers() {
                    // kill chart options watcher
                    optionsWatcher && optionsWatcher();
                }
    
                function enterFullscreen() {
                    const container = chart.container.parentNode;
        
                    if (container.requestFullscreen) {
                        container.requestFullscreen();
                    } else if (container.mozRequestFullScreen) {
                        container.mozRequestFullScreen();
                    } else if (container.webkitRequestFullscreen) {
                        container.webkitRequestFullscreen();
                    } else if (container.msRequestFullscreen) {
                        container.msRequestFullscreen();
                    }
                }
                
            }
        }
    }
})();
