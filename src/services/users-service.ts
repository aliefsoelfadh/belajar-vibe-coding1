import { db } from "../db";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";

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
}
