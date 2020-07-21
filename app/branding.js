export function getGATag() {
    return null;
}

export function getAvailableEndpoints() {
    return [
        {
            translate: 'Mainnet',
            url: 'http://127.0.0.1:5000/openexplorer',
            chainId: '4018d7844c78f6a6c41c6a552b898022310fc5dec06da467ee7905a8dad512c8',
            isDefault: true,
        }
    ];
}

export function getAvailableBlockchains() {
    return [
        {
            translate: 'Mainnet',
            chainId: '4018d7844c78f6a6c41c6a552b898022310fc5dec06da467ee7905a8dad512c8',
            config: {
                name: "BitShares",
                coreSymbol: "BTS",
                defaultQuote: "EUR",
                example: {
                    block: 19446934,
                    account: "alfredo-worker",
                    tx: "738be2bd22e2da31d587d281ea7ee9bd02b9dbf0"
                }
            }
        },
        {
            translate: 'Testnet',
            chainId: '',
            config: {
                name: "BitShares Testnet",
                coreSymbol: "TEST",
                defaultQuote: "TESTUSD",
                example: {
                    block: 4,
                    account: "alfredo-worker",
                    tx: "738be2bd22e2da31d587d281ea7ee9bd02b9dbf0"
                }
            }
        }
    ];
}
