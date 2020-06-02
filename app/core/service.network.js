(function() {
    'use strict';

    angular.module('app').factory('networkService', networkService);
    networkService.$inject = ['$http', 'appConfig', 'utilities'];

    function networkService($http, appConfig, utilities) {

        return {
            getHeader: function(callback) {
                let header;
                return $http.get(appConfig.urls.python_backend + "/header").then(function(response) {
                    header = {
                        time: response.data.time,
                        head_block_number: response.data.head_block_number,
                        accounts_registered_this_interval: response.data.accounts_registered_this_interval,
                        bts_market_cap: response.data.bts_market_cap,
                        quote_volume: response.data.quote_volume,
                        witness_count: response.data.witness_count,
                        committee_count: response.data.committee_count
                    };
                    callback(header);
                    $http.get(appConfig.urls.python_backend + "/statistics_per_x?days=1").then(function(response) {
                        header.statistics_per_x = response.data;
                        callback(header);
                    });
                });
            },

            getBigBlocks: function(callback) {
                $http.get(appConfig.urls.elasticsearch_wrapper +
                    "/es/account_history?from_date=now-1w&to_date=now&type=aggs&agg_field=block_data.block_num&size=20")
                    .then(function (response) {

                    let blocks = [];
                    angular.forEach(response.data, function (value) {
                        $http.get(appConfig.urls.python_backend + "/block?block_num=" + value.key).then(function (response) {

                            const parsed = {
                                block_num: value.key,
                                operations: value.doc_count,
                                transactions: response.data.transactions.length,
                                timestamp: response.data.timestamp
                            };
                            blocks.push(parsed);
                        });
                    });
                    callback(blocks);
                });
            },
            getLastOperations: function(limit, from, callback) {
                return $http.get(appConfig.urls.elasticsearch_wrapper + "/es/account_history"
                    + "?size=" + limit
                    + "&from_=" + from
                    + "&from_date=now-180d"
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

                        let parsed_op = value.operation_history.op_object;
                        if (parsed_op == undefined)
                            parsed_op = JSON.parse(value.operation_history.op)[1];
                            if (parsed_op.amount)
                                parsed_op.amount_ = parsed_op.amount;

                        utilities.opText(appConfig, $http, value.operation_type, parsed_op, function(returnData) {
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

            getBigTransactions: function(callback, ofLastHours) {
                return $http.get(
                    appConfig.urls.elasticsearch_wrapper + "/es/account_history" +
                    "?from_date=now-" + ofLastHours + "h" +
                    "&to_date=now" +
                    "&type=aggs" +
                    "&agg_field=block_data.trx_id.keyword" +
                    "&size=20"
                ).then(function (response) {

                    let transactions = [];
                    angular.forEach(response.data, function (value) {
                        if(value.key !== "") {
                            const parsed = {
                                trx_id: value.key,
                                count: value.doc_count
                            };
                            transactions.push(parsed);
                        }
                    });
                    callback(transactions);
                });
            },

            getTransaction: function(trx, callback) {
                return $http.get(appConfig.urls.elasticsearch_wrapper + "/es/trx?trx=" + trx +
                    "&sort=-operation_history.sequence"
                ).then(function(response) {
                    if (response.data && response.data.length == 0) {
                        return null;
                    }
                    let operations = [];
                    angular.forEach(response.data, function (value) {
                        const op = utilities.operationType(value.operation_type);
                        const op_type = op[0];
                        const op_color = op[1];

                        const parsed = {
                            operation_id: value.account_history.operation_id,
                            op_color: op_color,
                            op_type: op_type
                        };

                        let opArray = value.operation_history.op_object;
                        if (opArray == undefined)
                            opArray = JSON.parse(value.operation_history.op)[1];
                        if (opArray.amount)
                            opArray.amount_ = opArray.amount;

                        utilities.opText(appConfig, $http, value.operation_type, opArray, function (returnData) {
                            parsed.operation_text = returnData;
                        });
                        operations.push(parsed);
                    });
                    // only add if the op id is not already added (transfer appears in both accounts!)
                    const unique_data = operations.filter((v,i,a)=>a.findIndex(t=>(t.operation_id === v.operation_id))===i);

                    // meta data
                    const metadata = {
                        hash: response.data[0].block_data.trx_id,
                        counter: response.data[0].operation_history.op_in_trx,
                        block_num: response.data[0].block_data.block_num,
                        date: response.data[0].block_data.block_time
                    };

                    callback({
                        operations: unique_data,
                        meta: metadata
                    });
                });
            },
            getFees: function(callback) {
                let fees = [];
                return $http.get(appConfig.urls.python_backend + "/fees").then(function(response) {
                    let basic_fee = 0;
                    for(var i = 0; i < response.data.parameters.current_fees.parameters.length; i++) {
                        if (response.data.parameters.current_fees.parameters[i][1].fee) {
                            basic_fee = response.data.parameters.current_fees.parameters[i][1].fee;
                        }
                        else {
                            basic_fee = response.data.parameters.current_fees.parameters[i][1].basic_fee;
                        }
                        var op_type  = utilities.operationType(response.data.parameters.current_fees.parameters[i][0]);

                        const fee = {
                            identifier: response.data.parameters.current_fees.parameters[i][0],
                            operation: op_type[0],
                            color: op_type[1],
                            basic_fee: utilities.formatBalance(basic_fee, 5),
                            premium_fee: utilities.formatBalance(response.data.parameters.current_fees.parameters[i][1].premium_fee, 5),
                            price_per_kbyte: utilities.formatBalance(response.data.parameters.current_fees.parameters[i][1].price_per_kbyte, 5)
                        };
                        fees.push(fee);
                    }
    
                    callback(fees);
                });
            },
            getOperation: function(operation, callback) {
                let op;
                $http.get(appConfig.urls.python_backend + "/operation?operation_id=" + operation).then(function(response) {
                    const raw_obj = response.data.op;
                    const op_type =  utilities.operationType(response.data.op_type);

                    console.log(response)

                    utilities.opText(appConfig, $http, response.data.op_type, raw_obj, function(returnData) {
                        op = {
                            name: operation,
                            block_num: response.data.block_num,
                            virtual_op: response.data.virtual_op,
                            trx_in_block: response.data.trx_in_block,
                            op_in_trx: response.data.op_in_trx,
                            result: response.data.result,
                            type: op_type[0],
                            color: op_type[1],
                            raw: raw_obj,
                            operation_text: returnData,
                            block_time: response.data.block_time,
                            trx_id: response.data.trx_id
                        };
                        callback(op);
                    });
                });
            },
            getBlock: function(block_num, callback) {
                let block;
                $http.get(appConfig.urls.python_backend + "/block?block_num=" + block_num).then(function (response) {
                    let operations_count = 0;
                    for (var i = 0; i < response.data.transactions.length; i++) {
                        operations_count = operations_count + response.data.transactions[i].operations.length;
                    }
                    block = {
                        transactions: response.data.transactions,
                        block_num: block_num,
                        previous: response.data.previous,
                        timestamp: response.data.timestamp,
                        witness: response.data.witness,
                        witness_signature: response.data.witness_signature,
                        transaction_merkle_root: response.data.transaction_merkle_root,
                        transactions_count: response.data.transactions.length,
                        operations_count: operations_count,
                        next: parseInt(block_num) + 1,
                        prev: parseInt(block_num) - 1
                    };
                    callback(block);
                });
            },
            getObject: function(object, callback) {
                $http.get(appConfig.urls.python_backend + "/object?object=" + object).then(function(response) {
                    const object_id = response.data.id;
                    const object_type = utilities.objectType(object_id);

                    const object = {
                        raw: response.data,
                        name: object_id,
                        type: object_type
                    };
                    callback(object);
                });
            }
        };
    }

})();
