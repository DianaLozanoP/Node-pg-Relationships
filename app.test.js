//first  create a test environment
// process.env.NODE_ENV = "test";

//suoertest to test endpoints and routes on HTTP server
const request = require("supertest");

const app = require("./app")

describe('GET /companies', () => {
    test("Get all companies", async () => {
        const res = await request(app).get('/companies');
        expect(res.statusCode).toBe(200);
        let obj = '{"companies": [{"code": "apple", "description": "Maker of OSX.", "name": "Apple Computer"}, {"code": "ibm", "description": "Big blue.", "name": "IBM"}]}'
        expect(res.body).toEqual(JSON.parse(obj))
    });
});

describe('GET/companies/:code', () => {
    test("Get a company by code", async () => {
        const res = await request(app).get(`/companies/apple`);
        expect(res.statusCode).toBe(200);
        let jsonString = '{"company":{"code":"apple","description":"Maker of OSX.", "invoices": {"add_date": "2024-01-07T05:00:00.000Z", "amt": 100, "comp_code": "apple", "id": 1, "paid": false, "paid_date": null}, "name": "Apple Computer"}}'
        expect(res.body).toEqual(JSON.parse(jsonString))
    });
});

describe('POST/companies', () => {
    test("Adds a company", async () => {
        const res = await request(app).post('/companies').send({
            code: "tm", name: "Tim Hortons", description: "Coffee and fast food services"
        });
        expect(res.statusCode).toBe(201);
        expect(res.body).toEqual({
            "company": {
                "code": "tm", "name": "Tim Hortons", "description": "Coffee and fast food services"
            }
        });
    });

})

describe('PUT/companies/:code', () => {
    test("Edit existing company", async () => {
        const res = await request(app).put('/companies/tm').send({ name: "Tim Hortons Inc", description: "Coffee and fast food services" });
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({ "company": { "code": "tm", "name": "Tim Hortons Inc", "description": "Coffee and fast food services" } })
    })
})

describe('DELETE/companies/:code', () => {
    test('Delete existing company', async () => {
        const res = await request(app).delete('/companies/tm')
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({ status: "DELETED" });
    })
})