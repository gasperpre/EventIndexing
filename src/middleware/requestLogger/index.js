const LogRequest = require("../../models/LogRequest.model");

const requestLogger = (req, res, next) => {
    try {
        LogRequest.create({url: req.url, method: req.method, api_key: req.headers["api-key"]});
        next();
    } catch (e) {
        next(e);
    }
}

module.exports = requestLogger;

