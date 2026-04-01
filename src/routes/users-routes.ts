import { Elysia, t } from "elysia";
import { UsersService } from "../services/users-service";

export const usersRoutes = new Elysia({ prefix: "/api/users" })
    .post(
        "/",
        async ({ body, set }) => {
            try {
                const data = await UsersService.registerUser(body);
                return { data };
            } catch (error: any) {
                set.status = 400;
                return { error: error.message };
            }
        },
        {
            body: t.Object({
                name: t.String(),
                email: t.String({ format: "email" }),
                password: t.String(),
            }),
        }
    )
    .post(
        "/login",
        async ({ body, set }) => {
            try {
                const data = await UsersService.loginUser(body);
                return { data };
            } catch (error: any) {
                set.status = 400;
                return { error: error.message };
            }
        },
        {
            body: t.Object({
                email: t.String({ format: "email" }),
                password: t.String(),
            }),
        }
    )
    .get("/current", async ({ headers, set }) => {
        try {
            const authorization = headers.authorization;
            if (!authorization || !authorization.startsWith("Bearer ")) {
                throw new Error("Unauthorized");
            }

            const token = authorization.split(" ")[1];
            if (!token) {
                throw new Error("Unauthorized");
            }

            const data = await UsersService.getCurrent(token);
            return { data };
        } catch (error: any) {
            set.status = 401;
            return { error: error.message };
        }
    });
