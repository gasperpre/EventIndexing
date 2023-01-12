A Node application that can track ERC20 contracts deployed on Ethereum
and store the transactions on continuous basis. The transactions can then be retrieved
through the API by clients with API key.

The application was structured in a way that allows it to be expanded and
new features to be added.

Some features like API key and rate limiter are done as an example. It can be improved by storing
API keys to database instead of .env file, using Redis for rate limiter store and switching to a bit more sophisticated algorithm etc.
### Prerequisites

1. `Node`
2. `NPM`
3. `MySQL`

### Deployment

1. Clone the repository with `git clone https://github.com/gasperpre/event-indexing.git <your_project_folder_name>`
2. Change directory to your project folder `cd <your_project_folder_name>`
3. Install the dependencies with `npm install`
4. Copy contents from `.env.example` to `.env`
5. Create database in MySQL.
6. Update the database settings in the `.env` file.
7. Run the application with `npm start`
Notice: It will take some time to sync old token transfers.


### API Reference

#### Get ERC20 transfers

```http
  GET /erc20/transfers/:token_name
```

| Option       | Type        | Required  | Description                |
| :----------- | :---------- |:--------- | :------------------------- |
| `token_name` | `parameter` | **Yes**   | Name of erc20 token (dai)  |
| `API-Key`    | `header`    | **Yes**   | Your API key               |
| `page`       | `query`     | No        | Page number                |
| `page_size`  | `query`     | No        | Page size                  |
| `address`    | `query`     | No        | Sender/receiver address    |

### Usage

You can track any ERC20 token by calling the `syncErc20Transfers(token_name, token_address, starting_block, resync)` function.
By defining `starting_block`, you are choosing the block number from which forward you want the events to be synced.
If you set it to `0`, the app will find the block number when the contract was deployed and use that as `starting_block`.
If there are already some vents for the specified token in database, the last block number will be used.
You can force events to be resynced from starting block or deployment block by flagging `resync`.
Notice that your RPC node provider might have rate-limiting, and you need to add a rate limiter component.
You can see how DAI token tracking is set up in `src/jobs/index.js`.
The `initialize()` function will run when you start the server.
Any token that you set up, can then be accessed through the API using the token name.

```javascript
const {syncErc20Transfers} = require("../controllers/Erc20.controller");

const initialize = () => {
    syncErc20Transfers("DAI", "0x6b175474e89094c44da98b954eedeac495271d0f");
}
```

### Running Tests

General tests can be found in `src/tests/` directory. Module speciffic tests can be placed next to the module
(for example: `src/middleware/rateLimiter/rateLimiter.test.js`).

Following commands are available for testing

```bash
  npm test
  npm run test:general
  npm run test:middleware
```

### Packages used
- [express](https://github.com/visionmedia/express)
- [ethers](https://github.com/ethers-io/ethers.js)
- [mysql2](https://github.com/sidorares/node-mysql2)
- [sequelize](https://github.com/sequelize/sequelize)
- [cors](https://github.com/expressjs/cors)
- [dotenv](https://github.com/motdotla/dotenv)
- [jest](https://github.com/facebook/jest)
- [supertest](https://github.com/visionmedia/supertest)
- [node-mocks-http](https://github.com/howardabrams/node-mocks-http)
