'use strict';

const HTML = [
    "sections/accounts/account.html",
    "sections/accounts/accounts.html",
    "sections/assets/asset.html",
    "sections/assets/assets.html",
    "sections/blocks/block.html",
    "sections/blocks/blocks.html",
    "sections/committee_members/committee_members.html",
    "sections/dashboard/dashboard.html",
    "sections/fees/fees.html",
    "sections/layout/footer.html",
    "sections/layout/header.html",
    "sections/markets/market.html",
    "sections/markets/markets.html",
    "sections/network_dropdown/network_dropdown.html",
    "sections/objects/object.html",
    "sections/operations/operation.html",
    "sections/operations/operations.html",
    "sections/proxies/proxies.html",
    "sections/search/search.html",
    "sections/txs/tx.html",
    "sections/txs/txs.html",
    "sections/voting/voting.html",
    "sections/witnesses/witnesses.html",
    "sections/witnesses/witness.html",

    "sections/workers/workers.html",

    "ui/responsive-table.html",
    "ui/long-hash.html",
];

const CSS = [
    '../node_modules/components-font-awesome/css/fontawesome.min.css',
    '../node_modules/components-font-awesome/css/solid.min.css',
    '../node_modules/angular-loading-bar/build/loading-bar.min.css',
    '../node_modules/bootstrap/dist/css/bootstrap.min.css',
    '../node_modules/angular-ui-notification/dist/angular-ui-notification.css',
    "styles/custom.css"
];

module.exports = [...HTML, ...CSS];
