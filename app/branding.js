export function getBlockchainName() {
    return "BitShares::";
}

export function getGATag() {
    return null;
}

export function getConnections() {
    return {
        blockchain: "wss://eu.nodes.bitshares.ws/",
        api: "https://explorer.bitshares-kibana.info/"
    }
}

export function getCoreTokenSymbol() {
    return "BTS2"
}

export function getConfig() {
    return {
        name: "BitShares",
        coreSymbol: "BTS2",
        example: {
            block: 19446934,
            account: "alfredo-worker",
            tx: "738be2bd22e2da31d587d281ea7ee9bd02b9dbf0"
        }
    }
}
