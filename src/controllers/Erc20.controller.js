const ethers = require("ethers");
const abi = require("../contracts/erc20.json");
const sequelize = require("../database");
const Erc20Transfer = require("../models/Erc20Transfer.model");

/**
 * Starts syncing ERC20 transfer events to the database for the specified token
 * @param {String} token_name
 * @param {String} token_address 
 * @param {Number} starting_block
 * @param {Boolean} resync 
 * @return {Promise<void>}
 */
const syncErc20Transfers = async (token_name, token_address, starting_block = 0, resync = false) => {

    console.log(`Syncing ${token_name} at ${token_address}`);

    try {
        const provider = new ethers.providers.InfuraProvider("mainnet",process.env.INFURA_KEY);
        const contract = new ethers.Contract(token_address, abi, provider);

        // CHECK WHAT IS IN DATABASE SO FAR
        let last_update_block = await Erc20Transfer.max("block_number", {where: {"token_name": token_name}});

        const current_block = await provider.getBlockNumber();
        
        // START LISTENING TO NEW TRANSFERS
        contract.on("Transfer", (from, to, value, transaction) => {
            if(current_block === transaction.blockNumber) return;
            saveTransfers(token_name, [transaction]);
        });

        // SYNC OLD TRANSFERS
        const blocks_per_call = 50;

        if(!last_update_block || resync) {
            if(starting_block > 0) {
                last_update_block = starting_block;
            } else {
                last_update_block = await getCreationBlock(provider, token_address, 0, current_block);
            }
        }
        
        if(last_update_block <= current_block) {

            let from_block = last_update_block;

            while(from_block < current_block) {
                let to_block = from_block + blocks_per_call;

                if(to_block > current_block) to_block = current_block;

                const transfers = await contract.queryFilter("Transfer", from_block + 1, to_block);

                saveTransfers(token_name, transfers);

                from_block += blocks_per_call;
            }
        }

        console.log(`Synced ${token_name} at ${token_address}`);
    } catch (e) {
        console.log(`Sync ${token_name} ERROR:\n ${e.message}`);
    }
}

/**
 * Find contract creation block using binary search algorithm.
 * @param {Provider} provider 
 * @param {String} contract_address 
 * @param {Number} start_block 
 * @param {Number} end_block 
 * @returns {Promise<Number>}
 */
const getCreationBlock = async (provider, contract_address, start_block, end_block) => {

    if(start_block === end_block) return start_block;

    const mid_block = Math.floor((start_block + end_block) / 2);
    const code = await provider.getCode(contract_address, mid_block);
    if(code.length > 2) {
        return await getCreationBlock(provider, contract_address, start_block, mid_block);
    } else {
        return await getCreationBlock(provider, contract_address, mid_block+1, end_block);
    }
}

/**
 * Saves an array of ethers transfers to the database
 * @param {String} token_name 
 * @param {Array} transfers
 * @return {Promise<void>}
 */
const saveTransfers = async (token_name, transfers) => {
    try {
        if(transfers.length === 0) return;

        transfers.forEach(transfer => {
            const {transactionHash, logIndex, blockNumber, transactionIndex, args} = transfer;

            try {
                Erc20Transfer.create({
                    token_name,
                    transaction_hash: transactionHash,
                    log_index: logIndex,
                    block_number: blockNumber,
                    transaction_index: transactionIndex,
                    from_address: args.from,
                    to_address: args.to,
                    value: args.value.toString()
                });
            } catch (e) {
                if(e.message !== "Validation error"){
                    console.log(`ERR: failed to save transfer ${token_name}, ${transactionHash}, ${logIndex}. REASON: ${e.message}`);
                }
            }
        });
    } catch(e) {
        console.log(`Save transfers ${token_name} ERROR:\n ${e.message}`);
    }
}

const getErc20Transfers = async (req, res) => {
    const token_name = req.params.token_name;
    const page_size = Number(req.query.page_size || 100);
    const page = Number(req.query.page || 1);
    const address = req.query.address || null;

    let query = `
        SELECT transaction_hash, log_index, block_number, transaction_index, from_address, to_address, value
        FROM erc20transfers
        WHERE token_name = '${token_name}'`;

    let query_total = `SELECT COUNT(*) as total FROM erc20transfers WHERE token_name = '${token_name}'`;

    if(address) {
        query_total += ` AND (from_address = '${address}' OR to_address = '${address}')`;
        query += ` AND (from_address = '${address}' OR to_address = '${address}')`;
    }

    query += " ORDER BY block_number DESC, log_index DESC";

    if(page > 1) {
        query += " LIMIT " + (page * page_size) + "," + page_size;
    } else {
        query += " LIMIT " + page_size;
    }

    try {
        const query_total_res = await sequelize.query(query_total);
        const total_records = query_total_res[0][0].total;
        const total_pages = Math.ceil(total_records / page_size);

        if(total_pages < page) throw new Error(`Requested page ${page} of ${total_pages}`);

        const query_res = await sequelize.query(query);
        res.status(200).json({total_records, page, page_size, total_pages, data: query_res[0]});
    } catch (e) {
        res.status(400).json({error: e.code === "ER_NO_SUCH_TABLE" ? `No records for ${token_name}` : e.message});
    }
}


module.exports = {syncErc20Transfers, getErc20Transfers};