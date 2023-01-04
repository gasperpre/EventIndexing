require('dotenv').config();
const express = require('express');
const cors = require('cors');
const routes = require('./routes/index.js');
const middleware = require('./middleware');

const app = express();

app.use(cors());
app.use(middleware.apiKey);

if(process.env.NODE_ENV !== "test") {
    app.use(middleware.rateLimiter);
    app.use(middleware.requestLogger);
} 

app.use("/", routes);

module.exports = app