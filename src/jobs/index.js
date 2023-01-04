const {syncErc20Transfers} = require("../controllers/Erc20.controller");

const initialize = () => {
    syncErc20Transfers("DAI", "0x6b175474e89094c44da98b954eedeac495271d0f");
}

module.exports = { initialize };