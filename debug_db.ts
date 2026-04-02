import { db } from "./src/db";
import { eq } from "drizzle-orm";
import { users } from "./src/db/schema";

async function runDebug() {
    try {
        console.log("Attempting query...");
        await db.query.users.findFirst({
            where: eq(users.email, "test@example.com"),
        });
        console.log("Query succeeded!");
    } catch (e: any) {
        console.log("Error Name:", e.name);
        console.log("Error Message:", e.message);
        console.log("Error Cause:", e.cause || e);
    } finally {
        process.exit();
    }
}
runDebug();
