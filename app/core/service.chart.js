(function() {
    'use strict';

    angular.module('app').factory('chartService', chartService);
    chartService.$inject = ['$http', 'appConfig', 'utilities', '$filter'];

    function chartService($http, appConfig, utilities, $filter) {
    
        function _deprecated_noDataPieChart(message = $filter('translate')('No data found')) {
            const options = {
                "animation":true,
                "calculable":true,
                "legend": {
                    orient: 'vertical',
                    x: 'left',
                    data: [message],
                },
                "series":[
                    {
                        label: {
                            normal: {
                                show: false,
                                position: 'center'
                            },
                            emphasis: {
                                show: true,
                                textStyle: {
                                    fontSize: '18'
                                }
                            }
                        },
                        "color":[
                            "#DDDDDD"
                        ],
                        "type":"pie",
                        "radius": ['50%', '70%'],
                        "data":[
                            {
                                "value": 0,
                                "name": message,
                                itemStyle: {
                                    normal: {
                                        color: '#DEDEDE'
                                    }
                                }
                            }
                        ]
                    }
                ]
            };
            return {options: options};
        }
        
        function errorChart(message) {
            return noChartWithMessage(message ? message : $filter('translate')('Data unavailable'))
        }

        function noChartWithMessage(message) {
            return {
                title: {
                    text: ''
                },
                lang: {
                    noData: message
                }
            };
        }
    
        function noDataChart(message) {
            return noChartWithMessage(message ? message : $filter('translate')('No data found'))
        }
        
        function loadingChart(message) {
            return noChartWithMessage(message ? message : $filter('translate')('Loading'))
        }
        
        /**
         * Returns the config for highcharts pie chart
         *
         * @param {object}  params
         * @param {string}  [params.title]          - The chart title
         * @param {array}   [params.data]           - The chart data
         * @param {object}  [params.series]         - The chart series options
         * @param {object}  [params.series.title]   - The title of series
         *
         * */
        function pieChart(params) {
            
            return {
                title: {
                    text: params.title || ''
                },
                chart: {
                    plotBackgroundColor: null,
                    plotBorderWidth: null,
                    plotShadow: false,
                    type: 'pie',
                },
                tooltip: {
                    pointFormat: '{series.name}: <br>{point.percentage:.1f} % ({point.y})'
                },
                accessibility: {
                    point: {
                        valueSuffix: '%'
                    }
                },
                legend: {
                    itemMarginTop: 5,
                    itemMarginBottom: 5,
                    align: 'left',
                    layout: 'vertical',
                    verticalAlign: 'top',
                },
                responsive: {
                    rules: [{
                        chartOptions: {
                            legend: {
                                enabled: false
                            }
                        },
                        condition: {
                            maxWidth: 580
                        }
                    }]
                },
                plotOptions: {
                    pie: {
                        allowPointSelect: true,
                        cursor: 'pointer',
                        dataLabels: {
                            enabled: true,
                            format: '<b>{point.name}</b>:<br>{point.percentage:.1f} % ({point.y})',
                        },
                        showInLegend: true
                    }
                },
                series: [{
                    name: params && params.series && params.series.title || $filter('translate')('Series Label'),
                    colorByPoint: true,
        
                    data: params.data || [],
                }]
            };
            
        }
        
        return {
            noDataChart               : noDataChart,
            errorChart                : errorChart,
            loadingChart              : loadingChart,
            _deprecated_noDataPieChart: _deprecated_noDataPieChart,
            dailyDEXChart             : function(callback) {

                var dex_volume_chart = {};
                $http.get(appConfig.urls.python_backend() + "/daily_volume_dex_dates").then(function (response) {
                    $http.get(appConfig.urls.python_backend() + "/daily_volume_dex_data").then(function (response2) {

                        dex_volume_chart.options = {
                            animation: true,
                            title: {
                                text: 'Daily DEX Volume in ' + appConfig.branding.coreSymbol + ' for the last 30 days'
                            },
                            tooltip: {
                                trigger: 'axis'
                            },
                            toolbox: {
                                show: true,
                                feature: {
                                    saveAsImage: {show: true, title: "save as image"}
                                }
                            },
                            xAxis: [{
                                boundaryGap: true,
                                data: response.data
                            }],
                            yAxis: [{
                                type: 'value',
                                scale: true,
                                axisLabel: {
                                    formatter: function (value) {
                                        return value;
                                    }
                                }
                            }],
                            calculable: true,
                            series: [{
                                name: 'Volume',
                                type: 'bar',
                                itemStyle: {
                                    normal: {
                                        color: 'green',
                                        borderColor: 'green'
                                    }
                                },
                                data: response2.data
                            }]
                        };
                        callback(dex_volume_chart);
                    });
                });
            },
            TradingView: function(base, quote) {
                var widget = window.tvWidget = new TradingView.widget({
                    fullscreen: true,
                    symbol: base + '_' + quote,
                    interval: '60',
                    container_id: "tv_chart_container",
                    //	BEWARE: no trailing slash is expected in feed URL
                    datafeed: new Datafeeds.UDFCompatibleDatafeed(appConfig.urls.udf_wrapper()),
                    library_path: "charting_library/",
                    locale: getParameterByName('lang') || "en",
                    //	Regression Trend-related functionality is not implemented yet, so it's hidden for a while
                    drawings_access: { type: 'black', tools: [ { name: "Regression Trend" } ] },
                    disabled_features: ["use_localstorage_for_settings"],
                    enabled_features: ["study_templates"],
                    charts_storage_url: 'http://saveload.tradingview.com',
                    charts_storage_api_version: "1.1",
                    client_id: 'tradingview.com',
                    user_id: 'public_user_id'
                });
                function getParameterByName(name) {
                    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
                    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
                        results = regex.exec(location.search);
                    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
                }
            },
            topOperationsChart: function () {
                return new Promise((resolve, reject) => {
    
                    $http.get(appConfig.urls.elasticsearch_wrapper() +
                        "/es/account_history?from_date=now-180d&to_date=now&type=aggs&agg_field=operation_type&size=10")
                         .then(function(response) {
                             
                             const legends = [];
                             const data = [];
                             
                             let c = 0;
                             
                             for(let i = 0; i < response.data.length; i++) {
                                 ++c;
                                 
                                 if(c > 7) { break; }
    
                                 const name =  utilities.operationType(response.data[i].key)[0];
                                 const color =  utilities.operationType(response.data[i].key)[1];
                                 
                                 data.push({
                                     y: response.data[i].doc_count,
                                     name: name,
                                     color: `#${color}`,
                                 });
                             }
    
                             resolve(
                                 pieChart({
                                     series: {
                                        title: $filter('translate')('Operations')
                                     },
                                     data: data
                                 })
                             );
                         }).catch((err) => {
                             reject(err);
                    });
                })
            },
            topProxiesChart: function() {
    
                return new Promise((resolve, reject) => {
    
                    $http.get(appConfig.urls.python_backend() + "/top_proxies").then(function(response) {
        
                        const data = [];
                        const AMOUNT_TO_DISPLAY = 10;
                        
                        let i;
                        
                        for (i in response.data) {
                            
                            data.push({
                                y: response.data[i].bts_weight,
                                name: response.data[i].name
                            });
                            
                            if (data.length >= AMOUNT_TO_DISPLAY) break;
                        }
                        
                        resolve(pieChart({
                            series: {
                                title: $filter('translate')('Proxies')
                            },
                            data: data
                        }));
                    }).catch((err) => {
                        reject(err);
                    });
                    
                });
                
            },
            topMarketsChart: function() {
    
                return new Promise((resolve, reject) => {
    
                    $http.get(appConfig.urls.python_backend() + "/top_markets").then(function(response) {
        
                        const data = [];
                        const amountToDisplay = 10;
                        let i;
                        for (i in response.data) {
                            data.push({
                                value: response.data[i]["24h_volume"],
                                name: response.data[i].pair
                            });
                            if (data.length >= amountToDisplay) break;
                        }
        
                        var markets_chart = {};
                        markets_chart.options = {
                            animation: true,
                            tooltip: {
                                trigger: 'item',
                                formatter: "{a} <br/>{b} : {c} ({d}%)"
                            },
                            legend: {
                                orient: 'vertical',
                                x: 'left',
                                data: data.map(x => x.name)
                            },
                            toolbox: {
                                show: true,
                                feature: {
                                    saveAsImage: {show: true, title: "save as image"}
                                }
                            },
                            calculable: true,
                            series: [{
                                color: ['#81CA80','#6BBCD7', '#E9C842', '#E96562', '#008000', '#FB8817', '#552AFF'],
                                name: 'Traffic source',
                                type: 'pie',
                                radius: ['50%', '70%'],
                                itemStyle: {
                                    normal: {
                                        label: {
                                            show: false
                                        },
                                        labelLine: {
                                            show: false
                                        }
                                    },
                                    emphasis: {
                                        label: {
                                            show: true,
                                            position: 'center',
                                            textStyle: {
                                                fontSize: '30',
                                                fontWeight: 'bold'
                                            }
                                        }
                                    }
                                },
                                data: data
                            }]
                        };
                        resolve(markets_chart);
                    }).catch((err) => {
                        reject(err);
                    });
                    
                });
            },
            topSmartCoinsChart: function() {
    
                return new Promise((resolve, reject) => {
                    $http.get(appConfig.urls.python_backend() + "/top_smartcoins").then(function(response) {
        
                        const data = [];
                        const amountToDisplay = 10;
                        let i;
                        for (i in response.data) {
                            data.push({
                                value: response.data[i]["24h_volume"],
                                name: response.data[i].asset_name
                            });
                            if (data.length >= amountToDisplay) break;
                        }
        
                        var smartcoins_chart = {};
                        smartcoins_chart.options = {
                            animation: true,
                            tooltip: {
                                trigger: 'item',
                                formatter: "{a} <br/>{b} : {c} ({d}%)"
                            },
                            legend: {
                                orient: 'vertical',
                                x: 'left',
                                data: data.map(x => x.name)
                            },
                            toolbox: {
                                show: true,
                                feature: {
                                    saveAsImage: {show: true, title: "save as image"}
                                }
                            },
                            calculable: true,
                            series: [{
                                color: ['#81CA80','#6BBCD7', '#E9C842', '#E96562', '#008000', '#FB8817', '#552AFF'],
                                name: 'Top Smartcoins',
                                type: 'pie',
                                roseType: 'radius',
                                max: 40,
                                itemStyle: {
                                    normal: {
                                        label: {
                                            show: false
                                        },
                                        labelLine: {
                                            show: false
                                        }
                                    },
                                    emphasis: {
                                        label: {
                                            show: true
                                        },
                                        labelLine: {
                                            show: true
                                        }
                                    }
                                },
                                data: data
                            }]
                        };
                        resolve(smartcoins_chart);
                    }).catch((err) => {
                        reject(err);
                    });
                });
                
            },
            topUIAsChart: function() {
    
                return new Promise((resolve, reject) => {
                    $http.get(appConfig.urls.python_backend() + "/top_uias").then(function(response) {
        
                        const data = [];
                        const amountToDisplay = 10;
                        let i;
                        for (i in response.data) {
                            data.push({
                                value: response.data[i]["24h_volume"],
                                name: response.data[i].asset_name
                            });
                            if (data.length >= amountToDisplay) break;
                        }
        
                        var uias_chart = {};
                        uias_chart.options = {
                            animation: true,
                            tooltip: {
                                trigger: 'item',
                                formatter: "{a} <br/>{b} : {c} ({d}%)"
                            },
                            legend: {
                                orient: 'vertical',
                                x: 'left',
                                data: data.map(x => x.name)
                            },
                            toolbox: {
                                show: true,
                                feature: {
                                    saveAsImage: {show: true, title: "save as image"}
                                }
                            },
                            calculable: true,
                            series: [{
                                color: ['#81CA80','#6BBCD7', '#E9C842', '#E96562', '#008000', '#FB8817', '#552AFF'],
                                name: 'Top User Issued Assets',
                                type: 'pie',
                                roseType: 'radius',
                                max: 40,
                                itemStyle: {
                                    normal: {
                                        label: {
                                            show: false
                                        },
                                        labelLine: {
                                            show: false
                                        }
                                    },
                                    emphasis: {
                                        label: {
                                            show: true
                                        },
                                        labelLine: {
                                            show: true
                                        }
                                    }
                                },
                                data: data
                            }]
                        };
                        resolve(uias_chart);
                    }).catch((err) => {
                        reject(err);
                    });
                });
                
            },
            topHoldersChart: function() {
    
                return new Promise((resolve, reject) => {
                    $http.get(appConfig.urls.python_backend() + "/top_holders").then(function(response) {
        
                        const data = [];
                        const amountToDisplay = 10;
                        let i;
                        for (i in response.data) {
                            data.push({
                                value: response.data[i].amount,
                                name: response.data[i].account_name
                            });
                            if (data.length >= amountToDisplay) break;
                        }
        
                        var holders_chart = {};
                        holders_chart.options = {
                            animation: true,
                            tooltip: {
                                trigger: 'item',
                                formatter: "{a} <br/>{b} : {c} ({d}%)"
                            },
                            legend: {
                                orient: 'vertical',
                                x: 'left',
                                data: data.map(x => x.name)
                            },
                            toolbox: {
                                show: true,
                                feature: {
                                    saveAsImage: {show: true, title: "save as image"}
                                }
                            },
                            calculable: true,
                            series: [{
                                color: ['#81CA80','#6BBCD7', '#E9C842', '#E96562', '#008000', '#FB8817', '#552AFF'],
                                name: 'Holders',
                                type: 'pie',
                                radius: ['50%', '70%'],
                                itemStyle: {
                                    normal: {
                                        label: {
                                            show: false
                                        },
                                        labelLine: {
                                            show: false
                                        }
                                    },
                                    emphasis: {
                                        label: {
                                            show: true,
                                            position: 'center',
                                            textStyle: {
                                                fontSize: '30',
                                                fontWeight: 'bold'
                                            }
                                        }
                                    }
                                },
                                data: data
                            }]
                        };
                        resolve(holders_chart);
                    }).catch((err) => {
                        reject(err);
                    });
                    
                });
                
            }
        };
    }

})();
