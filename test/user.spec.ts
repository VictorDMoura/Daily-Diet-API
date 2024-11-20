import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { execSync } from "node:child_process";
import request from "supertest";
import { app } from "../src/app";

describe("Users routes", () => {
  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    execSync("npm run migrate:down --all");
    execSync("npm run migrate:up");
  });

  it("should be able to create a new user", async () => {
    const response = await request(app.server)
      .post("/users")
      .send({
        name: "John Doe",
        email: "john@email.com",
      })
      .expect(201);
    const cookie = response.headers["set-cookie"][0];
    expect(cookie).toContain("session_id");
  });
});
