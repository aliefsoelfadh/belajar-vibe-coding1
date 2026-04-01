import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "./schema";
import "dotenv/config";

const connection = await mysql.createConnection({
    host: process.env.DATABASE_HOST || "localhost",
    user: process.env.DATABASE_USER || "root",
    password: process.env.DATABASE_PASSWORD || "",
    database: process.env.DATABASE_NAME || "belajar_vibe_coding",
    port: Number(process.env.DATABASE_PORT) || 3306,
});

export const db = drizzle(connection, { schema, mode: "default" });
