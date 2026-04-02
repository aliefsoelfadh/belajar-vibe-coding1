const longName = "A".repeat(300);

async function testRegistration() {
    try {
        const response = await fetch("http://localhost:3000/api/users", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name: longName,
                email: "test_longname@example.com",
                password: "rahasia"
            })
        });

        const status = response.status;
        const text = await response.text();
        console.log(`HTTP Status: ${status}`);
        console.log(`Response: ${text}`);

    } catch (e) {
        console.error("Connection failed:", e);
    }
}

testRegistration();
