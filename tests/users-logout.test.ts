import { describe, expect, it, beforeEach } from "bun:test";
import { app } from "../src/index";
import { clearTables } from "./utils";
import { db } from "../src/db";
import { sessions } from "../src/db/schema";
import { eq } from "drizzle-orm";

describe("DELETE /api/users/logout (Logout API)", () => {
    let validToken: string;

    beforeEach(async () => {
        await clearTables();
        // 1. Seed user
        await app.handle(
            new Request("http://localhost/api/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: "Logout User",
                    email: "logout@example.com",
                    password: "password123"
                })
            })
        );

        // 2. Login to acquire active session token
        const loginRes = await app.handle(
            new Request("http://localhost/api/users/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: "logout@example.com",
                    password: "password123"
                })
            })
        );

        const loginData = (await loginRes.json()) as any;
        validToken = loginData.data;
    });

    it("should successfully logout and invalidate the active session token", async () => {
        const res = await app.handle(
            new Request("http://localhost/api/users/logout", {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${validToken}`
                }
            })
        );
        expect(res.status).toBe(200);
        const json = (await res.json()) as any;
        expect(json).toHaveProperty("data", "OK");

        // Verify the token is removed from database
        const remainingSession = await db.query.sessions.findFirst({
            where: eq(sessions.token, validToken)
        });
        expect(remainingSession).toBeUndefined(); // Assuming Drizzle returns undefined
    });

    it("should fail to logout when Authorization header is missing", async () => {
        const res = await app.handle(
            new Request("http://localhost/api/users/logout", {
                method: "DELETE"
            })
        );
        expect(res.status).toBe(401);
        const json = (await res.json()) as any;
        expect(json).toHaveProperty("error", "Unauthorized");
    });

    it("should fail when attempting to logout with an invalid token", async () => {
        const res = await app.handle(
            new Request("http://localhost/api/users/logout", {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${validToken}-invalid`
                }
            })
        );
        // Depending on service logic, whether it enforces exact failure or just 0 rows deleted
        const json = (await res.json()) as any;
        expect(json).toHaveProperty("error");
    });
});
