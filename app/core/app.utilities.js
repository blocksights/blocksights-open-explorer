(function() {
    'use strict';

    angular.module('app')
        .factory('utilities', ['$filter', utilities]);

    function utilities($filter) {

        function satToFloat(number, presicion) {
            var divideby =  Math.pow(10, presicion);
            return Number(number/divideby);
        }

        function formatNumber(x, precision=null) {
            try {
                if (x == 0) {
                    return "0";
                }
                if (precision != null) {
                    x = satToFloat(x, precision);
                }
                let parts = x.toString().split(".");

                if (parts.length > 1) {
                    if (x < 1) {
                        parts[1] = parts[1].substr(0, 6);
                    } else if (x > 1 && x < 100) {
                        parts[1] = parts[1].substr(0, 4);
                    } else if (x > 100 && x < 1000) {
                        parts[1] = parts[1].substr(0, 3);
                    } else if (x > 1000 && x < 100000) {
                        parts[1] = parts[1].substr(0, 2);
                    } else if (x > 100000 && x < 1000000) {
                        parts[1] = parts[1].substr(0, 1);
                    } else if (x > 1000000) {
                        parts[1] = "";
                    }
                }

                parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                if (x > 1000000 || parts.length == 1) { return parts[0]; }
                else { return parts.join("."); }
            }
            catch(err) {
                if (!!x) {
                    return x.toString();
                } else {
                    return "-";
                }
            }
        }

        return {
            formatBalance: function (number, precision=null) {
                return formatNumber(number, precision);
            },
            opFees: async function (appConfig, $http, operation_type, raw_obj) {
                let feeAsset = await $http.get(appConfig.urls.python_backend() + "/asset?asset_id=" + raw_obj.fee.asset_id);
                feeAsset = feeAsset.data;
                let fees = [
                    {
                        key: "op",
                        float: formatNumber(raw_obj.fee.amount, feeAsset.precision),
                        symbol: feeAsset.symbol
                    }
                ];
                if (operation_type === 4) {
                    fees[0].key = "market";
                } else if (operation_type === 63) {
                    for (let i = 0; i < raw_obj.result[1].fees.length; i++) {
                        let fee = raw_obj.result[1].fees[i];
                        if (fee.amount > 0) {
                            feeAsset = await $http.get(appConfig.urls.python_backend() + "/asset?asset_id=" + fee.asset_id);
                            feeAsset = feeAsset.data;
                            fees.push(
                                {
                                    key: (i < 2) ? "market" : "pool",
                                    float: formatNumber(fee.amount, feeAsset.precision),
                                    symbol: feeAsset.symbol,
                                }
                            )
                        }
                    };
                }
                fees.forEach(fee => {
                    fee.text = $filter('translateWithLinks')('Amount Link', {
                        assetLink: {
                            text: fee.symbol,
                            href: `/#/assets/${fee.symbol}`
                        },
                        float: fee.float
                    });
                });
                return fees;
            },
            opText: function (appConfig, $http, operation_type, operation, callback) {
                var operation_account = 0;
                var operation_text;
                var fee_paying_account;
                
                // function to reduce the amount of duplicated code within operation account fetch
                const getAccount = (account_id) => {
                    return $http.get(appConfig.urls.python_backend() + "/account_name?account_id=" + account_id).then((response) => response.data);
                }
                
                // function to reduce the amount of duplicated code within operation asset fetch/amount calculation
                const getAsset = (asset_id, amount = 0) => {
                    return $http.get(appConfig.urls.python_backend() + "/asset?asset_id=" + asset_id).then((asset) => {
                        return {
                            asset: asset.data,
                            symbol: asset.data.symbol,
                            amount: formatNumber(amount, asset.data.precision)
                        }
                    })
                }
                
                const getLink = () => ({
                    asset: (assetName) => ({
                        text: assetName,
                        href: `/#/assets/${assetName}`
                    }),
                    account: (accountName) => ({
                        text: accountName,
                        href: `/#/accounts/${accountName}`
                    })
                })
                
                const translateCallback = (key, params = {}) => {
                    callback(
                        $filter('translateWithLinks')(key, {
                            ...params
                        })
                    )
                }

                if (operation_type === 0) {
                    var from = operation.from;
                    var to = operation.to;

                    var amount_asset_id = operation.amount_.asset_id;
                    var amount_amount = operation.amount_.amount;

                    operation_account = from;

                    $http.get(appConfig.urls.python_backend() + "/account_name?account_id=" + operation_account)
                        .then(function (response_name) {

                            // get me the to name:
                            $http.get(appConfig.urls.python_backend() + "/account_name?account_id=" + to)
                                .then(function (response_name_to) {
                                    var to_name = response_name_to.data;

                                    $http.get(appConfig.urls.python_backend() + "/asset?asset_id=" + amount_asset_id)
                                        .then(function (response_asset) {

                                            var asset_name = response_asset.data.symbol;
                                            var asset_precision = response_asset.data.precision;

                                            var divideby = Math.pow(10, asset_precision);
                                            var amount = Number(amount_amount / divideby);

                                            operation_text = $filter('translateWithLinks')('Operation Transfer Description', {
                                                senderLink: {
                                                    text: response_name.data,
                                                    href: `/#/accounts/${response_name.data}`
                                                },
                                                assetLink: {
                                                    text: asset_name,
                                                    href: `/#/assets/${asset_name}`
                                                },
                                                receiverLink: {
                                                    text: to_name,
                                                    href: `/#/accounts/${to_name}`
                                                },
                                                amount: formatNumber(amount),
                                            })

                                            callback(operation_text);
                                    });
                            });
                    });
                }
                else if (operation_type === 1) {
                    var seller = operation.seller;
                    operation_account = seller;

                    var amount_to_sell_asset_id = operation.amount_to_sell.asset_id;
                    var amount_to_sell_amount = operation.amount_to_sell.amount;

                    var min_to_receive_asset_id = operation.min_to_receive.asset_id;
                    var min_to_receive_amount = operation.min_to_receive.amount;

                    $http.get(appConfig.urls.python_backend() + "/account_name?account_id=" + operation_account)
                        .then(function (response_name) {

                            $http.get(appConfig.urls.python_backend() + "/asset?asset_id=" + amount_to_sell_asset_id)
                                .then(function (response_asset1) {

                                    var sell_asset_name = response_asset1.data.symbol;
                                    var sell_asset_precision = response_asset1.data.precision;

                                    var divideby = Math.pow(10, sell_asset_precision);
                                    var sell_amount = Number(amount_to_sell_amount / divideby);

                                    $http.get(appConfig.urls.python_backend() + "/asset?asset_id=" +
                                        min_to_receive_asset_id)
                                        .then(function (response_asset2) {

                                            var receive_asset_name = response_asset2.data.symbol;
                                            var receive_asset_precision = response_asset2.data.precision;

                                            var divideby = Math.pow(10, receive_asset_precision);
                                            var receive_amount = Number(min_to_receive_amount / divideby);

                                            operation_text = $filter('translateWithLinks')('Operation Limit Order Create Description', {
                                                receiveAmount: formatNumber(receive_amount),
                                                sellAmount: formatNumber(sell_amount),
                                                accountLink: {
                                                    text: response_name.data,
                                                    href: `/#/accounts/${response_name.data}`
                                                },
                                                buyAssetLink: {
                                                    text: receive_asset_name,
                                                    href: `/#/assets/${receive_asset_name}`
                                                },
                                                sellAssetLink: {
                                                    text: sell_asset_name,
                                                    href: `/#/assets/${sell_asset_name}`
                                                },

                                            });

                                            callback(operation_text);
                                    });
                            });
                    });
                }
                else if (operation_type === 2) {
                    fee_paying_account = operation.fee_paying_account;
                    operation_account = fee_paying_account;

                    $http.get(appConfig.urls.python_backend() + "/account_name?account_id=" + operation_account)
                        .then(function (response_name) {

                            operation_text = $filter('translateWithLinks')('Operation Limit Order Cancel Description', {
                                accountLink: {
                                    text: response_name.data,
                                    href: `/#/accounts/${response_name.data}`
                                }
                            });

                            callback(operation_text);
                    });
                }
                else if (operation_type === 3) {
                    var funding_account = operation.funding_account;
                    var delta_collateral_asset_id = operation.delta_collateral.asset_id;
                    var delta_debt_asset_id = operation.delta_debt.asset_id;

                    $http.get(appConfig.urls.python_backend() + "/account_name?account_id=" + funding_account)
                        .then(function (response_name) {

                            $http.get(appConfig.urls.python_backend() + "/asset?asset_id=" + delta_collateral_asset_id)
                                .then(function (response_asset1) {

                                    var asset1 = response_asset1.data.symbol;

                                    $http.get(appConfig.urls.python_backend() + "/asset?asset_id=" + delta_debt_asset_id)
                                        .then(function (response_asset2) {

                                            var asset2 = response_asset2.data.symbol;

                                            operation_text = $filter('translateWithLinks')('Operation Call Order Update Description', {
                                                accountLink: {
                                                    text: response_name.data,
                                                    href: `/#/accounts/${response_name.data}`,
                                                },
                                                marketLink: {
                                                    text: `${asset1}/${asset2}`,
                                                    href: `#/markets/${asset1}/${asset2}`
                                                }
                                            });

                                            callback(operation_text);
                                    });
                            });
                    });
                }
                else if (operation_type === 4) {
                    var account_id = operation.account_id;
                    operation_account = account_id;

                    var pays_asset_id = operation.pays.asset_id;
                    var pays_amount = operation.pays.amount;

                    var receives_asset_id = operation.receives.asset_id;
                    var receives_amount = operation.receives.amount;

                    $http.get(appConfig.urls.python_backend() + "/account_name?account_id=" + operation_account)
                        .then(function (response_name) {


                            $http.get(appConfig.urls.python_backend() + "/asset?asset_id=" + pays_asset_id)
                                .then(function (response_asset1) {

                                    var pays_asset_name = response_asset1.data.symbol;
                                    var pays_asset_precision = response_asset1.data.precision;

                                    var divideby = Math.pow(10, pays_asset_precision);

                                    var p_amount = parseFloat(pays_amount / divideby);

                                    $http.get(appConfig.urls.python_backend() + "/asset?asset_id=" + receives_asset_id)
                                        .then(function (response_asset2) {

                                            var receive_asset_name = response_asset2.data.symbol;
                                            var receive_asset_precision = response_asset2.data.precision;

                                            var divideby = Math.pow(10, receive_asset_precision);
                                            var receive_amount = Number(receives_amount / divideby);

                                            operation_text = $filter('translateWithLinks')('Operation Fill Order Description', {
                                                amount: formatNumber(p_amount),
                                                receiveAmount: formatNumber(receive_amount),
                                                accountLink: {
                                                    text: response_name.data,
                                                    href: `/#/accounts/${response_name.data}`
                                                },
                                                payAssetLink: {
                                                    text: pays_asset_name,
                                                    href: `/#/assets/${pays_asset_name}`
                                                },
                                                receiveAssetLink: {
                                                    text: receive_asset_name,
                                                    href: `/#/assets/${receive_asset_name}`
                                                }
                                            });

                                            callback(operation_text);
                                    });
                            });
                    });
                }
                else if (operation_type === 5) {
                    var registrar = operation.registrar;
                    var referrer =  operation.referrer;
                    var name =  operation.name;
                    operation_account = registrar;

                    $http.get(appConfig.urls.python_backend() + "/account_name?account_id=" + operation_account)
                        .then(function (response_name) {

                            operation_text = $filter('translateWithLinks')('Operation Account Create without ref Description', {
                                accountLink: {
                                    text: response_name.data,
                                    href: `/#/accounts/${operation_account}`
                                },
                                registerLink: {
                                    text: name,
                                    href: `/#/accounts/${name}`
                                },
                            });

                            if(registrar !== referrer) {

                                $http.get(appConfig.urls.python_backend() + "/account_name?account_id=" + referrer)
                                    .then(function (response_name2) {

                                        operation_text = $filter('translateWithLinks')('Operation Account Create with ref Description', {
                                            accountLink: {
                                                text: response_name.data,
                                                href: `/#/accounts/${response_name.data}`
                                            },
                                            registerLink: {
                                                text: name,
                                                href: `/#/accounts/${name}`
                                            },
                                            referralLink: {
                                                text: response_name2.data,
                                                href: `/#/accounts/${response_name2.data}`
                                            },
                                        });

                                        callback(operation_text);

                                    });
                            }
                            else {
                                callback(operation_text);
                            }
                    });
                }
                else if (operation_type === 6) {
                    operation_account = operation.account;

                    $http.get(appConfig.urls.python_backend() + "/account_name?account_id=" + operation_account)
                        .then(function (response_name) {

                            operation_text = $filter('translateWithLinks')('Operation Account Update Description', {
                                accountLink: {
                                    text: response_name.data,
                                    href: `/#/accounts/${response_name.data}`,
                                }
                            });

                            callback(operation_text);
                    });
                }
                else if (operation_type === 7) { // ACCOUNT WHITELIST
                    operation_account = operation.authorizing_account;
                    var account_to_list = operation.account_to_list;
                    var new_listing = operation.new_listing;
                    var type = "whitelisted";
                    if(new_listing == 2) type = "blacklisted";

                    $http.get(appConfig.urls.python_backend() + "/account_name?account_id=" + operation_account)
                        .then(function (response_name) {

                        $http.get(appConfig.urls.python_backend() + "/account_name?account_id=" + account_to_list)
                            .then(function (response_name2) {

                                operation_text = $filter('translateWithLinks')('Operation Account Whitelist Description', {
                                    accountLink: {
                                        text: response_name.data,
                                        href: `/#/accounts/${response_name.data}`
                                    },

                                    whitelistAccountLink: {
                                        text: response_name2.data,
                                        href: `/#/accounts/${response_name2.data}`
                                    },

                                    actionType: type,
                                });

                                callback(operation_text);
                        });
                    });
                }
                else if (operation_type === 8) {
                    operation_account = operation.account_to_upgrade;

                    $http.get(appConfig.urls.python_backend() + "/account_name?account_id=" + operation_account)
                        .then(function (response_name) {

                            operation_text = $filter('translateWithLinks')('Operation Account Upgrade Description', {
                                accountLink: {
                                    text: response_name.data,
                                    href: `/#/accounts/${response_name.data}`
                                }
                            });

                            callback(operation_text);
                        });
                }
                else if (operation_type === 9) { // account transfer
                    operation_account = operation.account_to_upgrade;
                    
                    getAccount(operation.account_id).then((account_name) => {
                        getAccount(operation.new_owner).then((owner_account_name) => {
                            translateCallback('Operation Account Transfer', {
                                account: getLink().account(account_name),
                                newAccount: getLink().account(owner_account_name),
                            })
                        });
                        
                    })
                }
                else if (operation_type === 10) {
                    operation_account = operation.issuer;

                    $http.get(appConfig.urls.python_backend() + "/account_name?account_id=" + operation_account)
                        .then(function (response_name) {

                            operation_text = $filter('translateWithLinks')('Operation Asset Create Description', {
                                accountLink: {
                                    text: response_name.data,
                                    href: `/#/accounts/${response_name.data}`
                                },
                                assetLink: {
                                    text: operation.symbol,
                                    href: `/#/assets/${operation.symbol}`
                                }
                            });

                            callback(operation_text);
                        });
                }
                else if (operation_type === 11 || operation_type === 12) { // asset/bitasset update
                    getAccount(operation.issuer).then((account_name) => {
                        getAsset(operation.asset_to_update).then((asset) => {
                            translateCallback('Operation Asset Update', {
                                account: getLink().account(account_name),
                                asset: getLink().asset(asset.symbol),
                            })
                        });
                        
                    })
                }
                else if (operation_type === 13) { // asset update feed producers
                    getAccount(operation.issuer).then((account_name) => {
                        getAsset(operation.asset_to_update).then((asset) => {
                            translateCallback('Operation Asset Update Feed Producers', {
                                account: getLink().account(account_name),
                                asset: getLink().asset(asset.symbol),
                            })
                        });
                        
                    })
                }
                else if (operation_type === 14) {
                    var issuer = operation.issuer;
                    var issue_to_account =  operation.issue_to_account;
                    var asset_to_issue_amount = operation.asset_to_issue.amount;
                    var asset_to_issue_asset_id = operation.asset_to_issue.asset_id;

                    $http.get(appConfig.urls.python_backend() + "/account_name?account_id=" + issuer)
                        .then(function (response_name) {

                            $http.get(appConfig.urls.python_backend() + "/asset?asset_id=" + asset_to_issue_asset_id)
                                .then(function (response_asset) {

                                    var asset_name = response_asset.data.symbol;
                                    var asset_precision = response_asset.data.precision;

                                    var divideby = Math.pow(10, asset_precision);
                                    var amount = Number(asset_to_issue_amount / divideby);

                                    $http.get(appConfig.urls.python_backend() + "/account_name?account_id=" + issue_to_account)
                                        .then(function (response_name2) {

                                            operation_text = $filter('translateWithLinks')('Operation Asset Issue Description', {
                                                amount: amount,

                                                receiverAccountLink: {
                                                    text: response_name2.data,
                                                    href: `/#/accounts/${response_name2.data}`
                                                },
                                                assetLink: {
                                                    text: response_asset.data.symbol,
                                                    href: `/#/assets/${response_asset.data.symbol}`
                                                },
                                                accountLink: {
                                                    text: response_name.data,
                                                    href: `/#/accounts/${response_name.data}`
                                                },
                                            });

                                            callback(operation_text);
                                    });
                            });
                    });
                }
                else if (operation_type === 15) {
                    operation_account = operation.payer;

                    var amount_to_reserve_amount = operation.amount_to_reserve.amount;
                    var amount_to_reserve_asset_id = operation.amount_to_reserve.asset_id;

                    $http.get(appConfig.urls.python_backend() + "/account_name?account_id=" + operation_account)
                        .then(function (response_name) {

                            $http.get(appConfig.urls.python_backend() + "/asset?asset_id=" + amount_to_reserve_asset_id)
                                .then(function (response_asset) {

                                    var asset_name = response_asset.data.symbol;
                                    var asset_precision = response_asset.data.precision;
                                    var divideby = Math.pow(10, asset_precision);
                                    var amount = Number(amount_to_reserve_amount / divideby);

                                    operation_text = $filter('translateWithLinks')('Operation Asset Reserve Description', {
                                        accountLink: {
                                            text: response_name.data,
                                            href: `/#/accounts/${response_name.data}`
                                        },
                                        assetLink: {
                                            text: asset_name,
                                            href: `/#/assets/${asset_name}`
                                        },
                                        amount: formatNumber(amount),
                                    });

                                    callback(operation_text);
                            });
                    });
                }

                else if (operation_type === 19) {
                    var publisher = operation.publisher;
                    var asset_id =  operation.asset_id;
                    operation_account = publisher;

                    $http.get(appConfig.urls.python_backend() + "/account_name?account_id=" + operation_account)
                        .then(function (response_name) {

                            $http.get(appConfig.urls.python_backend() + "/asset?asset_id=" + asset_id)
                                .then(function (response_asset) {

                                    operation_text = $filter('translateWithLinks')('Operation Asset Publish Feed Description', {
                                        accountLink: {
                                            text: response_name.data,
                                            href: `/#/accounts/${response_name.data}`
                                        },
                                        assetLink: {
                                            text: response_asset.data.symbol,
                                            href: `/#/assets/${response_asset.data.symbol}`
                                        },
                                    });

                                    callback(operation_text);
                            });
                    });
                }
                else if (operation_type === 22) {
                    fee_paying_account = operation.fee_paying_account;
                    operation_account = fee_paying_account;

                    $http.get(appConfig.urls.python_backend() + "/account_name?account_id=" + operation_account)
                        .then(function (response_name) {

                            operation_text = $filter('translateWithLinks')('Operation Proposal Create Description', {
                                accountLink: {
                                    text: response_name.data,
                                    href: `/#/accounts/${response_name.data}`
                                },
                            });

                            callback(operation_text);
                    });
                }
                else if (operation_type === 23) {
                    fee_paying_account = operation.fee_paying_account;
                    var proposal = operation.proposal;
                    operation_account = fee_paying_account;

                    $http.get(appConfig.urls.python_backend() + "/account_name?account_id=" + operation_account)
                        .then(function (response_name) {

                            operation_text = $filter('translateWithLinks')('Operation Proposal Update Description', {
                                accountLink: {
                                    text: response_name.data,
                                    href: `/#/accounts/${response_name.data}`
                                },
                                proposalLink: {
                                    text: proposal,
                                    href: `/#/objects/${proposal}`
                                },
                            });

                            callback(operation_text);
                    });
                }
                else if (operation_type === 33) {
                    operation_account = operation.owner_;

                    var amount_amount = operation.amount_.amount;
                    var amount_asset_id = operation.amount_.asset_id;

                    $http.get(appConfig.urls.python_backend() + "/account_name?account_id=" + operation_account)
                        .then(function (response_name) {

                            $http.get(appConfig.urls.python_backend() + "/asset?asset_id=" + amount_asset_id)
                                .then(function (response_asset) {

                                    var asset_name = response_asset.data.symbol;
                                    var asset_precision = response_asset.data.precision;
                                    var divideby = Math.pow(10, asset_precision);
                                    var amount = Number(amount_amount / divideby);

                                    operation_text = $filter('translateWithLinks')('Operation Vesting Balance Withdraw Description', {
                                        amount: formatNumber(amount),
                                        accountLink: {
                                            text: response_name.data,
                                            href: `/#/accounts/${response_name.data}`
                                        },
                                        assetLink: {
                                            text: asset_name,
                                            href: `/#/assets/${asset_name}`
                                        },
                                    });

                                    callback(operation_text);
                                });
                        });
                }
                else if (operation_type === 37) { // BALANCE_CLAIM
                    operation_account = operation.deposit_to_account;

                    var total_claimed_amount = operation.total_claimed.amount;
                    var total_claimed_asset_id = operation.total_claimed.asset_id;

                    $http.get(appConfig.urls.python_backend() + "/account_name?account_id=" + operation_account)
                        .then(function (response_name) {

                            $http.get(appConfig.urls.python_backend() + "/asset?asset_id=" + total_claimed_asset_id)
                                .then(function (response_asset) {

                                    var asset_name = response_asset.data.symbol;
                                    var asset_precision = response_asset.data.precision;
                                    var divideby = Math.pow(10, asset_precision);
                                    var amount = Number(total_claimed_amount / divideby);

                                    operation_text = $filter('translateWithLinks')('Operation Balance Claim Description', {
                                        accountLink: {
                                            text: response_name.data,
                                            href: `/#/accounts/${response_name.data}`
                                        },
                                        assetLink: {
                                            text: asset_name,
                                            href: `/#/assets/${asset_name}`
                                        },
                                        amount: formatNumber(amount),
                                    });

                                    callback(operation_text);
                                });
                        });
                }
                else if (operation_type === 45) { // BID COLLATERAL
                    operation_account = operation.bidder;

                    var additional_collateral_amount = operation.additional_collateral.amount;
                    var additional_collateral_asset_id = operation.additional_collateral.asset_id;

                    var debt_covered_amount = operation.debt_covered.amount;
                    var debt_covered_asset_id = operation.debt_covered.asset_id;

                    $http.get(appConfig.urls.python_backend() + "/account_name?account_id=" + operation_account)
                        .then(function (response_name) {

                            $http.get(appConfig.urls.python_backend() + "/asset?asset_id=" +
                                additional_collateral_asset_id)
                                .then(function (additional_collateral_asset) {

                                    var asset_name1 = additional_collateral_asset.data.symbol;
                                    var asset_precision1 = additional_collateral_asset.data.precision;
                                    var divideby1 = Math.pow(10, asset_precision1);
                                    var amount1 = Number(additional_collateral_amount / divideby1);

                                    $http.get(appConfig.urls.python_backend() + "/asset?asset_id=" +
                                        debt_covered_asset_id)
                                        .then(function (debt_covered_asset) {


                                            var asset_name2 = debt_covered_asset.data.symbol;
                                            var asset_precision2 = debt_covered_asset.data.precision;
                                            var divideby2 = Math.pow(10, asset_precision2);
                                            var amount2 = Number(debt_covered_amount / divideby2);

                                            operation_text = $filter('translateWithLinks')('Operation Bid Collateral Description', {
                                                amount1: formatNumber(amount1),
                                                amount2: formatNumber(amount2),
                                                accountLink: {
                                                    text: response_name.data,
                                                    href: `/#/accounts/${response_name.data}`
                                                },
                                                collateralAssetLink: {
                                                    text: asset_name1,
                                                    href: `/#/assets/${asset_name1}`
                                                },
                                                debtAssetLink: {
                                                    text: asset_name2,
                                                    href: `/#/assets/${asset_name2}`
                                                },
                                            });

                                            callback(operation_text);
                                        });
                                });
                        });
                }
                else if (operation_type === 46) { // EXECUTE BID
                    operation_account = operation.bidder;

                    var additional_collateral_amount = operation.collateral.amount;
                    var additional_collateral_asset_id = operation.collateral.asset_id;

                    var debt_covered_amount = operation.debt.amount;
                    var debt_covered_asset_id = operation.debt.asset_id;

                    $http.get(appConfig.urls.python_backend() + "/account_name?account_id=" + operation_account)
                        .then(function (response_name) {

                            $http.get(appConfig.urls.python_backend() + "/asset?asset_id=" +
                                additional_collateral_asset_id)
                                .then(function (additional_collateral_asset) {

                                    var asset_name1 = additional_collateral_asset.data.symbol;
                                    var asset_precision1 = additional_collateral_asset.data.precision;
                                    var divideby1 = Math.pow(10, asset_precision1);
                                    var amount1 = Number(additional_collateral_amount / divideby1);

                                    $http.get(appConfig.urls.python_backend() + "/asset?asset_id=" +
                                        debt_covered_asset_id)
                                        .then(function (debt_covered_asset) {


                                            var asset_name2 = debt_covered_asset.data.symbol;
                                            var asset_precision2 = debt_covered_asset.data.precision;
                                            var divideby2 = Math.pow(10, asset_precision2);
                                            var amount2 = Number(debt_covered_amount / divideby2);

                                            operation_text = $filter('translateWithLinks')('Operation Execute Bid Description', {
                                                amount1: formatNumber(amount1),
                                                amount2: formatNumber(amount2),
                                                accountLink: {
                                                    text: response_name.data,
                                                    href: `/#/accounts/${response_name.data}`
                                                },
                                                collateralAssetLink: {
                                                    text: asset_name1,
                                                    href: `/#/assets/${asset_name1}`
                                                },
                                                debtAssetLink: {
                                                    text: asset_name2,
                                                    href: `/#/assets/${asset_name2}`
                                                },
                                            });

                                            callback(operation_text);
                                        });
                                });
                        });
                }
                else if (operation_type === 49) { // HTLC CREATE
                    operation_account = operation.from;

                    var amount_ = operation.amount_.amount;
                    var asset_id = operation.amount_.asset_id;

                    var to = operation.to;

                    $http.get(appConfig.urls.python_backend() + "/account_name?account_id=" + operation_account)
                        .then(function (response_name) {

                            $http.get(appConfig.urls.python_backend() + "/asset?asset_id=" + asset_id)
                                .then(function (asset) {

                                    var asset_name = asset.data.symbol;
                                    var asset_precision = asset.data.precision;
                                    var divideby = Math.pow(10, asset_precision);
                                    var amount = Number(amount_ / divideby);

                                    $http.get(appConfig.urls.python_backend() + "/account_name?account_id=" + to)
                                        .then(function (response_name2) {

                                            operation_text = $filter('translateWithLinks')('Operation HTLC Create Description', {
                                                accountLink: {
                                                    text: response_name.data,
                                                    href: `/#/accounts/${response_name.data}`
                                                },
                                                receiverAccountLink: {
                                                    text: response_name2.data,
                                                    href: `/#/accounts/${response_name2.data}`
                                                },
                                                assetLink: {
                                                    text: asset_name,
                                                    href: `/#/assets/${asset_name}`
                                                },

                                                amount: formatNumber(amount),
                                            });

                                            callback(operation_text);
                                        });
                                });
                        });
                }
                else if (operation_type === 50) { // HTLC REDEEM
                    operation_account = operation.redeemer;
                    var htlc_id = operation.htlc_id;

                    $http.get(appConfig.urls.python_backend() + "/account_name?account_id=" + operation_account)
                        .then(function (response_name) {

                            operation_text = $filter('translateWithLinks')('Operation HTLC Redeem Description', {
                                accountLink: {
                                    text: response_name.data,
                                    href: `/#/accounts/${response_name.data}`
                                },
                            });

                            callback(operation_text);
                        });
                }
                else if (operation_type === 51) { // HTLC REDEEMED
                    operation_account = operation.from;
                    var htlc_id = operation.htlc_id;

                    $http.get(appConfig.urls.python_backend() + "/account_name?account_id=" + operation_account)
                        .then(function (response_name) {

                            operation_text = $filter('translateWithLinks')('Operation HTLC Redeemed Description', {
                                accountLink: {
                                    text: response_name.data,
                                    href: `/#/accounts/${response_name.data}`
                                },
                            });

                            callback(operation_text);
                        });
                }
                else if (operation_type === 52) { // HTLC EXTEND
                    operation_account = operation.update_issuer;
                    var htlc_id = operation.htlc_id;

                    $http.get(appConfig.urls.python_backend() + "/account_name?account_id=" + operation_account)
                        .then(function (response_name) {

                            operation_text = $filter('translateWithLinks')('Operation HTLC Extend Description', {
                                accountLink: {
                                    text: response_name.data,
                                    href: `/#/accounts/${response_name.data}`
                                },
                            });

                            callback(operation_text);
                        });
                }
                else if (operation_type === 53) { // HTLC REFUND
                    operation_account = operation.to;
                    var htlc_id = operation.htlc_id;

                    $http.get(appConfig.urls.python_backend() + "/account_name?account_id=" + operation_account)
                        .then(function (response_name) {

                            operation_text = $filter('translateWithLinks')('Operation HTLC Refund Description', {
                                accountLink: {
                                    text: response_name.data,
                                    href: `/#/accounts/${response_name.data}`
                                },
                            });

                            callback(operation_text);
                        });
                }
                else if (operation_type === 32) { // Vesting Balance create
                    $http.get(appConfig.urls.python_backend() + "/account_name?account_id=" + operation.creator)
                        .then(function (creator_name) {
                            creator_name = creator_name.data;
                            $http.get(appConfig.urls.python_backend() + "/account_name?account_id=" + operation.owner_)
                                .then(function (owner_name) {
                                    owner_name = owner_name.data;
                                    $http.get(appConfig.urls.python_backend() + "/asset?asset_id=" + operation.amount_.asset_id)
                                        .then(function (asset) {
                                            let asset_name = asset.data.symbol;
                                            let asset_precision = asset.data.precision;
                                            let divideby = Math.pow(10, asset_precision);
                                            let amount = Number(operation.amount_.amount / divideby);

                                            operation_text = $filter('translateWithLinks')('Operation Vesting Balance Create For Personal Description', {
                                                accountLink: {
                                                    text: creator_name,
                                                    href: `/#/accounts/${creator_name}`
                                                },
                                                assetLink: {
                                                    text: asset_name,
                                                    href: `/#/assets/${asset_name}`
                                                },

                                                amount: formatNumber(amount),
                                            });

                                            if (creator_name != owner_name) {

                                                operation_text = $filter('translateWithLinks')('Operation Vesting Balance Create For Somebody Description', {
                                                    accountLink: {
                                                        text: creator_name,
                                                        href: `/#/accounts/${creator_name}`
                                                    },
                                                    ownerLink: {
                                                        text: owner_name,
                                                        href: `/#/accounts/${owner_name}`
                                                    },
                                                    assetLink: {
                                                        text: asset_name,
                                                        href: `/#/assets/${asset_name}`
                                                    },
                                                    amount: formatNumber(amount),
                                                    assetId: operation.amount_.asset_id,
                                                    assetSymbol: asset_name,
                                                    ownerAccountId: operation.owner_,
                                                    ownerAccountName: owner_name,
                                                });

                                            }
                                            callback(operation_text);
                                        });
                                });
                        });
                }
                else if (operation_type === 20) { // Witness create
                    $http.get(appConfig.urls.python_backend() + "/account_name?account_id=" + operation.witness_account)
                        .then(function (witness_account_name) {
                            witness_account_name = witness_account_name.data;

                            function validURL(str) {
                                const pattern = new RegExp('^(https?:\\/\\/)?' + // protocol
                                    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
                                    '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
                                    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
                                    '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
                                    '(\\#[-a-z\\d_]*)?$', 'i'); // fragment locator
                                return !!pattern.test(str);
                            }

                            let translation_id = '';

                            if(operation.url && validURL(operation.url)) {
                                translation_id = 'Operation Witness Create Description with link';
                            } else {
                                translation_id = 'Operation Witness Create Description without link';
                            }

                            operation_text = $filter('translateWithLinks')(translation_id, {
                                accountLink: {
                                    text: witness_account_name,
                                    href: `/#/accounts/${witness_account_name}`
                                },
                                ...operation.url && validURL(operation.url) ? {
                                    link: {
                                        target: '_blank',
                                        href  : operation.url,
                                        rel   : 'noopener noreferrer',
                                        text  : 'link'
                                    }
                                } : {}
                            });

                            callback(operation_text);
                        });
                }
                else if (operation_type === 57) { // Ticket create
                    $http.get(appConfig.urls.python_backend() + "/account_name?account_id=" + operation.account)
                        .then(function (creator_name) {
                            creator_name = creator_name.data;
                                $http.get(appConfig.urls.python_backend() + "/asset?asset_id=" + operation.amount_.asset_id)
                                    .then(function (asset) {
                                        let asset_name = asset.data.symbol;
                                        let asset_precision = asset.data.precision;
                                        let divideby = Math.pow(10, asset_precision);
                                        let amount = Number(operation.amount_.amount / divideby);

                                        operation_text = $filter('translateWithLinks')('Operation Ticket Create Description', {
                                            accountLink: {
                                                text: creator_name,
                                                href: `/#/accounts/${creator_name}`
                                            },
                                            assetLink: {
                                                text: asset_name,
                                                href: `/#/assets/${asset_name}`
                                            },

                                            amount: formatNumber(amount),
                                        });
                                        callback(operation_text);
                                    });
                        });
                }
                else if (operation_type === 58) { // Ticket update
                    $http.get(appConfig.urls.python_backend() + "/account_name?account_id=" + operation.account)
                        .then(function (creator_name) {
                            creator_name = creator_name.data;
                            $http.get(appConfig.urls.python_backend() + "/asset?asset_id=" + operation.amount_for_new_target.asset_id)
                                .then(function (asset) {
                                    let asset_name = asset.data.symbol;
                                    let asset_precision = asset.data.precision;
                                    let divideby = Math.pow(10, asset_precision);
                                    let amount = Number(operation.amount_for_new_target.amount / divideby);

                                    operation_text = $filter('translateWithLinks')('Operation Ticket Update Description', {
                                        accountLink: {
                                            text: creator_name,
                                            href: `/#/accounts/${creator_name}`
                                        },
                                        assetLink: {
                                            text: asset_name,
                                            href: `/#/assets/${asset_name}`
                                        },

                                        amount: formatNumber(amount),
                                    });
                                    callback(operation_text);
                                });
                        });
                }
                else if (operation_type === 59) { // LP create
                    operation_account = operation.account;

                    $http.get(appConfig.urls.python_backend() + "/account_name?account_id=" + operation_account)
                        .then(function (response_name) {

                            $http.get(appConfig.urls.python_backend() + "/asset?asset_id=" + operation.asset_a)
                                .then(function (response_asset1) {

                                    var asset_a_name = response_asset1.data.symbol;

                                    $http.get(appConfig.urls.python_backend() + "/asset?asset_id=" + operation.asset_b)
                                        .then(function (response_asset2) {

                                            var asset_b_name = response_asset2.data.symbol;

                                            $http.get(appConfig.urls.python_backend() + "/asset?asset_id=" + operation.share_asset)
                                                .then(function (response_asset3) {

                                                    var share_name = response_asset3.data.symbol;

                                                    operation_text = $filter('translateWithLinks')('Operation Liquidity Pool Create Description', {
                                                        accountLink: {
                                                            text: response_name.data,
                                                            href: `/#/accounts/${response_name.data}`
                                                        },
                                                        assetALink: {
                                                            text: asset_a_name,
                                                            href: `/#/assets/${asset_a_name}`
                                                        },
                                                        assetBLink: {
                                                            text: asset_b_name,
                                                            href: `/#/assets/${asset_b_name}`
                                                        },
                                                        shareLink: {
                                                            text: share_name,
                                                            href: `/#/assets/${share_name}`
                                                        },
                                                    });

                                                    callback(operation_text);
                                                });


                                        });
                                });
                        });
                }
                else if (operation_type === 60) { // LP delete
                    operation_account = operation.account;

                    $http.get(appConfig.urls.python_backend() + "/account_name?account_id=" + operation_account)
                        .then(function (response_name) {

                            operation_text = $filter('translateWithLinks')('Operation Liquidity Pool Delete Description', {
                                accountLink: {
                                    text: response_name.data,
                                    href: `/#/accounts/${operation_account}`
                                },
                                pool: operation.pool,
                            });

                            callback(operation_text);
                        });
                }
                else if (operation_type === 61) { // LP deposit
                    operation_account = operation.account;

                    const result = operation.result[1];

                    const asset_a_id = operation.amount_a.asset_id;
                    const asset_b_id = operation.amount_b.asset_id;

                    const asset_a_amount = result.paid[0].asset_id == asset_a_id ? result.paid[0].amount : result.paid[1].amount;
                    const asset_b_amount = result.paid[0].asset_id == asset_a_id ? result.paid[1].amount : result.paid[0].amount;

                    const pool_asset_id = result.received[0].asset_id;
                    const pool_asset_amount = result.received[0].amount;

                    $http.get(appConfig.urls.python_backend() + "/account_name?account_id=" + operation_account)
                        .then(function (response_name) {

                            Promise.all([
                                $http.get(appConfig.urls.python_backend() + "/asset?asset_id=" + asset_a_id),
                                $http.get(appConfig.urls.python_backend() + "/asset?asset_id=" + asset_b_id),
                                $http.get(appConfig.urls.python_backend() + "/asset?asset_id=" + pool_asset_id)
                            ]).then(assets => {
                                const asset_a = assets[0].data;
                                const asset_a_float = Number(asset_a_amount / Math.pow(10, asset_a.precision));
                                const asset_b = assets[1].data;
                                const asset_b_float = Number(asset_b_amount / Math.pow(10, asset_b.precision));
                                const pool_asset = assets[2].data;
                                const pool_asset_float = Number(pool_asset_amount / Math.pow(10, pool_asset.precision));

                                operation_text = $filter('translateWithLinks')('Operation Liquidity Pool Deposit Description', {
                                    accountLink: {
                                        text: response_name.data,
                                        href: `/#/accounts/${response_name.data}`
                                    },
                                    asset_a_amount: formatNumber(asset_a_float),
                                    asset_b_amount: formatNumber(asset_b_float),
                                    pool_asset_amount: formatNumber(pool_asset_float),
                                    asset_a_link: {
                                        text: asset_a.symbol,
                                        href: `/#/assets/${asset_a.symbol}`
                                    },
                                    asset_b_link: {
                                        text: asset_b.symbol,
                                        href: `/#/assets/${asset_b.symbol}`
                                    },
                                    pool_asset_link: {
                                        text: pool_asset.symbol,
                                        href: `/#/assets/${pool_asset.symbol}`
                                    },
                                    pool: operation.pool
                                });

                                callback(operation_text);
                            });
                        });
                }
                else if (operation_type === 62) { // LP withdraw
                    operation_account = operation.account;

                    var amount_amount = operation.share_amount.amount;
                    var amount_asset_id = operation.share_amount.asset_id;

                    $http.get(appConfig.urls.python_backend() + "/account_name?account_id=" + operation_account)
                        .then(function (response_name) {

                            $http.get(appConfig.urls.python_backend() + "/asset?asset_id=" + amount_asset_id)
                                .then(function (response_asset) {

                                    var asset_name = response_asset.data.symbol;
                                    var asset_precision = response_asset.data.precision;
                                    var divideby = Math.pow(10, asset_precision);
                                    var amount = Number(amount_amount / divideby);

                                    operation_text = $filter('translateWithLinks')('Operation Liquidity Pool Withdraw Description', {
                                        amount: formatNumber(amount),
                                        accountLink: {
                                            text: response_name.data,
                                            href: `/#/accounts/${response_name.data}`
                                        },
                                        assetLink: {
                                            text: asset_name,
                                            href: `/#/assets/${asset_name}`
                                        },
                                        pool: operation.pool
                                    });

                                    callback(operation_text);
                                });
                        });
                }
                else if (operation_type === 63) { // LP exchange
                    var seller = operation.account;
                    operation_account = seller;

                    var amount_to_sell_asset_id = operation.result[1].paid[0].asset_id;
                    var amount_to_sell_amount = operation.result[1].paid[0].amount;

                    var min_to_receive_asset_id = operation.result[1].received[0].asset_id;
                    var min_to_receive_amount = operation.result[1].received[0].amount;

                    $http.get(appConfig.urls.python_backend() + "/account_name?account_id=" + operation_account)
                        .then(function (response_name) {

                            $http.get(appConfig.urls.python_backend() + "/asset?asset_id=" + amount_to_sell_asset_id)
                                .then(function (response_asset1) {

                                    var sell_asset_name = response_asset1.data.symbol;
                                    var sell_asset_precision = response_asset1.data.precision;

                                    var divideby = Math.pow(10, sell_asset_precision);
                                    var sell_amount = Number(amount_to_sell_amount / divideby);

                                    $http.get(appConfig.urls.python_backend() + "/asset?asset_id=" +
                                        min_to_receive_asset_id)
                                        .then(function (response_asset2) {

                                            var receive_asset_name = response_asset2.data.symbol;
                                            var receive_asset_precision = response_asset2.data.precision;

                                            var divideby = Math.pow(10, receive_asset_precision);
                                            var receive_amount = Number(min_to_receive_amount / divideby);

                                            operation_text = $filter('translateWithLinks')('Operation Liquidity Pool Exchange Description', {
                                                receiveAmount: formatNumber(receive_amount),
                                                sellAmount: formatNumber(sell_amount),
                                                accountLink: {
                                                    text: response_name.data,
                                                    href: `/#/accounts/${response_name.data}`
                                                },
                                                buyAssetLink: {
                                                    text: receive_asset_name,
                                                    href: `/#/assets/${receive_asset_name}`
                                                },
                                                sellAssetLink: {
                                                    text: sell_asset_name,
                                                    href: `/#/assets/${sell_asset_name}`
                                                },
                                                pool: operation.pool
                                            });

                                            callback(operation_text);
                                        });
                                });
                        });
                }
                else if (operation_type === 69) { // Credit Offer Create
                    const operation_account = operation.owner_account;
                    
                    getAccount(operation_account).then((account_name) => {
                        getAsset(operation.asset_type, operation.balance).then((asset) => {
                           
                            operation_text = $filter('translateWithLinks')('Operation Credit Offer Create', {
                                accountLink: getLink().account(account_name),
                                fee: String(operation.fee_rate),
                                amount: asset.amount,
                                assetLink: getLink().asset(asset.symbol),
                            });
                            callback(operation_text)
                        })
                    })
                }
                else if (operation_type === 70) { // Credit Offer Delete
                    const operation_account = operation.owner_account;
                    const asset = operation.result[1];
                    getAccount(operation_account).then((account_name) => {
                        getAsset(asset.asset_id, asset.amount).then((asset) => {
                            operation_text = $filter('translateWithLinks')('Operation Credit Offer Delete', {
                                accountLink: getLink().account(account_name),
                                offerId: operation.offer_id,
                                amount: asset.amount,
                                assetLink: getLink().asset(asset.symbol),
                            });
                            callback(operation_text)
                        })
                    })
                }
                else if (operation_type === 71) { // Credit Offer Update
                    const operation_account = operation.owner_account;
                    
                    getAccount(operation_account).then((account_name) => {
                        operation_text = $filter('translateWithLinks')('Operation Credit Offer Update', {
                            accountLink: getLink().account(account_name),
                            offerId: operation.offer_id,
                        });
                        callback(operation_text)
                    })
                }
                else if (operation_type === 72) { // Credit Offer Accept
                    const operation_account = operation.borrower;
                    const asset = operation.borrow_amount;
                    getAccount(operation_account).then((account_name) => {
                        getAsset(asset.asset_id, asset.amount).then((asset) => {
                            operation_text = $filter('translateWithLinks')('Operation Credit Offer Accept', {
                                accountLink: getLink().account(account_name),
                                amount: asset.amount,
                                assetLink: getLink().asset(asset.symbol),
                                offerId: operation.offer_id,
                            });
                            callback(operation_text)
                        })
                    })
                }
                else if (operation_type === 73) { // Credit Offer Accept
                    const operation_account = operation.account;
                    const repay = operation.repay_amount;
                    const fee = operation.credit_fee;
                    getAccount(operation_account).then((account_name) => {
                        getAsset(repay.asset_id, repay.amount).then((repayAsset) => {
                            getAsset(fee.asset_id, fee.amount).then((feeAsset) => {
                                operation_text = $filter('translateWithLinks')('Operation Credit Deal Repay', {
                                    accountLink : getLink().account(account_name),
                                    amount      : repayAsset.amount,
                                    feeAmount   : feeAsset.amount,
                                    assetLink   : getLink().asset(repayAsset.symbol),
                                    feeAssetLink: getLink().asset(feeAsset.symbol),
                                });
                                callback(operation_text)
                            });
                        })
                    })
                }
                
                else {

                    operation_text = $filter('translate')('Operation Beautifier Missing Description', {
                        operationType: operation_type,
                        operationShortDesc: JSON.stringify(operation).substr(0, 25),
                    });

                    callback(operation_text);
                }
            },
            operationType: function (opType) {
                // https://github.com/bitshares/bitshares-core/blob/bd40332a3b9c25ca0acbe55e212f6959e5734fec/libraries/protocol/include/graphene/protocol/operations.hpp#L53
                var name;
                var color;
                var results = [];
                if(opType === 0) {
                    name = "TRANSFER";
                    color = "81CA80";
                }
                else if(opType === 1) {
                    name = "LIMIT ORDER CREATE";
                    color = "6BBCD7";
                }
                else if(opType === 2) {
                    name = "LIMIT ORDER CANCEL";
                    color = "E9C842";
                }
                else if(opType === 3) {
                    name = "CALL ORDER UPDATE";
                    color = "E96562";
                }
                else if(opType === 4) {
                    name = "FILL ORDER";
                    color = "008000";
                }
                else if(opType === 5) {
                    name = "ACCOUNT CREATE";
                    color = "CCCCCC";
                }
                else if(opType === 6) {
                    name = "ACCOUNT UPDATE";
                    color = "FF007F";
                }
                else if(opType === 7) {
                    name = "ACCOUNT WHITELIST";
                    color = "FB8817";
                }
                else if(opType === 8) {
                    name = "ACCOUNT UPGRADE";
                    color = "552AFF";
                }
                else if(opType === 9) {
                    name = "ACCOUNT TRANSFER";
                    color = "AA2AFF";
                }
                else if(opType === 10) {
                    name = "ASSET CREATE";
                    color = "D400FF";
                }
                else if(opType === 11) {
                    name = "ASSET UPDATE";
                    color = "0000FF";
                }
                else if(opType === 12) {
                    name = "ASSET UPDATE BITASSET";
                    color = "AA7FFF";
                }
                else if(opType === 13) {
                    name = "ASSET UPDATE FEED PRODUCERS";
                    color = "2A7FFF";
                }
                else if(opType === 14) {
                    name = "ASSET ISSUE";
                    color = "7FAAFF";
                }
                else if(opType === 15) {
                    name = "ASSET RESERVE";
                    color = "55FF7F";
                }
                else if(opType === 16) {
                    name = "ASSET FUND FEE POOL";
                    color = "55FF7F";
                }
                else if(opType === 17) {
                    name = "ASSET SETTLE";
                    color = "F1CFBB";
                }
                else if(opType === 18) {
                    name = "ASSET GLOBAL SETTLE";
                    color = "F1DFCC";
                }
                else if(opType === 19) {
                    name = "ASSET PUBLISH FEED";
                    color = "FF2A55";
                }
                else if(opType === 20) {
                    name = "WITNESS CREATE";
                    color = "FFAA7F";
                }
                else if(opType === 21) {
                    name = "WITNESS UPDATE";
                    color = "F1AA2A";
                }
                else if(opType === 22) {
                    name = "PROPOSAL CREATE";
                    color = "FFAA55";
                }
                else if(opType === 23) {
                    name = "PROPOSAL UPDATE";
                    color = "FF7F55";
                }
                else if(opType === 24) {
                    name = "PROPOSAL DELETE";
                    color = "FF552A";
                }
                else if(opType === 25) {
                    name = "WITHDRAW PERMISSION CREATE";
                    color = "FF00AA";
                }
                else if(opType === 26) {
                    name = "WITHDRAW PERMISSION";
                    color = "FF00FF";
                }
                else if(opType === 27) {
                    name = "WITHDRAW PERMISSION CLAIM";
                    color = "FF0055";
                }
                else if(opType === 28) {
                    name = "WITHDRAW PERMISSION DELETE";
                    color = "37B68Cc";
                }
                else if(opType === 29) {
                    name = "COMMITTEE MEMBER CREATE";
                    color = "37B68C";
                }
                else if(opType === 30) {
                    name = "COMMITTEE MEMBER UPDATE";
                    color = "6712E7";
                }
                else if(opType === 31) {
                    name = "COMMITTEE MEMBER UPDATE GLOBAL PARAMETERS";
                    color = "B637B6";
                }
                else if(opType === 32) {
                    name = "VESTING BALANCE CREATE";
                    color = "A5A5A5";
                }
                else if(opType === 33) {
                    name = "VESTING BALANCE WITHDRAW";
                    color = "696969";
                }
                else if(opType === 34) {
                    name = "WORKER CREATE";
                    color = "0F0F0F";
                }
                else if(opType === 35) {
                    name = "CUSTOM";
                    color = "0DB762";
                }
                else if(opType === 36) {
                    name = "ASSERT";
                    color = "D1EEFF";
                }
                else if(opType === 37) {
                    name = "BALANCE CLAIM";
                    color = "939314";
                }
                else if(opType === 38) {
                    name = "OVERRIDE TRANSFER";
                    color = "8D0DB7";
                }
                else if(opType === 39) {
                    name = "TRANSFER TO BLIND";
                    color = "C4EFC4";
                }
                else if(opType === 40) {
                    name = "BLIND TRANSFER";
                    color = "F29DF2";
                }
                else if(opType === 41) {
                    name = "TRANSFER FROM BLIND";
                    color = "9D9DF2";
                }
                else if(opType === 42) {
                    name = "ASSET SETTLE CANCEL";
                    color = "4ECEF8";
                }
                else if(opType === 43) {
                    name = "ASSET CLAIM FEES";
                    color = "F8794E";
                }
                else if(opType === 44) {
                    name = "FBA DISTRIBUTE";
                    color = "8808B2";
                }
                else if(opType === 45) {
                    name = "BID COLLATERAL";
                    color = "6012B1";
                }
                else if(opType === 46) {
                    name = "EXECUTE BID";
                    color = "1D04BB";
                }
                else if(opType === 47) {
                    name = "ASSET CLAIM POOL";
                    color = "AAF654";
                }
                else if(opType === 48) {
                    name = "ASSET UPDATE ISSUER";
                    color = "AB7781";
                }
                else if(opType === 49) {
                    name = "HTLC CREATE";
                    color = "11e0dc";
                }
                else if(opType === 50) {
                    name = "HTLC REDEEM";
                    color = "085957";
                }
                else if(opType === 51) {
                    name = "HTLC REDEEMED";
                    color = "AB7781";
                }
                else if(opType === 52) {
                    name = "HTLC EXTEND";
                    color = "093f3e";
                }
                else if(opType === 53) {
                    name = "HTLC REFUND";
                    color = "369694";
                }
                else if(opType === 54) {
                    name = "CUSTOM AUTHORITY CREATE";
                    color = "11e0dc";
                }
                else if(opType === 55) {
                    name = "CUSTOM AUTHORITY UPDATE";
                    color = "AB7781";
                }
                else if(opType === 56) {
                    name = "CUSTOM AUTHORITY DELETE";
                    color = "369694";
                }
                else if(opType === 57) {
                    name = "TICKET CREATE";
                    color = "AB7781";
                }
                else if(opType === 58) {
                    name = "TICKET UPDATE";
                    color = "AB7781";
                }
                else if(opType === 59) {
                    name = "LIQUIDITY POOL CREATE";
                    color = "369694";
                }
                else if(opType === 60) {
                    name = "LIQUIDITY POOL DELETE";
                    color = "369694";
                }
                else if(opType === 61) {
                    name = "LIQUIDITY POOL DEPOSIT";
                    color = "369694";
                }
                else if(opType === 62) {
                    name = "LIQUIDITY POOL WITHDRAW";
                    color = "369694";
                }
                else if(opType === 63) {
                    name = "LIQUIDITY POOL EXCHANGE";
                    color = "369694";
                }
                else if(opType === 69) {
                    name = "CREATE CREDIT OFFER";
                    color = "f35b92";
                }
                else if(opType === 70) {
                    name = "DELETE CREDIT OFFER";
                    color = "f35b92";
                }
                else if(opType === 71) {
                    name = "UPDATE CREDIT OFFER";
                    color = "f35b92";
                }
                else if(opType === 72) {
                    name = "ACCEPT CREDIT OFFER";
                    color = "21d19f";
                }
                else if(opType === 73) {
                    name = "REPAY CREDIT DEAL";
                    color = "21d19f";
                }
                else if(opType === 74) {
                    name = "EXPIRED CREDIT DEAL";
                    color = "f35b92";
                } else {
                    name = "UNRECOGNIZED OP";
                    color = "111111";
                    console.log("Unknown operation type in chart", opType)
                }

                results[0] = name;
                results[1] = color;

                return results;
            },
            objectType: function (id) {
                var parts = id.split(".");
                var object_type = "";
                if (parts[0] == "1" && parts[1] == "1")
                    object_type = "BASE";
                else if (parts[0] == "1" && parts[1] == "2")
                    object_type = "ACCOUNT";
                else if (parts[0] == "1" && parts[1] == "3")
                    object_type = "ASSET";
                else if (parts[0] == "1" && parts[1] == "4")
                    object_type = "FORCE SETTLEMENT";
                else if (parts[0] == "1" && parts[1] == "5")
                    object_type = "COMMITTEE MEMBER";
                else if (parts[0] == "1" && parts[1] == "6")
                    object_type = "WITNESS";
                else if (parts[0] == "1" && parts[1] == "7")
                    object_type = "LIMIT ORDER";
                else if (parts[0] == "1" && parts[1] == "8")
                    object_type = "CALL ORDER";
                else if (parts[0] == "1" && parts[1] == "9")
                    object_type = "CUSTOM";
                else if (parts[0] == "1" && parts[1] == "10")
                    object_type = "PROPOSAL";
                else if (parts[0] == "1" && parts[1] == "11")
                    object_type = "OPERATION HISTORY";
                else if (parts[0] == "1" && parts[1] == "12")
                    object_type = "WITHDRAW PERMISSION";
                else if (parts[0] == "1" && parts[1] == "13")
                    object_type = "VESTING BALANCE";
                else if (parts[0] == "1" && parts[1] == "14")
                    object_type = "WORKER";
                else if (parts[0] == "1" && parts[1] == "15")
                    object_type = "BALANCE";
                else if (parts[0] == "1" && parts[1] == "16")
                    object_type = "HTLC";
                else if (parts[0] == "2" && parts[1] == "0")
                    object_type = "GLOBAL PROPERTY";
                else if (parts[0] == "2" && parts[1] == "1")
                    object_type = "DYNAMIC GLOBAL PROPERTY";
                else if (parts[0] == "2" && parts[1] == "3")
                    object_type = "ASSET DYNAMIC DATA";
                else if (parts[0] == "2" && parts[1] == "4")
                    object_type = "ASSET BITASSET DATA";
                else if (parts[0] == "2" && parts[1] == "5")
                    object_type = "ACCOUNT BALANCE";
                else if (parts[0] == "2" && parts[1] == "6")
                    object_type = "ACCOUNT STATISTICS";
                else if (parts[0] == "2" && parts[1] == "7")
                    object_type = "TRANSACTION";
                else if (parts[0] == "2" && parts[1] == "8")
                    object_type = "BLOCK SUMMARY";
                else if (parts[0] == "2" && parts[1] == "9")
                    object_type = "ACCOUNT TRANSACTION HISTORY";
                else if (parts[0] == "2" && parts[1] == "10")
                    object_type = "BLINDED BALANCE";
                else if (parts[0] == "2" && parts[1] == "11")
                    object_type = "CHAIN PROPERTY";
                else if (parts[0] == "2" && parts[1] == "12")
                    object_type = "WITNESS SCHEDULE";
                else if (parts[0] == "2" && parts[1] == "13")
                    object_type = "BUDGET RECORD";
                else if (parts[0] == "2" && parts[1] == "14")
                    object_type = "SPECIAL AUTHORITY";

                return object_type;
            },
            columnsort: function ($scope, column, sortColumn, sortClass, reverse, reverseclass, columnToSort) {

                $scope[column] = column;
                $scope[columnToSort] = column;


                // sort ordering (Ascending or Descending). Default to true (oder ID ascending)
                $scope[reverse] = true;

                // called on header click
                $scope[sortColumn] = function(col){
                    if ($scope[columnToSort] !== col) {
                      $scope[reverse] = false
                    }

                    $scope[columnToSort] = col;
                    if($scope[reverse]){
                        $scope[reverse] = false;
                        $scope[reverseclass] = 'arrow-up';
                    } else {
                        $scope[reverse] = true;
                        $scope[reverseclass] = 'arrow-down';
                    }
                };
                // remove and change class
                $scope[sortClass] = function(col) {
                    if ($scope[columnToSort] === col) {
                        //console.log($scope[column_name] + " - " + col);
                        if ($scope[reverse]) {
                            return 'arrow-down';
                        } else {
                            return 'arrow-up';
                        }
                    } else {
                        return '';
                    }
                };
            }
        }
    }

})();
