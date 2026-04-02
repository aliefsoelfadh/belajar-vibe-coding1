import { describe, expect, it, beforeEach } from "bun:test";
import { app } from "../src/index";
import { clearTables } from "./utils";
import { db } from "../src/db";
import { users } from "../src/db/schema";

describe("POST /api/users/login (Login API)", () => {
    beforeEach(async () => {
        await clearTables();
        // Seed a valid user via the application routes
        await app.handle(
            new Request("http://localhost/api/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: "Test User",
                    email: "test.login@example.com",
                    password: "password123"
                })
            })
        );
    });

    it("should successfully login with valid credentials and return a session token", async () => {
        const payload = {
            email: "test.login@example.com",
            password: "password123"
        };
        const res = await app.handle(
            new Request("http://localhost/api/users/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            })
        );
        expect(res.status).toBe(200);
        const data = (await res.json()) as any;
        expect(typeof data.data).toBe("string");
    });

    it("should fail when email is not registered", async () => {
        const payload = {
            email: "not.registered@example.com",
            password: "password123"
        };
        const res = await app.handle(
            new Request("http://localhost/api/users/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            })
        );
        expect(res.status).toBe(400); // Or 401 depending on how UsersService translates it
        const data = (await res.json()) as any;
        expect(data).toHaveProperty("error");
    });

    it("should fail when password does not match", async () => {
        const payload = {
            email: "test.login@example.com",
            password: "wrongpassword!!!"
        };
        const res = await app.handle(
            new Request("http://localhost/api/users/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            })
        );
        expect(res.status).toBe(400);
        const data = (await res.json()) as any;
        expect(data).toHaveProperty("error", "Email atau password salah");
    });

    it("should fail when mandatory fields are missing", async () => {
        const res = await app.handle(
            new Request("http://localhost/api/users/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: "test.login@example.com",
                }) // password missing
            })
        );
        expect(res.status).toBe(422);
    });
});
