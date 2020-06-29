(function() {
    'use strict';

    angular.module('app').factory('witnessService', ['$http', 'appConfig', witnessService]);

    function witnessService($http, appConfig) {

        return {
            getWitnessById: getWitnessById,
        };

        function getWitnessById(witnessId, votersOffset = 0, votersLimit = 20) {

            if(!witnessId)
                throw new Error('Please specify the witnessId');

            return new Promise((resolve, reject) => {
                $http.get(appConfig.urls.python_backend() + `/witness?witness_id=${witnessId}&voters_offset=${votersOffset}&voters_limit=${votersLimit}`)
                .then((response) => {

                    const witnessData = {
                        witness: {
                            id: response.data.witness_object.witness_account,
                            rank: response.data.rank,
                            total_votes: response.data.total_votes + " " + appConfig.branding.coreSymbol
                        },
                        next_tally: {
                            rank: response.data.next_tally.rank,
                            total_votes: response.data.next_tally.total_votes + " " + appConfig.branding.coreSymbol,
                        },
                        voters: response.data.voters.map((voter) => {
                            return {
                                name: voter.name,
                                voting_since: voter.voting_since
                            }
                        })
                    };

                    resolve(witnessData);
                })
                .catch((err) => {
                    reject(err);
                });
            })
        }
    }

})();
