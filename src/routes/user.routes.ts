import { FastifyInstance } from "fastify";
import { z } from "zod";
import { knex } from "../database";
import { randomUUID } from "crypto";

export async function userRoutes(app: FastifyInstance) {
  app.post("/", async (request, reply) => {
    const createUserBodySchema = z.object({
      name: z.string(),
      email: z.string().email(),
    });

    const { name, email } = createUserBodySchema.parse(request.body);

    const userExists = await knex("users").where({ email }).first();
    if (userExists) {
      return reply.status(400).send({ error: "User already exists." });
    }

    const id = randomUUID();

    await knex("users").insert({
      id,
      name,
      email,
    });

    reply.setCookie("session_id", id, {
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return reply.status(201).send({ message: "User created." });
  });

  app.get("/", async (request, reply) => {
    const users = await knex("users").select("*");

    return reply.status(200).send({ users });
  });
}
