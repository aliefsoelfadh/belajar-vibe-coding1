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
    );
