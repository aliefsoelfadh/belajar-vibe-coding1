import mysql from "mysql2/promise";

async function check() {
    try {
        const conn = await mysql.createConnection("mysql://root@localhost:3306/belajar_vibe_coding1");
        console.log("Connection successful! Checking tables...");
        const [rows] = await conn.query("SHOW TABLES;");
        console.log("Tables:", rows);
        await conn.end();
    } catch (e: any) {
        console.log("Error connecting to DB:", e.message);
    }
}
check();
