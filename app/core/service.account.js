(function() {
    'use strict';

    angular.module('app').factory('accountService', accountService);
    accountService.$inject = ['$http', 'appConfig', 'utilities', 'assetService'];

    function accountService($http, appConfig, utilities, assetService) {

        return {
            getRichList: function(callback) {
                $http.get(appConfig.urls.python_backend + "/accounts").then(function(response) {
                    var richs = [];
                    for(var i = 0; i < response.data.length; i++) {
                        var amount = utilities.formatBalance(response.data[i].amount, 5);
                        var account = {
                            name: response.data[i].name,
                            id: response.data[i].account_id,
                            amount: amount
                        };
                        richs.push(account);
                    }
                    callback(richs);
                });
            },
            // Todo: Cache
            checkIfWorker: function(account_id, callback) {
                var results = [];
                var is_worker = false;
                var worker_votes = 0;
                $http.get(appConfig.urls.python_backend + "/workers").then(function (response) {
                    for (var i = 0; i < response.data.length; i++) {
                        var worker_account = response.data[i][0].worker_account;
                        if (worker_account === account_id) {
                            is_worker = true;
                            worker_votes = utilities.formatBalance(response.data[i][0].total_votes_for, 5);
                            results[0] = is_worker;
                            results[1] = worker_votes;
                            callback(results);
                            break;
                        }
                    }
                });
            },
            checkIfWitness: function(account_id, callback) {
                var results = [];
                var is_witness = false;
                var witness_votes = 0;
                $http.get(appConfig.urls.python_backend + "/witnesses").then(function (response) {
                    for (var i = 0; i < response.data.length; i++) {
                        var witness_account = response.data[i].witness_account;
                        if (witness_account === account_id) {
                            is_witness = true;
                            witness_votes = utilities.formatBalance(response.data[i].total_votes, 5);
                            results[0] = is_witness;
                            results[1] = witness_votes;
                            results[2] = witness_account;
                            results[3] = response.data[i].witness_account_name;
                            results[4] = response.data[i].id;
                            results[5] = response.data[i].url;
                            callback(results);
                            break;
                        }
                    }
                });
            },
            checkIfCommittee: function(account_id, callback) {
                var results = [];
                var is_committee_member = false;
                var committee_votes = 0;
                $http.get(appConfig.urls.python_backend + "/committee_members").then(function (response) {
                    for (var i = 0; i < response.data.length; i++) {
                        var committee_member_account = response.data[i][0].committee_member_account;
                        if (committee_member_account === account_id) {
                            is_committee_member = true;
                            committee_votes = utilities.formatBalance(response.data[i][0].total_votes, 5);
                            results[0] = is_committee_member;
                            results[1] = committee_votes;
                            results[2] = committee_member_account;
                            results[3] = response.data[i][0].committee_member_account_name;
                            results[4] = response.data[i][0].id;
                            results[5] = response.data[i][0].url;

                            callback(results);
                            break;
                        }
                    }
                });
            },
            checkIfProxy: function(account_id, callback) {
                var results = [];
                var is_proxy = false;
                var proxy_votes = 0;
                $http.get(appConfig.urls.python_backend + "/top_proxies").then(function (response) {
                    for (var i = 0; i < response.data.length; i++) {
                        var proxy_account = response.data[i].id;
                        if (proxy_account === account_id) {
                            is_proxy = true;
                            proxy_votes = utilities.formatBalance(response.data[i].bts_weight, 5);
                            results[0] = is_proxy;
                            results[1] = proxy_votes;
                            callback(results);
                            break;
                        }
                    }
                });
            },
            getReferrers: function(account_id, page, callback) {
                var results = [];
                $http.get(appConfig.urls.python_backend + "/all_referrers?account_id=" + account_id + "&page=" + page)
                    .then(function (response) {

                    for (var i = 0; i < response.data.length; i++) {
                        var referrer = {
                            account_id: response.data[i].account_id,
                            account_name: response.data[i].account_name
                        };
                        results.push(referrer);
                    }
                    callback(results);
                });
            },
            getReferrerCount: function(account, callback) {
                var count = 0;
                $http.get(appConfig.urls.python_backend + "/referrer_count?account_id=" + account)
                    .then(function (response) {
                    count = response.data;
                    callback(count);
                });
            },
            getFullAccount: function(account, callback) {
                var full_account = {};
                $http.get(appConfig.urls.python_backend + "/full_account?account_id=" + account)
                    .then(function (response) {
                    full_account  = response.data;
                    callback(full_account);
                });
            },
            getTotalAccountOps: function(account_id, callback) {
                // @deprecated creates massive load, remove
                $http.get(appConfig.urls.elasticsearch_wrapper + "/es/account_history?account_id="+account_id+
                    "&from_date=2015-10-10&to_date=now&type=count").then(function(response) {
                        var count = 0;
                        angular.forEach(response.data, function (value, key) {
                            count = count + value.doc_count;
                        });
                    callback(count);
                });
            },
            getAccountName: function(account_id, callback) {
                var account_name = "";
                $http.get(appConfig.urls.python_backend + "/account_name?account_id=" + account_id)
                    .then(function (response) {
                    account_name = response.data;
                    callback(account_name);
                });
            },
            parseAuth: function(auth, type, callback) {
                var results = [];
                angular.forEach(auth, function (value, key) {
                    var authline = {};
                    if(type === "key") {
                        authline = {
                            key: value[0],
                            threshold: value[1]
                        };
                        results.push(authline);
                    }
                    else if(type === "account") {
                        $http.get(appConfig.urls.python_backend + "/account_name?account_id=" + value[0])
                            .then(function (response) {
                            authline = {
                                account: value[0],
                                threshold: value[1],
                                account_name: response.data
                            };
                            results.push(authline);
                        });
                    }
                });
                callback(results);
            },
            parseBalance: function(limit_orders, call_orders, balance, precision, symbol, callback) {
                var limit_orders_counter = 0;
                angular.forEach(limit_orders, function (value, key) {
                    if (value.sell_price.quote.asset_id === balance.asset_type) {
                        limit_orders_counter++;
                    }
                });
                var call_orders_counter = 0;
                angular.forEach(call_orders, function (value, key) {
                    if (value.call_price.quote.asset_id === balance.asset_type) {
                        call_orders_counter++;
                    }
                });
                var balanceline = {
                    asset: balance.asset_type,
                    asset_name: symbol,
                    balance: parseFloat(utilities.formatBalance(balance.balance, precision)),
                    id: balance.id,
                    //owner: balance.owner,
                    call_orders_counter: parseInt(call_orders_counter),
                    limit_orders_counter: parseInt(limit_orders_counter)
                };
                callback(balanceline);
            },
            parseVotes: function(votes, callback) {
                var results = [];
                angular.forEach(votes, function (value, key) {
                    var type = "";
                    var account;
                    var votable_object_name = "";
                    var votes_for = 0;
                    if (value.id.substr(0, 4) === "1.6.") {
                        type = "Witness";
                        account = value.witness_account;
                        votes_for = value.total_votes;
                    }
                    else if (value.id.substr(0, 4) === "1.5.") {
                        type = "Committee Member";
                        account = value.committee_member_account;
                        votes_for = value.total_votes;
                    }
                    else if (value.id.substr(0, 4) === "1.14") {
                        type = "Worker";
                        account = value.worker_account;
                        votable_object_name = value.name;
                        votes_for = value.total_votes_for;
                    }
                    else {
                        type = "Other";
                        account = "No name";
                    }
                    $http.get(appConfig.urls.python_backend + "/account_name?account_id=" + account)
                        .then(function (response) {
                        var parsed = {
                            id: value.id,
                            type: type,
                            account: account,
                            account_name: response.data,
                            votable_object_name: votable_object_name,
                            votes_for: votes_for
                        };
                        results.push(parsed);
                    });
                });
                callback(results);
            },
            parseUIAs: function(assets, callback) {
                var results = [];
                angular.forEach(assets, function (value, key) {
                    //console.log(this);
                    assetService.getAssetNameAndPrecision(value, function (returnData) {
                        var uia = {
                            asset_id: value,
                            asset_name: returnData.symbol
                        };
                        results.push(uia);
                    });
                });
                callback(results);
            },

            parseProposals: function(proposals, callback) {
                var results = [];
                angular.forEach(proposals, function (value, key) {
                    var proposal = {
                        id: value
                    };
                    results.push(proposal);
                });
                callback(results);
            },
            parseVesting: function(vesting_balances, callback) {
                var results = [];
                if (vesting_balances.length > 0) {
                    angular.forEach(vesting_balances, function (value, key) {
                        assetService.getAssetNameAndPrecision(value.balance.asset_id, function (returnData) {
                            var vesting = {
                                id: value.id,
                                balance: utilities.formatBalance(value.balance.amount, returnData.precision),
                                asset_id: value.balance.asset_id,
                                asset_name: returnData.symbol
                            };
                            results.push(vesting);
                        });
                    });
                    callback(results);
                }
            },
            getAccountHistory: function(account_id, start, limit, callback) {
                return $http.get(appConfig.urls.elasticsearch_wrapper + "/es/account_history?account_id=" +
                    account_id + (start != null ? "&search_after=" + start : "") + "&size=" + limit + "&sort_by=-account_history.sequence")
                    .then(function (response) {

                    var results = [];
                    var c = 0;
                    angular.forEach(response.data, function (value, key) {
                        var timestamp;
                        var witness;
                        var op = utilities.operationType(value.operation_type);
                        var op_type = op[0];
                        var op_color = op[1];
                        var time = new Date(value.block_data.block_time);
                        timestamp = time.toLocaleString();
                        witness = value.witness;
                        var parsed_op = value.operation_history.op_object;
                        if (parsed_op == undefined)
                            parsed_op = JSON.parse(value.operation_history.op)[1];
                        if (parsed_op.amount)
                            parsed_op.amount_ = parsed_op.amount;
                        var operation = {
                            operation_id: value.account_history.operation_id,
                            block_num: value.block_data.block_num,
                            time: timestamp,
                            witness: witness,
                            op_type: op_type,
                            op_color: op_color,
                            sequence: value.account_history.sequence
                        };
                        utilities.opText(appConfig, $http, value.operation_type, parsed_op,
                            function(returnData) {
                            operation.operation_text = returnData;
                        });
                        results.push(operation);
                    });
                    callback(results);
                });
            },
            getVotingStats: function(account_id, callback) {
                $http.get(
                    appConfig.urls.python_backend + "/account_voting_power?account_id=" + account_id
                ).then(
                    function (response) {
                        callback(response.data);
                    }
                );
            },
        };
    }
})();
