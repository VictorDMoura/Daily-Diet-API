import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { execSync } from "node:child_process";
import request from "supertest";
import { app } from "../src/app";

describe("Meals routes", () => {
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

  it("should be able to create a new meal", async () => {
    const responseCreateNewUser = await request(app.server)
      .post("/users")
      .send({
        name: "John Doe",
        email: "jons@email.com",
      });

    const cookie = responseCreateNewUser.headers["set-cookie"][0];

    const response = await request(app.server)
      .post("/meals")
      .set("Cookie", cookie)
      .send({
        name: "Breakfast",
        description: "A good meal",
        date: "2022-11-20",
        hour: "08:00:00",
        is_on_diet: false,
      })
      .expect(201);

    expect(response.body).toEqual({ message: "Meal created" });
  });

  it("should be able to list all meals", async () => {
    const responseCreateNewUser = await request(app.server)
      .post("/users")
      .send({
        name: "John Doe",
        email: "jons@email.com",
      });

    const cookie = responseCreateNewUser.headers["set-cookie"][0];

    await request(app.server).post("/meals").set("Cookie", cookie).send({
      name: "Breakfast",
      description: "A good meal",
      date: "2022-11-20",
      hour: "08:00:00",
      is_on_diet: false,
    });

    const response = await request(app.server)
      .get("/meals")
      .set("Cookie", cookie)
      .expect(200);

    expect(response.body).toEqual({
      meals: [
        {
          id: expect.any(String),
          name: "Breakfast",
          description: "A good meal",
          date: "2022-11-20",
          hour: "08:00:00",
          is_on_diet: 0,
          session_id: expect.any(String),
          created_at: expect.any(String),
        },
      ],
    });
  });
});
