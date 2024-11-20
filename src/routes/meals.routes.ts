import { FastifyInstance } from "fastify";
import { z } from "zod";
import { knex } from "../database";
import { randomUUID } from "crypto";

export async function mealsRoutes(app: FastifyInstance) {
  app.post("/", async (request, reply) => {
    const createMealBodySchema = z.object({
      name: z.string(),
      description: z.string(),
      date: z.string().date(),
      hour: z.string().time(),
      is_on_diet: z.boolean(),
    });
    const { session_id } = request.cookies;

    if (!session_id) {
      return reply.status(401).send({ error: "Unauthorized" });
    }

    const { name, description, date, hour, is_on_diet } =
      createMealBodySchema.parse(request.body);

    await knex("meals").insert({
      id: randomUUID(),
      name,
      description,
      date,
      hour,
      is_on_diet,
      session_id: session_id,
    });

    return reply.status(201).send({ message: "Meal created" });
  });

  app.get("/", async (request, reply) => {
    const { session_id } = request.cookies;

    if (!session_id) {
      return reply.status(401).send({ error: "Unauthorized" });
    }

    const meals = await knex("meals").where({ session_id });

    return reply.status(200).send({ meals });
  });
}
