(function() {
    'use strict';

    angular.module('app').factory('governanceService', governanceService);
    governanceService.$inject = ['$http', 'appConfig', 'utilities', 'networkService'];

    function governanceService($http, appConfig, utilities, networkService) {

        return {
            getCommitteeMembers: function(callback) {
                return new Promise((resolve, reject) => {
                    networkService.getHeader(function (returnData) {
                        const active_committee = [];
                        const standby_committee = [];
                        const committee = [];

                        const committee_count = returnData.committee_count;

                        $http.get(appConfig.urls.python_backend() + "/committee_members").then(function(response) {
                            let counter = 1;
                            angular.forEach(response.data, function(value, key) {
                                const parsed = {
                                    id: value[0].id,
                                    total_votes: utilities.formatBalance(value[0].total_votes, 5),
                                    url: value[0].url,
                                    committee_member_account: value[0].committee_member_account,
                                    committee_member_account_name: value[0].committee_member_account_name,
                                    counter: counter
                                };

                                if(counter <= committee_count) {
                                    active_committee.push(parsed);
                                }
                                else {
                                    standby_committee.push(parsed);
                                }
                                counter++;
                            });

                            committee[0] = active_committee;
                            committee[1] = standby_committee;
                            callback(committee);
                            resolve(committee);

                        }).catch((err) => {
                            reject(err);
                        });

                    }).catch((err) => {
                        reject(err);
                    });
                });
            },
            getWitnesses: function(status) {
                return new Promise((resolve, reject) => {
                    const witnesses = [];
                    $http.get(appConfig.urls.python_backend() + "/witnesses?status=" + status).then(function(response) {
                        let counter = 1;
                        angular.forEach(response.data, function(value, key) {
                            const parsed = {
                                id: value.id,
                                last_aslot: value.last_aslot,
                                last_confirmed_block_num: value.last_confirmed_block_num,
                                pay_vb: value.pay_vb,
                                total_missed: value.total_missed,
                                total_votes: utilities.formatBalance(value.total_votes, 5),
                                url: value.url,
                                witness_account: value.witness_account,
                                witness_account_name: value.witness_account_name,
                                counter: counter
                            };
                            witnesses.push(parsed);
                            counter++;
                        });
                        resolve(witnesses);
                    }).catch((err) => {
                        reject(err);
                    }) ;

                });
            },
            getWorkers: function(callback) {
                return $http.get(appConfig.urls.python_backend() + "/workers").then(function(response) {
                    var workers_current = [];
                    var workers_expired = [];
                    var workers = [];
                    for(var i = 0; i < response.data.length; i++) {
                        var now = new Date();
                        var start = new Date(response.data[i][0].work_begin_date);
                        var end = new Date(response.data[i][0].work_end_date);

                        var votes_for = utilities.formatBalance(response.data[i][0].total_votes_for, 5);
                        var daily_pay = utilities.formatBalance(response.data[i][0].daily_pay, 5);
                        var tclass = "";

                        var worker;

                        var have_url = 0;
                        if(response.data[i][0].url && response.data[i][0].url !== "http://") {
                            have_url = 1;
                        }

                        if(now > end) {
                            tclass = "danger";
                            worker = {
                                name: response.data[i][0].name,
                                daily_pay: daily_pay,
                                url: response.data[i][0].url,
                                have_url: have_url,
                                votes_for: votes_for,
                                votes_against: response.data[i][0].total_votes_against,
                                worker: response.data[i][0].worker_account,
                                start: start.toDateString(),
                                end: end.toDateString(),
                                id: response.data[i][0].id,
                                worker_name: response.data[i][0].worker_account_name,
                                tclass: tclass, perc: response.data[i][0].perc
                            };
                            workers_expired.push(worker);
                        }
                        else {
                            var voting_now = "";
                            if(now > start) {
                                if(response.data[i][0].perc >= 50 && response.data[i][0].perc < 100) {
                                    tclass = "warning";
                                }
                                else if(response.data[i][0].perc >= 100) {
                                    tclass = "success";
                                }
                            }
                            else {
                                tclass = "";
                                if(start > now) {
                                    voting_now = "VOTING NOW!";
                                }
                            }
                            worker = {
                                name: response.data[i][0].name,
                                daily_pay: daily_pay,
                                url: response.data[i][0].url,
                                have_url: have_url,
                                votes_for: votes_for,
                                votes_against: response.data[i][0].total_votes_against,
                                worker: response.data[i][0].worker_account,
                                start: start.toDateString(),
                                end: end.toDateString(),
                                id: response.data[i][0].id,
                                worker_name: response.data[i][0].worker_account_name,
                                tclass: tclass,
                                perc: response.data[i][0].perc,
                                voting_now: voting_now
                            };
                            workers_current.push(worker);
                        }
                    }
                    workers[0] = workers_current;
                    workers[1] = workers_expired;
                    callback(workers);
                });
            },
            getProxies: function(callback) {
                return $http.get(appConfig.urls.python_backend() + "/top_proxies").then(function(response) {
                    var proxies = [];
                    var counter = 1;
                    angular.forEach(response.data, function(value, key) {
                        var parsed = {
                            position: counter,
                            account: value.id,
                            account_name: value.name,
                            power: value.voting_power,
                            followers: value.followers,
                            perc: value.voting_power_percentage
                        };
                        if(counter <= 10) {
                            proxies.push(parsed);
                        }
                        counter++;
                    });
                    callback(proxies);
                });
            },
            getWitnessVotes: function(callback) {
                return $http.get(appConfig.urls.python_backend() + "/witnesses_votes").then(function(response2) {
                    var witnesses = [];
                    angular.forEach(response2.data, function (value, key) {
                        var parsed = {
                            id: value.witness_id,
                            witness_account_name: value.witness_account_name
                        };
                        let i;
                        for (i = 0; i < value.top_proxy_votes.length; i++) {
                            parsed["proxy" + (i+1)] = value.top_proxy_votes[i].split(":")[1]
                            parsed["tclass" + (i+1)] = ((value.top_proxy_votes[i].split(":")[1] === "Y") ? "success" : "danger")
                        }
                        witnesses.push(parsed);
                    });
                    callback(witnesses);
                });
            },
            getWorkersVotes: function(callback) {
                return $http.get(appConfig.urls.python_backend() + "/workers_votes").then(function(response2) {
                    var workers = [];
                    angular.forEach(response2.data, function (value, key) {
                        var parsed = {
                            id: value.worker_id,
                            worker_account_name: value.worker_account_name,
                            worker_name: value.worker_name
                        };
                        let i;
                        for (i = 0; i < value.top_proxy_votes.length; i++) {
                            parsed["proxy" + (i+1)] = value.top_proxy_votes[i].split(":")[1]
                            parsed["tclass" + (i+1)] = ((value.top_proxy_votes[i].split(":")[1] === "Y") ? "success" : "danger")
                        }
                        workers.push(parsed);
                    });
                    callback(workers);
                });
            },
            getCommitteeVotes: function(callback) {
                return $http.get(appConfig.urls.python_backend() + "/committee_votes").then(function(response) {
                    var committee = [];
                    angular.forEach(response.data, function (value, key) {
                        var parsed = {
                            id: value.committee_id,
                            committee_account_name: value.committee_account_name
                        };
                        let i;
                        for (i = 0; i < value.top_proxy_votes.length; i++) {
                            parsed["proxy" + (i+1)] = value.top_proxy_votes[i].split(":")[1]
                            parsed["tclass" + (i+1)] = ((value.top_proxy_votes[i].split(":")[1] === "Y") ? "success" : "danger")
                        }
                        committee.push(parsed);
                    });
                    callback(committee);
                });
            }
        };
    }

})();
