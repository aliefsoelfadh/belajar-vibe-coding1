import { db } from "../db";
import { users, sessions } from "../db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";

export class UsersService {
    /**
     * Mendaftarkan pengguna baru ke dalam sistem.
     * Melakukan pengecekan ketersediaan email, mengenkripsi (men-hash) password,
     * dan menyimpannya ke database.
     * 
     * @param payload Objek berisi name, email, dan password.
     * @returns String "OK" jika registrasi berhasil.
     */
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

    /**
     * Melakukan proses autentikasi pengguna (Login).
     * Memverifikasi keberadaan email dan mencocokkan password,
     * lalu men-generate token sesi baru jika proses berhasil.
     * 
     * @param payload Objek berisi email dan password.
     * @returns Token sesi (UUID string) yang dihasilkan.
     */
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

    /**
     * Mengambil data profil/informasi pengguna yang sedang aktif (Current User).
     * Mengecek validitas token sesi di database dan mengembalikan detail pengguna.
     * 
     * @param token Token sesi yang didapatkan saat login.
     * @returns Objek balikan berupa data pengguna (id, name, email, createdAt).
     */
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

    /**
     * Mengakhiri sesi aktif pengguna (Logout).
     * Menghapus record token sesi dari database sehingga token tersebut tidak bisa digunakan lagi.
     * 
     * @param token Token sesi dari pengguna yang ingin dilogout.
     * @returns String "OK" jika logout berhasil.
     */
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
