import { db } from "../db";
import { users, sessions } from "../db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";

export class UsersService {
    static async registerUser(payload: any) {
        const { name, email, password } = payload;

        // Check if email already exists
        const existingUser = await db.query.users.findFirst({
            where: eq(users.email, email),
        });

        if (existingUser) {
            throw new Error("Email sudah terdaftar");
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert user into database
        await db.insert(users).values({
            name,
            email,
            password: hashedPassword,
        });

        return "OK";
    }

    static async loginUser(payload: any) {
        const { email, password } = payload;

        const user = await db.query.users.findFirst({
            where: eq(users.email, email),
        });

        if (!user) {
            throw new Error("Email atau password salah");
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            throw new Error("Email atau password salah");
        }

        const token = uuidv4();

        await db.insert(sessions).values({
            token,
            userId: user.id,
        });

        return token;
    }

    static async getCurrent(token: string) {
        const session = await db.query.sessions.findFirst({
            where: eq(sessions.token, token),
        });

        if (!session || !session.userId) {
            throw new Error("Unauthorized");
        }

        const user = await db.query.users.findFirst({
            where: eq(users.id, session.userId),
            columns: {
                id: true,
                name: true,
                email: true,
                createdAt: true,
            },
        });

        if (!user) {
            throw new Error("Unauthorized");
        }

        return user;
    }

    static async logoutUser(token: string) {
        const result = await db.delete(sessions).where(eq(sessions.token, token));

        // In mysql2, result is an array where the first element contains info about affected rows
        // However, drizzle's delete in mysql returns a ResultSetHeader in many cases.
        // Let's assume unauthorized if nothing was deleted.
        if (result[0].affectedRows === 0) {
            throw new Error("Unauthorized");
        }

        return "OK";
    }
}
