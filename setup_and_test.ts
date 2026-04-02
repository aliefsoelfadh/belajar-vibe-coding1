import mysql from "mysql2/promise";
import { execSync } from "child_process";

async function main() {
    try {
        console.log("Creating database if not exists...");
        const conn = await mysql.createConnection("mysql://root@localhost:3306");
        await conn.query("CREATE DATABASE IF NOT EXISTS belajar_vibe_coding1;");
        await conn.end();

        console.log("Pushing schema with Drizzle Kit...");
        execSync("bun x drizzle-kit push", { stdio: "inherit" });

        console.log("Starting server in background...");
        // Start server as child process
        const server = require("child_process").spawn("bun", ["run", "src/index.ts"], {
            stdio: "ignore",
            detached: true
        });
        server.unref();

        // wait 2 seconds for server to bind
        await new Promise(r => setTimeout(r, 2000));

        console.log("Running registration test with 300 character name...");
        const longName = "A".repeat(300);
        const response = await fetch("http://localhost:3000/api/users", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name: longName,
                email: "test.oversized@example.com",
                password: "rahasia"
            })
        });

        const status = response.status;
        const text = await response.text();
        console.log(`\n--- TEST RESULT ---`);
        console.log(`HTTP Status: ${status}`);
        console.log(`Response: ${text}`);

        // kill server
        if (server.pid) {
            process.kill(server.pid);
        }

    } catch (e: any) {
        console.log("Error during setup/test:", e.message);
    }
}

main();
