const app = require('../app');
const request = require("supertest");

const API_KEY = process.env.API_KEY;

describe("GET /erc20/transfers/:token_name", () => {

    describe("Error response cases", () => {
        it("Should deny acces without API Key", async () => {
            const response = await request(app).get("/erc20/transfers/dai");
            expect(response.statusCode).toBe(401);
        });

        it("Should deny acces with wrong API Key", async () => {
            const response = await request(app).get("/erc20/transfers/dai").set('API-Key', "DEFINETELYWRONGAPIKEY");
            expect(response.statusCode).toBe(401);
        });

        it("Should return error for erc20 that is not in database", async () => {
            const response = await request(app).get("/erc20/transfers/randomErc").set('API-Key', API_KEY);
            expect(response.statusCode).toBe(400);
            expect(response.body.error).toBeDefined();
        });
    });

    describe("Success response cases", () => {
        it("Should allow acces with API Key", async () => {
            const response = await request(app).get("/erc20/transfers/dai").set('API-Key', API_KEY);
            expect(response.statusCode).toBe(200);
        });
    
        it("Should specify json in the content type header", async () => {
            const response = await request(app).get("/erc20/transfers/dai").set('API-Key', API_KEY);
            expect(response.headers["content-type"]).toEqual(expect.stringContaining("json"));
        });
    
        it("Should have default pagination", async () => {
            const page = 1;
            const page_size = 100;
            const response = await request(app).get("/erc20/transfers/dai").set('API-Key', API_KEY);
            expect(response.body.page).toBe(page);
            expect(response.body.page_size).toBe(page_size);
            expect(response.body.total_pages).toBe(Math.ceil(response.body.total_records / page_size));
            expect(response.body.data.length).toBe(page_size);
        });

        it("Should have custom pagination", async () => {
            const page = 2;
            const page_size = 10;
            const response = await request(app).get(`/erc20/transfers/dai?page=${page}&&page_size=${page_size}`).set('API-Key', API_KEY);
            expect(response.body.page).toBe(page);
            expect(response.body.page_size).toBe(page_size);
            expect(response.body.total_pages).toBe(Math.ceil(response.body.total_records / page_size));
            expect(response.body.data.length).toBe(page_size);
        });

        it("Should return data with expected properties", async () => {
            const response = await request(app).get("/erc20/transfers/dai").set('API-Key', API_KEY);
            const firstRow = response.body.data[0];
            expect(firstRow).toEqual(
                expect.objectContaining({
                    transaction_hash: expect.any(String),
                    log_index: expect.any(Number),
                    block_number: expect.any(Number),
                    transaction_index: expect.any(Number),
                    from_address: expect.any(String),
                    to_address: expect.any(String),
                    value: expect.any(String)
                })
            );
        });
      
        it("Should return transactions for given address", async () => {
            const response = await request(app).get("/erc20/transfers/dai").set('API-Key', API_KEY);
            const address = response.body.data[0].from_address;
            const response2 = await request(app).get(`/erc20/transfers/dai?address=${address}`).set('API-Key', API_KEY);
            response2.body.data.forEach(row => {
                expect([row.from_address, row.to_address]).toContain(address);
            })
        });
    });
});
