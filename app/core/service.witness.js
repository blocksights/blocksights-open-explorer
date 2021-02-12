(function() {
    'use strict';

    angular.module('app').factory('witnessService', ['$http', 'appConfig', witnessService]);

    function witnessService($http, appConfig) {

        return {
            getWitnessById: getWitnessById,
            getWitnessVoters: getWitnessVoters
        };

        function getWitnessById(witnessId) {

            if(!witnessId)
                throw new Error('Please specify the witnessId');

            return new Promise((resolve, reject) => {
                $http.get(appConfig.urls.python_backend() + `/witness?witness_id=${witnessId}`)
                .then((response) => {
                    const witnessData = {
                        witness: {
                            id: response.data.witness_object.id,
                            name: response.data.name,
                            rank: response.data.rank,
                            total_votes: response.data.total_votes,
                            witness_account: response.data.witness_object.witness_account
                        }
                    };
                    if (response.data.next_tally) {
                        witnessData.nextTally = {
                            rank: response.data.next_tally.rank,
                            total_votes: response.data.next_tally.total_votes,
                        };
                    }

                    resolve(witnessData);
                })
                .catch((err) => {
                    reject(err);
                });
            })
        };

        function getWitnessVoters(witnessId, votersOffset = 0, votersLimit = 20) {

            if(!witnessId)
                throw new Error('Please specify the witnessId');

            return new Promise((resolve, reject) => {
                // &voters_offset=${votersOffset}&voters_limit=${votersLimit}
                $http.get(appConfig.urls.python_backend() + `/voteable_votes?id=${witnessId}`)
                    .then((response) => {
                        const voters = {
                            voters: response.data.voted_by.map((voter) => {
                                return {
                                    name: voter[0],
                                    voting_since: "-",
                                    voting_power: voter[1]
                                }
                            }),
                            tally: {
                                vote_id: response.data.vote_id,
                                block: response.data.block,
                                block_time: response.data.block_time,
                            }
                        };
                        resolve(voters);
                    })
                    .catch((err) => {
                        reject(err);
                    });
            })
        };
    }

})();
