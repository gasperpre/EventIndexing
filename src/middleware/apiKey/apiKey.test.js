require('dotenv').config();
const httpMocks = require('node-mocks-http');
const apiKey = require('.');

const API_KEY = process.env.API_KEY;

describe("API key middleware test", () => {

    it("Should deny acces without API Key", async () => {
        let req = httpMocks.createRequest({
            method: 'GET',
            url: '/'
        });
        let res = httpMocks.createResponse();
        apiKey(req, res, (err) => {});
        expect(res.statusCode).toBe(401);
    });

    it("Should deny acces with wrong API Key", async () => {
        let req = httpMocks.createRequest({
            method: 'GET',
            url: '/',
            headers: {"API-Key": "DEFINETELYWRONGAPIKEY"}
        });
        let res = httpMocks.createResponse();
        apiKey(req, res, (err) => {});
        expect(res.statusCode).toBe(401);
    });

    it("Should allow acces with right API Key", async () => {
        let req = httpMocks.createRequest({
            method: 'GET',
            url: '/',
            headers: {"API-Key": API_KEY}
        });
        let res = httpMocks.createResponse();
        apiKey(req, res, (err) => {});
        expect(res.statusCode).toBe(200);
    });
})