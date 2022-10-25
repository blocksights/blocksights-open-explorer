(function() {
    'use strict';

    angular.module('app').factory('marketService', marketService);
    marketService.$inject = ['$http', 'utilities', 'appConfig'];

    function marketService($http, utilities, appConfig) {

        return {
            getActiveMarkets: function(lastXHours, callback) {
                let markets = [];
                return $http.get(appConfig.urls.python_backend() + "/most_active_markets?of_last_hours=" + lastXHours).then(function(response) {

                    angular.forEach(response.data, function(value) {
                        const market = {
                            pair: value.pair,
                            price: value.latest_price,
                            volume: value["24h_volume"]
                        };
                        markets.push(market);
                    });

                    callback(markets);
                });
            },
            getAssetMarkets: function(asset_id, callback) {
                let markets = [];
                return $http.get(appConfig.urls.python_backend() + "/markets?asset_id=" + asset_id).then(function(response) {
                    angular.forEach(response.data, function(value) {
                        const market = {
                            pair: value.pair,
                            price: value.latest_price,
                            volume: value["24h_volume"]
                        };
                        markets.push(market);
                    });
                    callback(markets);
                });
            },
            getOrderBook: function(base, quote, base_precision, quote_precision, callback) {
                let order_book = [];
                let asks = [];
                let bids = [];
                $http.get(appConfig.urls.python_backend() + "/order_book?base=" + base + "&quote=" + quote + "&limit=10")
                    .then(function(response) {

                    let total = 0;
                    angular.forEach(response.data.asks, function(value) {
                        total = total + parseFloat(value.base);
                        const parsed = {
                            base: parseFloat(value.base),
                            price: parseFloat(value.price),
                            quote: parseFloat(value.quote),
                            base_precision: base_precision,
                            quote_precision: quote_precision,
                            total: total
                        };
                        asks.push(parsed);
                    });
                    total = 0;
                    angular.forEach(response.data.bids, function(value) {
                        total = total + parseFloat(value.base);
                        const parsed = {
                            base: parseFloat(value.base),
                            price: parseFloat(value.price),
                            quote: parseFloat(value.quote),
                            base_precision: base_precision,
                            quote_precision: quote_precision,
                            total: total
                        };
                        bids.push(parsed);
                    });
                    order_book[0] = asks;
                    order_book[1] = bids;
                    callback(order_book);
                });
            },
            getGroupedOrderBook: function(base, quote, base_precision, quote_precision, callback) {
                let grouped = [];
                $http.get(appConfig.urls.python_backend() + "/grouped_limit_orders?base=" + base + "&quote=" +
                    quote + "&group=10&limit=10")
                    .then(function(response) {

                    angular.forEach(response.data, function(value) {
                        let total_for_sale = value.total_for_sale;
                        const max_base_amount = parseInt(value.max_price.base.amount);
                        const max_quote_amount = parseInt(value.max_price.quote.amount);
                        const min_base_amount = parseInt(value.min_price.base.amount);
                        const min_quote_amount = parseInt(value.min_price.quote.amount);

                        const base_id = value.max_price.base.asset_id;
                        const quote_id = value.max_price.quote.asset_id;

                        const base_array = base_id.split(".");
                        const quote_array = quote_id.split(".");
                        let divide = 0;

                        if(base_array[2] > quote_array[2])
                        {
                            divide = 1;
                        }
                        const qp = Math.pow(10, parseInt(quote_precision));
                        const bp = Math.pow(10, parseInt(base_precision));

                        let max_price;
                        let min_price;
                        let min;
                        let max;
                        if(divide) {
                            max = (max_quote_amount / qp) / (max_base_amount / bp);
                            max_price = 1 / max;
                            min = (min_quote_amount / qp) / (min_base_amount / bp);
                            min_price = 1 / min;
                        }
                        else {
                            max_price = parseFloat(max_base_amount / bp) / parseFloat(max_quote_amount / qp);
                            min_price = parseFloat(min_base_amount / bp) / parseFloat(min_quote_amount / qp);
                        }
                        total_for_sale = Number(total_for_sale/bp);

                        const parsed = {
                                max_price: max_price,
                                min_price: min_price,
                                total_for_sale: total_for_sale,
                                base_precision: base_precision,
                                quote_precision: quote_precision
                        };
                        grouped.push(parsed);
                    });
                    callback(grouped);
                });
            },
            getAssetPrecision: function(asset_id, callback) {
                let precision;
                $http.get(appConfig.urls.python_backend() + "/asset?asset_id=" + asset_id).then(function (response) {
                    precision = response.data.precision;
                    callback(precision);
                });
            },
            getTicker: function(base, quote, callback) {
                let ticker = {};
                $http.get(appConfig.urls.python_backend() + "/ticker?base=" + base + "&quote=" + quote)
                    .then(function(response) {
                    const ticker = {
                        price: response.data.latest,
                        ask: response.data.lowest_ask,
                        bid: response.data.highest_bid,
                        base_volume: parseInt(response.data.base_volume),
                        quote_volume: parseInt(response.data.quote_volume),
                        perc_change: response.data.percent_change,
                        base: base,
                        quote: quote
                        //base_precision: base_precision
                    };
                    callback(ticker);
                });
            },
            getLiquidityPools: function(callback) {
                let pools = [];
                return $http.get(appConfig.urls.python_backend() + "/pools").then(function(response) {
                    angular.forEach(response.data, function(value) {
                        pools.push(value);
                    });
                    callback(pools);
                });
            },
            getLiquidityPool: function(pool_id, callback) {
                return $http.get(appConfig.urls.python_backend() + "/pool?pool_id=" + pool_id + "&full=True").then(function(response) {
                    callback(response.data);
                });
            },
            getLiquidityPoolHistory: function(pool_id, limit, from, callback) {
                return $http.get(appConfig.urls.elasticsearch_wrapper() + "/pool_operation_history"
                    + "?pool_id=" + pool_id
                    + "&offset=" + from
                    + "&limit=" + limit
                    + (from == 0 ? "&from_date=now-1y" : "&from_date=2015-10-10")
                ).then(response => {
                    let last_ops = [];

                    // only add if the op id is not already added (transfer appears in both accounts!)
                    const unique_data = response.data.filter((v,i,a)=>a.findIndex(t=>(t.operation_id_num === v.operation_id_num))===i);

                    angular.forEach(unique_data, function (value) {
                        let operation = {};
                        operation.block_num = value.block_data.block_num;
                        operation.operation_id = value.account_history.operation_id;
                        operation.operation_id_num = value.operation_id_num;
                        operation.time = value.block_data.block_time;
                        operation.witness = value.witness;
                        operation.sequence = value.account_history.sequence;

                        let parsed_op = value.operation_history.op_object;
                        if (parsed_op == undefined)
                            parsed_op = JSON.parse(value.operation_history.op)[1];
                        if (parsed_op.amount)
                            parsed_op.amount_ = parsed_op.amount;
                        const _with_result = {...parsed_op, result: value.operation_history.operation_result};
                        if (typeof _with_result.result === "string") _with_result.result = JSON.parse(value.operation_history.operation_result);
                        utilities.opText(appConfig, $http, value.operation_type, _with_result, function(returnData) {
                            operation.operation_text = returnData;
                        });

                        const type_res =  utilities.operationType(value.operation_type);
                        operation.type = type_res[0];
                        operation.color = type_res[1];

                        last_ops.push(operation);
                    });
                    callback(last_ops);
                });
            },
            getCreditOffers: function () {
                return $http.get(appConfig.urls.python_backend() + "/creditoffers").then((response) => {
                    const data = response && response.data;
                    const fetchNames = data.map((item) => utilities.getAsset(item.acceptable_collateral_raw[0][0]));
                    return Promise.all(fetchNames).then((values) => {
                        values.forEach((value, i) => {
                            data[i].collateral = value.symbol;
                        })
                        
                        return data;
                    })
                })
            },
            getCreditOfferOperationsHistory: function (credit_offer_id, limit, offset, from) {
                let last_ops = [];
                
                return $http.get(appConfig.urls.python_backend() + "/creditoffer_operation_history", { params: {
                        creditoffer_id: credit_offer_id,
                        offset: offset,
                        limit: limit,
                        from: (from == 0 ? "&from_date=now-1y" : "&from_date=2015-10-10")
                    }}).then((response) => {
                        const unique_data = response.data.filter((v,i,a)=>a.findIndex(t=>(t.operation_id_num === v.operation_id_num))===i);

                        angular.forEach(unique_data, function (value) {
                            let operation = {};
                            operation.block_num = value.block_data.block_num;
                            operation.operation_id = value.account_history.operation_id;
                            operation.operation_id_num = value.operation_id_num;
                            operation.time = value.block_data.block_time;
                            operation.witness = value.witness;
                            operation.sequence = value.account_history.sequence;
    
                            let parsed_op = value.operation_history.op_object;
                            if (parsed_op == undefined)
                                parsed_op = JSON.parse(value.operation_history.op)[1];
                            if (parsed_op.amount)
                                parsed_op.amount_ = parsed_op.amount;
                            const _with_result = {...parsed_op, result: value.operation_history.operation_result};
                            if (typeof _with_result.result === "string") _with_result.result = JSON.parse(value.operation_history.operation_result);
                            utilities.opText(appConfig, $http, value.operation_type, _with_result, function(returnData) {
                                operation.operation_text = returnData;
                            });
    
                            const type_res =  utilities.operationType(value.operation_type);
                            operation.type = type_res[0];
                            operation.color = type_res[1];
    
                            last_ops.push(operation);
                        });
                        
                        return last_ops
                })
            }
        };
    }

})();
