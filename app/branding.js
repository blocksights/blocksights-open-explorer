export function getGATag() {
    return null;
}

export function getAvailableEndpoints() {
    return [
        {
            translate: 'Testnet',
            url: 'http://127.0.0.1:5000/openexplorer',
            isDefault: true,
        }
    ];
}

export function getAvailableBlockchains() {
    return [
        {
            translate: 'Testnet',
            chainId: ''
        }
    ];
}

export function getConfig() {
    return {
        name: "BitShares",
        coreSymbol: "BTS",
        defaultQuote: "EUR",
        example: {
            block: 19446934,
            account: "alfredo-worker",
            tx: "738be2bd22e2da31d587d281ea7ee9bd02b9dbf0"
        }
    }
}
