const WINDOW_SIZE = Number(process.env.RATE_LIMIT_WINDOW_SIZE);
const MAX_WINDOW_REQUEST_COUNT = Number(process.env.RATE_LIMIT_WINDOW_REQUEST_COUNT);

const store = {};

const rateLimiter = (req, res, next) => {

    const api_key = req.get("API-Key");
    
    let record = store[api_key];
    const timestamp = Date.now();
    
    if(!record || timestamp - record.timestamp > WINDOW_SIZE) {
        record = { timestamp: timestamp, count: 1};
    }

    if(record.count > MAX_WINDOW_REQUEST_COUNT) {
        res.status(429).json({error: `You have exceeded the ${MAX_WINDOW_REQUEST_COUNT} requests in ${WINDOW_SIZE / 1000}s limit!`});
    } else {
        record.count ++;
        store[api_key] = record;
        next();
    }
}

module.exports = rateLimiter