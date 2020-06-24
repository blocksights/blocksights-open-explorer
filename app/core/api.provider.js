/**
 * The global idea of API Provider is to accept API configuration before
 * app launches and manipulate its config during the run-time
 *
 * Currently, API Provider is used to configure the API endpoints and Available Blockchain list
 * Please, configure API using ApiProvider in app.config.js file
 * */

/**
 * @typedef {Object} Endpoint
 * @property {string} translate - the translate of network to display it on UI
 * @property {string} url - the url of the backend
 * */

/**
 * @typedef {Object} Blockchain
 * @property {string} translate - the translate of the Blockchain to display it on UI (header)
 * @property {string} chainId - the chainId string to match active Blockchain
 */

(function () {
    
    angular.module('app')
        .provider('Api', apiProvider);
    
    function apiProvider() {
        let activeEndpoint = '';
        let activeBlockchain = '';
        
        let endpointsList = [];
        let blockchainsList = [];
        
        /**
         * Set active endpoint for api url
         * @param {Endpoint} endpoint
         */
        function setActiveEndpoint(endpoint){
            if(!endpoint.translate || !endpoint.url)
                throw new Error('endpoint should have a translate and url');
            
            activeEndpoint = endpoint;
        }
    
        /**
         * Set active Blockchain by chainId. This function is looking for BlockchainList and tries to find Blockchain where chainId match
         * @param {string} chainId - set the active chainId in the list. If the Blockchain with active chainId is missed from the BlockchainsList the app will throw an error
         * */
        
        function setActiveBlockchain (chainId) {
            let blockchain = blockchainsList.find((chain) => chain.chainId === chainId);
            
            if(!blockchain)
                throw new Error(`The provided chainId doesn't match any of provided Blockchain.chainId - ${chainId}`);
            
            activeBlockchain = blockchain;
        }
        
        /** Accepts the list of available endpoints
         * @param {Endpoint[]} list - list of endpoints
         */
        function setEndpoints (list) {
            if(!Array.isArray(list))
                throw new Error('The provided list of api endpoints should be an array');
            
            list.forEach((endpoint) => {
                if(!endpoint.url || !endpoint.translate)
                    throw new Error('The provided api endpoint is missed the required translate and url parameters');
                
                endpointsList.push({
                    translate: endpoint.translate,
                    url: endpoint.url,
                });
                
                if(endpoint.isDefault)
                    setActiveEndpoint(endpoint);
            });
            
            // if default endpoint is not specified we use first element of array
            if(!activeEndpoint)
                setActiveEndpoint(list[0]);
        }
    
        /** Accepts the list of available chains
         * @param {Blockchain[]} list - list of chains
         */
        function setKnownBlockchains (list) {
            if(!Array.isArray(list))
                throw new Error('The provided list of API chains should be an array');
            
            list.forEach((endpoint) => {
                blockchainsList.push({
                    translate: endpoint.translate,
                    chainId: endpoint.chainId,
                });
            });
        }
        
        return {
            setKnownEndpoints: setEndpoints,
            setKnownBlockchains: setKnownBlockchains,
            $get: () => {
                return {
                    setActiveBlockchain: setActiveBlockchain,
                    setActiveEndpoint: setActiveEndpoint,
                    /** @returns {string} - active endpoint url */
                    getApiUrl: () => activeEndpoint && activeEndpoint.url,
                    /** @returns {string|undefined} - active chain title translation */
                    getActiveChainTranslation: () => activeBlockchain && activeBlockchain.translate,
                    /** @returns {Endpoint[]} - returns an array of all endpoints */
                    getEndpoints: () => endpointsList,
                    /** @returns {Blockchain[]} - returns an array of all chains */
                    getBlockchainsList: () => blockchainsList,
                    
                }
            }
        }
    }
    
})();
