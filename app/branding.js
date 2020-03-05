export function getGATag() {
    return null;
}

export function getConnections() {
    return {
        blockchain: "wss://eu.nodes.bitshares.ws/",
        api: "http://127.0.0.1:5000/openexplorer"  // "http://127.0.0.1:5000/"
    }
}

export function getConfig() {
    return {
        name: "BitShares",
        coreSymbol: "BTS",
        example: {
            block: 19446934,
            account: "alfredo-worker",
            tx: "738be2bd22e2da31d587d281ea7ee9bd02b9dbf0"
        }
    }
}
