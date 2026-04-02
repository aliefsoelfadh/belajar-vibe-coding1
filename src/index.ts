import { Elysia, t } from "elysia";
import { cors } from "@elysiajs/cors";
import { db } from "./db";
import { users } from "./db/schema";
import { usersRoutes } from "./routes/users-routes";

export const app = new Elysia()
    .use(cors())
    .use(usersRoutes)
    .get("/", () => ({ message: "Hello Elysia + Drizzle + Bun!" }))
    .listen(3000);

console.log(
    `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
