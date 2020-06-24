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
        let localStorageSync = false;
        let localStorageSyncSuccess = false;
        
        let endpointsList = [];
        let blockchainsList = [];
        
        /**
         * Set active endpoint for api url
         * @param {Endpoint} endpoint
         */
        function _setActiveEndpoint(endpoint){
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
                    _setActiveEndpoint(endpoint);
            });
            
            // if default endpoint is not specified we use first element of array
            if(!activeEndpoint)
                _setActiveEndpoint(list[0]);
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
            enableLocalStorageSync: () => localStorageSync = true,
            disableLocalStorageSync: () => localStorageSync = false,
            $get: ($localStorage) => {
                
                function getApiUrl() {
                    
                    /** if sync with localStorage turned on  */
                    if(localStorageSync && !localStorageSyncSuccess) {
                        localStorageSyncSuccess = true;
                        
                        /** if sync is on and user has endpoint in localStorage */
                        if($localStorage.api && $localStorage.api.endpoint && $localStorage.api.endpoint.url) {
                            _setActiveEndpoint($localStorage.api.endpoint);
                        } else {
                            /** if sync is on and user has not endpoint in localStorage */
                            $localStorage.api = {
                                ...$localStorage.api,
                                endpoint: activeEndpoint,
                            };
                        }
                        
                    }
                    
                    return activeEndpoint && activeEndpoint.url;
                }
                
                /** this method is public and store the choice in localStorage */
                function setActiveEndpoint(endpoint) {
                    
                    _setActiveEndpoint(endpoint);
                    
                    if(localStorageSync) {
                        $localStorage.api = {
                            ...$localStorage.api,
                            endpoint: endpoint,
                        };
                        
                    }
                    
                }
                
                return {
                    setActiveBlockchain: setActiveBlockchain,
                    setActiveEndpoint: setActiveEndpoint,
                    /** @returns {string} - active endpoint url */
                    getApiUrl: getApiUrl,
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
