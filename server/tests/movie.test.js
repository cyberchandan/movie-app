const request = require("supertest");
const app = require("../index");

describe("GET /api/movie", () => {
  it("should return 400 if no imdbId", async () => {
    const res = await request(app).get("/api/movie/");
    expect(res.statusCode).toBe(404);
  });
});