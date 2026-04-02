import { describe, expect, it, beforeEach } from "bun:test";
import { app } from "../src/index";
import { clearTables } from "./utils";

describe("GET /api/users/current (Get Current User API)", () => {
    let validToken: string;

    beforeEach(async () => {
        await clearTables();
        // 1. Seed user
        await app.handle(
            new Request("http://localhost/api/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: "Current User",
                    email: "current@example.com",
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
                    email: "current@example.com",
                    password: "password123"
                })
            })
        );

        const loginData = (await loginRes.json()) as any;
        validToken = loginData.data;
    });

    it("should return user details when valid Bearer token is provided", async () => {
        const res = await app.handle(
            new Request("http://localhost/api/users/current", {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${validToken}`
                }
            })
        );
        expect(res.status).toBe(200);
        const json = (await res.json()) as any;
        expect(json).toHaveProperty("data");
        expect(json.data.email).toBe("current@example.com");
        expect(json.data.name).toBe("Current User");
        expect(json.data).not.toHaveProperty("password"); // Secure
    });

    it("should fail when Authorization header is missing entirely", async () => {
        const res = await app.handle(
            new Request("http://localhost/api/users/current", {
                method: "GET"
            })
        );
        expect(res.status).toBe(401);
        const json = (await res.json()) as any;
        expect(json).toHaveProperty("error", "Unauthorized");
    });

    it("should fail when an invalid or modified token is provided", async () => {
        const res = await app.handle(
            new Request("http://localhost/api/users/current", {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${validToken}manipulated`
                }
            })
        );
        // Depending on service logic, this might be 401 or 404
        const json = (await res.json()) as any;
        expect(json).toHaveProperty("error");
    });
});
