import { describe, expect, it, beforeEach } from "bun:test";
import { app } from "../src/index";
import { clearTables } from "./utils";
import { db } from "../src/db";
import { users } from "../src/db/schema";
import { eq } from "drizzle-orm";

describe("POST /api/users (Registration API)", () => {
    beforeEach(async () => {
        await clearTables();
    });

    it("should successfully register a valid new user", async () => {
        const payload = {
            name: "John Doe",
            email: "john@example.com",
            password: "password123"
        };
        const res = await app.handle(
            new Request("http://localhost/api/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            })
        );
        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data).toHaveProperty("data", "OK");

        // Verify in DB
        const user = await db.query.users.findFirst({
            where: eq(users.email, payload.email)
        });
        expect(user).toBeDefined();
        expect(user?.name).toBe(payload.name);
    });

    it("should fail when mandatory fields are missing", async () => {
        const res = await app.handle(
            new Request("http://localhost/api/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: "invalid@example.com" }) // missing name & password
            })
        );
        expect(res.status).toBe(422);
    });

    it("should fail on invalid email format", async () => {
        const res = await app.handle(
            new Request("http://localhost/api/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: "John",
                    email: "not-an-email",
                    password: "pass"
                })
            })
        );
        expect(res.status).toBe(422);
    });

    it("should fail when name is longer than 255 characters", async () => {
        const res = await app.handle(
            new Request("http://localhost/api/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: "A".repeat(300),
                    email: "long@example.com",
                    password: "pass"
                })
            })
        );
        expect(res.status).toBe(422);
    });

    it("should fail when email is already registered", async () => {
        const payload = {
            name: "Jane Doe",
            email: "jane@example.com",
            password: "password123"
        };
        // Insert first time
        await app.handle(
            new Request("http://localhost/api/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            })
        );

        // Attempt second insert with same email
        const res = await app.handle(
            new Request("http://localhost/api/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            })
        );
        expect(res.status).toBe(400);
        const data = (await res.json()) as any;
        expect(data).toHaveProperty("error");
    });
});
