require('dotenv').config();
const app = require('./app');
const sequelize = require('./database');
const jobs = require('./jobs');

const port = (process.env.PORT || 8081);

sequelize.sync()
	.then(() => {
        app.listen(port, () => console.log("Server live on: ", port));

        jobs.initialize();
	})
	.catch(err => {
		console.log(err);
	});
