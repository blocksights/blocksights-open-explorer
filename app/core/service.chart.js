(function() {
    'use strict';

    angular.module('app').factory('chartService', chartService);
    chartService.$inject = ['$http', 'appConfig', 'utilities', '$filter'];

    function chartService($http, appConfig, utilities, $filter) {

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
         * @param {string}  [params.noData]         - The no data message
         * @param {array}   [params.data]           - The chart data
         * @param {object}  [params.series]         - The chart series options
         * @param {object}  [params.series.title]   - The title of series
         *
         * */
        function pieChart(params) {

            /**
             * For some reason, if to pass the series with empty data array, the highcharts throws the error
             * To avoid this, the code below does the check for empty data and returns the noDataChart
             * instead of pieChart
             * */
            if(Array.isArray(params.data) && params.data.length === 0) {
                return noDataChart(params.noData);
            }

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

        /**
         * @param {object}  params
         * @param {array}   params.categories       -
         * @param {array}   params.data             -
         * @param {string}  [params.title]          -
         * @param {object}  [params.series]         -
         * @param {string}  [params.series.title]   -
         * @param {object}  [params.xAxis.title]    - title for xAxis
         * @param {object}  [params.yAxis.title]    - title for yAxis
         */

        function barChart(params) {

            return {
                chart: {
                    type: 'column'
                },
                title: {
                    text: params.title || '',
                },
                yAxis: {
                    title: {
                        text: params && params.yAxis && params.yAxis.title || ''
                    },
                },
                xAxis: {
                    type: 'category',
                    title: {
                        text: params && params.xAxis && params.xAxis.title || ''
                    },
                    categories: params.categories || [],
                    labels: {
                        style: {
                            fontSize: '10px',
                            fontFamily: 'Verdana, sans-serif'
                        }
                    }
                },
                legend: {
                    enabled: false
                },
                series: [{
                    name: params && params.series && params.series.title || $filter('translate')('Series Label'),
                    data: params.data,
                }],
                responsive: {
                    rules: [{
                        chartOptions: {
                            xAxis: {
                                labels: {
                                    step: 20
                                }
                            }
                        },
                        condition: {
                            maxWidth: 360,
                        }
                    }, {
                        chartOptions: {
                            xAxis: {
                                labels: {
                                    step: 15
                                }
                            }
                        },
                        condition: {
                            minWidth: 360,
                            maxWidth: 550,
                        }
                    }, {
                        chartOptions: {
                            xAxis: {
                                labels: {
                                    step: 10
                                }
                            }
                        },
                        condition: {
                            minWidth: 550,
                            maxWidth: 750,
                        }
                    }, {
                        chartOptions: {
                            xAxis: {
                                labels: {
                                    step: 8
                                }
                            }
                        },
                        condition: {
                            minWidth: 750,
                        }
                    }]
                },
            };
        }

        /**
         * @param {object}  params
         * @param {array}   params.categories       -
         * @param {array}   params.data             -
         * @param {string}  [params.title]          -
         * @param {object}  [params.series]         -
         * @param {string}  [params.series.title]   -
         * @param {object}  [params.xAxis.title]    - title for xAxis
         * @param {object}  [params.yAxis.title]    - title for yAxis
         */

        function lineChart(params) {

            return {
                title: {
                    text: params.title || '',
                },
                yAxis: params && params.yAxis ? params.yAxis : {
                    title: {
                        text: ''
                    },
                },
                plotOptions: {
                    series: {
                        connectNulls: true
                    }
                },
                xAxis: params && params.xAxis ? params && params.xAxis : {
                    title: {
                        text: ''
                    },
                },
                legend: params && params.legend ? params.legend : {
                    enabled: false
                },
                series: params && params.series,
                responsive: {
                    rules: [{
                        chartOptions: {
                            xAxis: {
                                labels: {
                                    step: 20
                                }
                            }
                        },
                        condition: {
                            maxWidth: 360,
                        }
                    }, {
                        chartOptions: {
                            xAxis: {
                                labels: {
                                    step: 15
                                }
                            }
                        },
                        condition: {
                            minWidth: 360,
                            maxWidth: 550,
                        }
                    }, {
                        chartOptions: {
                            xAxis: {
                                labels: {
                                    step: 10
                                }
                            }
                        },
                        condition: {
                            minWidth: 550,
                            maxWidth: 750,
                        }
                    }, {
                        chartOptions: {
                            xAxis: {
                                labels: {
                                    step: 8
                                }
                            }
                        },
                        condition: {
                            minWidth: 750,
                        }
                    }]
                },
            };
        }

        return {
            noDataChart               : noDataChart,
            errorChart                : errorChart,
            loadingChart              : loadingChart,
            dailyDEXChart             : function() {

                return new Promise((resolve, reject) => {

                    $http.get(appConfig.urls.python_backend() + "/daily_volume_dex_dates").then(function (response) {
                        $http.get(appConfig.urls.python_backend() + "/daily_volume_dex_data").then(function (response2) {

                            const chartData = barChart({
                                categories: response.data,
                                title: $filter('translate')('Daily DEX Volume Chart Title', {
                                    symbol: appConfig.branding.coreSymbol
                                }),
                                series: {
                                    title: $filter('translate')('Daily DEX Volume Chart Series Title', {
                                        symbol: appConfig.branding.coreSymbol
                                    }),
                                },
                                data: response2.data,
                            });

                            resolve(chartData);

                        }).catch((err) => {
                            reject(err);
                        });
                    }).catch((err) => {
                        reject(err);
                    });

                });

            },
            TradingView: function(base, quote) {
                var widget = window.tvWidget = new TradingView.widget({
                    fullscreen: false,
                    symbol: base + '_' + quote,
                    interval: '60',
                    container_id: "tv_chart_container",
                    //	BEWARE: no trailing slash is expected in feed URL
                    datafeed: new Datafeeds.UDFCompatibleDatafeed(appConfig.urls.udf_wrapper(), 360 * 1000),
                    library_path: "charting_library/",
                    locale: getParameterByName('lang') || "en",
                    //	Regression Trend-related functionality is not implemented yet, so it's hidden for a while
                    drawings_access: { type: 'black', tools: [ { name: "Regression Trend" } ] },
                    disabled_features: ["header_saveload", "use_localstorage_for_settings"],
                    enabled_features: ["study_templates"],
                    autosize: true,
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
            PoolTradingView: function(poolId) {
                var widget = window.tvWidget = new TradingView.widget({
                    fullscreen: false,
                    symbol: poolId,
                    interval: '60',
                    container_id: "pool_tv_chart_container",
                    //	BEWARE: no trailing slash is expected in feed URL
                    datafeed: new Datafeeds.UDFCompatibleDatafeed(appConfig.urls.python_backend() + "/pool/udf", 360 * 1000),
                    library_path: "charting_library/",
                    locale: getParameterByName('lang') || "en",
                    //	Regression Trend-related functionality is not implemented yet, so it's hidden for a while
                    drawings_access: { type: 'black', tools: [ { name: "Regression Trend" } ] },
                    disabled_features: ["header_saveload", "use_localstorage_for_settings"],
                    enabled_features: ["study_templates"],
                    autosize: true,
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
                                    noData: $filter('translate')('No data about operations'),
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
                                y:  response.data[i].voting_power,
                                name: response.data[i].name
                            });

                            if (data.length >= AMOUNT_TO_DISPLAY) break;
                        }

                        resolve(pieChart({
                            noData: $filter('translate')('No data about proxies'),
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
                                y: response.data[i]["24h_volume"],
                                name: response.data[i].pair
                            });
                            if (data.length >= amountToDisplay) break;
                        }

                        resolve(pieChart({
                            noData: $filter('translate')('No data about markets'),
                            series: {
                                title:  $filter('translate')('Traffic Source')
                            },
                            data: data,
                        }));

                    }).catch((err) => {
                        reject(err);
                    });

                });
            },
            topSmartCoinsChart: function() {

                return new Promise((resolve, reject) => {
                    $http.get(appConfig.urls.python_backend() + "/top_smartcoins").then(function(response) {
                        const data = [];
                        const AMOUNT_TO_DISPLAY = 10;
                        let i;

                        for (i in response.data) {
                            data.push({
                                y: response.data[i]["24h_volume"],
                                name: response.data[i].asset_name
                            });
                            if (data.length >= AMOUNT_TO_DISPLAY) break;
                        }

                        resolve(pieChart({
                            noData: $filter('translate')('No data about smartcoins'),
                            series: {
                                title: $filter('translate')('Top Smartcoins')
                            },
                            data: data,
                        }));

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
                                y: response.data[i]["24h_volume"],
                                name: response.data[i].asset_name
                            });
                            if (data.length >= amountToDisplay) break;
                        }

                        resolve(pieChart({
                            noData: $filter('translate')('No data about UIAs'),
                            series: {
                                title: $filter('translate')('Top User Issued Assets')
                            },
                            data: data,
                        }));
                    }).catch((err) => {
                        reject(err);
                    });
                });

            },
            votingActivityChart: function() {
                console.log("todo")
                return null;
            },
            topHoldersChart: function() {

                return new Promise((resolve, reject) => {
                    $http.get(appConfig.urls.python_backend() + "/top_holders").then(function (response) {

                        const data = [];
                        const amountToDisplay = 10;
                        let i;

                        for (i in response.data) {
                            data.push({
                                y: response.data[i].amount,
                                name : response.data[i].account_name
                            });
                            if (data.length >= amountToDisplay) break;
                        }

                        resolve(pieChart({
                            series: {
                                title: $filter('translate')('Holders')
                            },
                            noData: $filter('translate')('No data about holders'),
                            data: data,
                        }));

                    }).catch((err) => {
                        reject(err);
                    });

                });

            },
            blocksProducedChart: function () {
                return new Promise((resolve, reject) => {
                    $http.get(appConfig.urls.python_backend() + "/block_statistics").then((response) => {

                        resolve(barChart({
                            categories: response.data.block_num,
                            xAxis: {
                                title: $filter('translate')('Block number symbol')
                            },
                            yAxis: {
                                title: $filter('translate')('Operations Count')
                            },
                            series: {
                                title: $filter('translate')('Operations')
                            },
                            data: response.data.op_count
                        }));

                    }).catch((err) => {
                        reject(err);
                    })
                });
            },
            priceFeedChart: function (publisher) {
                return new Promise((resolve, reject) => {
                    $http.get(appConfig.urls.python_backend() + "/pricefeed?publisher=" + publisher + "&from_date=now-7d").then((response) => {
                        resolve(lineChart({
                            categories: response.data.blocks,
                            xAxis: {
                                title: $filter('translate')('Block number')
                            },
                            yAxis: {
                                title: $filter('translate')('Price (base BTS)')
                            },
                            series: Object.keys(response.data).map(asset => {
                                let publisher_data = response.data[asset][Object.keys(response.data[asset])[0]]
                                return {
                                    name: asset,
                                    data: publisher_data["feed"]
                                }
                            }),
                            legend: {
                                enabled: true
                            },
                        }));

                    }).catch((err) => {
                        reject(err);
                    })
                });
            },
            depthChart: function (pool) {
                return new Promise((resolve, reject) => {
                    const prices = [
                        {
                            type: 'area',
                            name: "",
                            data: [
                                [1/pool.details.price_sell_b_per_percent["10"], +pool.details.asset_b.float*0.1*pool.details.price_sell_b_per_percent["10"]],
                                [1/pool.details.price_sell_b_per_percent["5"], +pool.details.asset_b.float*0.05*pool.details.price_sell_b_per_percent["5"]],
                                [1/pool.details.price_sell_b_per_percent["1"], +pool.details.asset_b.float*0.01*pool.details.price_sell_b_per_percent["1"]]
                            ]
                        },
                        {
                            type: 'area',
                            name: "",
                            data: [
                                [pool.details.price_sell_a_per_percent["1"], +pool.details.asset_a.float*0.01],
                                [pool.details.price_sell_a_per_percent["5"], +pool.details.asset_a.float*0.05],
                                [pool.details.price_sell_a_per_percent["10"], +pool.details.asset_a.float*0.1]
                            ]
                        }
                    ];
                    resolve(lineChart({
                        categories: [1, 5, 10],
                        xAxis: {
                            title: $filter('translate')('Price') + " " + pool.details.price_sell_a_per_percent["unit"]
                        },
                        yAxis: {
                            title: $filter('translate')('Depth') + " " + pool.asset_a_symbol
                        },
                            plotOptions: {
                                area: {
                                    fillColor: {
                                        linearGradient: {
                                            x1: 0,
                                            y1: 0,
                                            x2: 0,
                                            y2: 1
                                        },
                                        stops: [
                                            [0, Highcharts.getOptions().colors[0]],
                                            [1, Highcharts.color(Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba')]
                                        ]
                                    },
                                    marker: {
                                        radius: 2
                                    },
                                    lineWidth: 1,
                                    states: {
                                        hover: {
                                            lineWidth: 1
                                        }
                                    },
                                    threshold: null
                                }
                            },
                        series: prices,
                        legend: {
                            enabled: true
                        },
                    }));
                });
            },
            balanceChart: function (pool) {
                return new Promise((resolve, reject) => {
                    $http.get(appConfig.urls.python_backend() + "/pool_balance_history?pool_id=" + pool.id + "&last_x=200").then((response) => {
                        const series = [
                            {
                                name: "Asset A: " + pool.asset_a_symbol,
                                data: [],
                                yAxis: 0
                            },
                            {
                                name: "Asset B: " + pool.asset_b_symbol,
                                data: [],
                                yAxis: 1
                            },
                            {
                                name: "Share Asset: " + pool.share_asset_symbol,
                                data: [],
                                yAxis: 2
                            }
                        ];
                        for (let i = 0; i < response.data.blocks.length; i++) {
                            series[0].data.push([new Date(response.data.blocks[i] + "Z").getTime(), response.data.balances.asset_a[i]])
                            series[1].data.push([new Date(response.data.blocks[i] + "Z").getTime(), response.data.balances.asset_b[i]])
                            series[2].data.push([new Date(response.data.blocks[i] + "Z").getTime(), response.data.balances.share_asset[i]])
                        }
                        resolve(lineChart({
                            xAxis: {
                                title: $filter('translate')('Time'),
                                type: "datetime",
                                labels: {
                                    formatter: function()  {
                                        return $filter('date')(new Date(this.value), appConfig.dateFormat);
                                    }
                                },
                            },
                            yAxis: [
                                {
                                    title:  {
                                        text: $filter('translate')('Asset A') + ": " + pool.asset_a_symbol,
                                        style: {
                                            color: Highcharts.getOptions().colors[0]
                                        }
                                    },
                                    opposite: true,
                                    labels: {
                                        format: '{value}',
                                        style: {
                                            color: Highcharts.getOptions().colors[0]
                                        }
                                    },
                                }, {
                                    title: {
                                        text: $filter('translate')('Asset B') + ": " + pool.asset_b_symbol,
                                        style: {
                                            color: Highcharts.getOptions().colors[1]
                                        }
                                    },
                                    opposite: true,
                                    labels: {
                                        format: '{value}',
                                        style: {
                                            color: Highcharts.getOptions().colors[1]
                                        }
                                    },
                                }, {
                                    title: {
                                        text: $filter('translate')('Share Asset') + ": " + pool.share_asset_symbol,
                                        style: {
                                            color: Highcharts.getOptions().colors[2]
                                        }
                                    },
                                    labels: {
                                        format: '{value}',
                                        style: {
                                            color: Highcharts.getOptions().colors[2]
                                        }
                                    },
                                }
                            ],
                            series: series,
                            legend: {
                                enabled: true
                            },
                        }));
                    });
                });
            },
        };
    }

})();
