import { FastifyInstance } from "fastify";
import { z } from "zod";
import { knex } from "../database";
import { randomUUID } from "crypto";
import { checkSessionIdExists } from "../middlewares/check-if-session-id-exists";

export async function mealsRoutes(app: FastifyInstance) {
  app.post(
    "/",
    {
      preHandler: [checkSessionIdExists],
    },
    async (request, reply) => {
      const createMealBodySchema = z.object({
        name: z.string(),
        description: z.string(),
        date: z.string().date(),
        hour: z.string().time(),
        is_on_diet: z.boolean(),
      });
      const { session_id } = request.cookies;

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
    }
  );

  app.get(
    "/",
    {
      preHandler: [checkSessionIdExists],
    },
    async (request, reply) => {
      const { session_id } = request.cookies;

      const meals = await knex("meals").where({ session_id });

      return reply.status(200).send({ meals });
    }
  );

  app.get("/:id", async (request, reply) => {
    const getMealParamsSchema = z.object({
      id: z.string().uuid(),
    });

    const { id } = getMealParamsSchema.parse(request.params);
    const { session_id } = request.cookies;

    const meal = await knex("meals").where({ id, session_id }).first();

    return reply.status(200).send({ meal });
  });

  app.delete(
    "/:id",
    {
      preHandler: [checkSessionIdExists],
    },
    async (request, reply) => {
      const deleteMealParamsSchema = z.object({
        id: z.string().uuid(),
      });

      const { id } = deleteMealParamsSchema.parse(request.params);
      const { session_id } = request.cookies;

      const existsMeal = await knex("meals").where({ id, session_id }).first();

      if (!existsMeal) {
        return reply.status(404).send({ error: "Meal not found." });
      }

      await knex("meals").where({ id, session_id }).delete();

      return reply.status(204).send();
    }
  );

  app.put(
    "/:id",
    {
      preHandler: [checkSessionIdExists],
    },
    async (request, reply) => {
      const updateMealParamsSchema = z.object({
        id: z.string().uuid(),
      });

      const { id } = updateMealParamsSchema.parse(request.params);
      const { session_id } = request.cookies;

      const existsMeal = await knex("meals").where({ id, session_id }).first();

      if (!existsMeal) {
        return reply.status(404).send({ error: "Meal not found." });
      }

      const updateMealBodySchema = z.object({
        name: z.string().default(existsMeal.name),
        description: z.string().default(existsMeal.description),
        date: z.string().date().default(existsMeal.date),
        hour: z.string().time().default(existsMeal.hour),
        is_on_diet: z.number().default(existsMeal.is_on_diet),
      });

      const { name, description, date, hour, is_on_diet } =
        updateMealBodySchema.parse(request.body);

      await knex("meals").where({ id, session_id }).update({
        name,
        description,
        date,
        hour,
        is_on_diet,
      });

      return reply.status(204).send();
    }
  );
}
