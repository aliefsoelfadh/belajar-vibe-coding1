import { Elysia, t } from "elysia";
import { UsersService } from "../services/users-service";
import { authMiddleware } from "../middleware/auth-middleware";

export const usersRoutes = new Elysia({ prefix: "/api/users" })
    .use(authMiddleware)
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
    .get("/current", async ({ token, set }) => {
        try {
            if (!token) {
                throw new Error("Unauthorized");
            }

            const data = await UsersService.getCurrent(token);
            return { data };
        } catch (error: any) {
            set.status = 401;
            return { error: error.message };
        }
    })
    .delete("/logout", async ({ token, set }) => {
        try {
            if (!token) {
                throw new Error("Unauthorized");
            }

            const data = await UsersService.logoutUser(token);
            return { data };
        } catch (error: any) {
            set.status = 401;
            return { error: error.message };
        }
    });
