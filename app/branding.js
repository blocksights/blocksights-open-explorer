export function getGATag() {
    return null;
}

export function getAvailableEndpoints() {
    return [
        {
            key: "mainnet",
            translate: 'Mainnet',
            url: 'https://api.bitshares.ws/openexplorer',
            chainId: '4018d7844c78f6a6c41c6a552b898022310fc5dec06da467ee7905a8dad512c8',
            isDefault: true,
        },
        {
            key: "testnet",
            translate: 'Testnet',
            url: 'https://api.testnet.bitshares.ws/openexplorer',
            chainId: '39f5e2ede1f8bc1a3a54a7914414e3779e33193f1f5693510e73cb7a87617447'
        },
        {
            key: "local",
            translate: 'Local',
            url: 'http://localhost:5000/openexplorer',
            chainId: '4018d7844c78f6a6c41c6a552b898022310fc5dec06da467ee7905a8dad512c8'
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
            chainId: '39f5e2ede1f8bc1a3a54a7914414e3779e33193f1f5693510e73cb7a87617447',
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
