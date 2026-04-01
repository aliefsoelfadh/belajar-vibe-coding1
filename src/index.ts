import { Elysia, t } from "elysia";
import { cors } from "@elysiajs/cors";
import { db } from "./db";
import { users } from "./db/schema";

const app = new Elysia()
    .use(cors())
    .get("/", () => ({ message: "Hello Elysia + Drizzle + Bun!" }))
    .group("/users", (app) =>
        app
            .get("/", async () => {
                return await db.select().from(users);
            })
            .post(
                "/",
                async ({ body }) => {
                    return await db.insert(users).values(body);
                },
                {
                    body: t.Object({
                        name: t.String(),
                        email: t.String(),
                    }),
                }
            )
    )
    .listen(3000);

console.log(
    `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
