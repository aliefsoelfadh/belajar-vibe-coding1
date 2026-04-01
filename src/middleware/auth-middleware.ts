import { Elysia } from "elysia";

export const authMiddleware = (app: Elysia) =>
    app.derive(({ headers }) => {
        const getBearerToken = () => {
            const authorization = headers.authorization;
            if (!authorization || !authorization.startsWith("Bearer ")) {
                return null;
            }
            return authorization.split(" ")[1] || null;
        };

        return {
            token: getBearerToken(),
        };
    });
