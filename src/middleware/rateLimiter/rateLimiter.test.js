require('dotenv').config();
const httpMocks = require('node-mocks-http');
const rateLimiter = require(".");

const WINDOW_SIZE = Number(process.env.RATE_LIMIT_WINDOW_SIZE);
const MAX_WINDOW_REQUEST_COUNT = Number(process.env.RATE_LIMIT_WINDOW_REQUEST_COUNT);

var req, res;

const resetRequest = () => {
    req = httpMocks.createRequest({
        method: 'GET',
        url: '/'
    });
    res = httpMocks.createResponse();
}

describe("Rate limiter middleware test", () => {

    it(`Should not allow more than ${MAX_WINDOW_REQUEST_COUNT} requests per ${WINDOW_SIZE / 1000}s`, async () => {
        for(let i = 0; i <= MAX_WINDOW_REQUEST_COUNT + 1; i++ ){
            resetRequest();
            rateLimiter(req, res, (err) => {});

            if(MAX_WINDOW_REQUEST_COUNT === i) {
                expect(res.statusCode).toBe(429);
                await new Promise(r => setTimeout(r, WINDOW_SIZE));
            } else {
                expect(res.statusCode).toBe(200);
            }
        }

    });
})