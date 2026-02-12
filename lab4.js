/**
 * Lab 4 — Async Data Fetching Demo
 */

const axios = require('axios');
const Joi = require('joi');

console.log("Lab 4 - Async Operations");
console.log("Node version:", process.version);
console.log("Axios loaded");
console.log("Joi loaded");
console.log("Ready to start!");


// =====================================================
// Exercise 1: Understanding Promises
// =====================================================
console.log("\n=== Exercise 1: Promises ===");

// Function 1: Simulate delay
function simulateDelay(ms) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(`Waited ${ms}ms`);
        }, ms);
    });
}

// Function 2: Fetch user data (simulate async operation)
function fetchUserData(userId) {
    return new Promise((resolve, reject) => {

        // validation
        if (typeof userId !== "number") {
            reject("Invalid userId — must be a number");
            return;
        }

        setTimeout(() => {
            const user = {
                id: userId,
                name: `User ${userId}`,
                email: `user${userId}@example.com`
            };
            resolve(user);
        }, 1000);
    });
}

// Tests
simulateDelay(500).then(result => {
    console.log(result);
});

console.log("Fetching user data...");

fetchUserData(1)
    .then(user => {
        console.log("User fetched:", user);
    })
    .catch(error => {
        console.log("Error:", error);
    });

fetchUserData("invalid")
    .then(user => console.log(user))
    .catch(error => console.log("✓ Caught error:", error));



// =====================================================
// Exercise 2: Async/Await
// =====================================================
console.log("\n=== Exercise 2: Async/Await ===");

// Helper function to simulate fetching posts
function fetchUserPosts(userId) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve([
                { id: 1, title: `Post 1 by User ${userId}` },
                { id: 2, title: `Post 2 by User ${userId}` }
            ]);
        }, 500);
    });
}

// async function getUserWithPosts
async function getUserWithPosts(userId) {
    try {
        const user = await fetchUserData(userId);
        const posts = await fetchUserPosts(userId);

        return { user, posts };

    } catch (error) {
        console.log("Error fetching user with posts:", error);
        throw error;
    }
}

// async function fetchMultipleUsers
async function fetchMultipleUsers(userIds) {
    try {
        const promises = userIds.map(id => fetchUserData(id));
        const users = await Promise.all(promises);
        return users;

    } catch (error) {
        console.log("Error fetching multiple users:", error);
        throw error;
    }
}

// Test functions
async function testAsyncFunctions() {
    console.log("Testing getUserWithPosts...");
    const data = await getUserWithPosts(2);
    console.log(data);

    console.log("\nTesting fetchMultipleUsers...");
    const users = await fetchMultipleUsers([1, 2, 3]);
    console.log(users);
}

testAsyncFunctions();



// =====================================================
// Exercise 3: HTTP Requests with Axios
// =====================================================
console.log("\n=== Exercise 3: HTTP Requests ===");

// Function 1: Fetch all users
async function fetchAllUsers() {
    try {
        const response = await axios.get(
            "https://jsonplaceholder.typicode.com/users"
        );

        console.log(`Fetched ${response.data.length} users`);
        return response.data;

    } catch (error) {
        console.log("Error fetching users:", error.message);
    }
}

// Function 2: Fetch user by ID
async function fetchUserById(id) {
    try {
        const response = await axios.get(
            `https://jsonplaceholder.typicode.com/users/${id}`
        );

        console.log("User:", response.data.name);
        console.log("Email:", response.data.email);

        return response.data;

    } catch (error) {
        console.log(`Error fetching user ${id}:`, error.message);
    }
}

// Function 3: Fetch random users
async function fetchRandomUsers(count) {
    try {
        const response = await axios.get(
            `https://randomuser.me/api/?results=${count}`
        );

        const users = response.data.results;

        users.forEach(user => {
            console.log(
                `${user.name.first} ${user.name.last} — ${user.location.country}`
            );
        });

        return users;

    } catch (error) {
        console.log("Error fetching random users:", error.message);
    }
}

// Test HTTP functions
async function testHttpRequests() {
    console.log("1. Fetching all users...");
    await fetchAllUsers();

    console.log("\n2. Fetching user by ID (5)...");
    await fetchUserById(5);

    console.log("\n3. Fetching 3 random users...");
    await fetchRandomUsers(3);
}

testHttpRequests();



// =====================================================
// Exercise 4: Professional Error Handling
// =====================================================
console.log("\n=== Exercise 4: Error Handling ===");

// Fetch with retry
async function fetchWithRetry(url, maxRetries = 3) {
    let lastError;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {

        try {
            console.log(`Attempt ${attempt}/${maxRetries} for ${url}`);

            const response = await axios.get(url);
            return response.data;

        } catch (error) {
            lastError = error;
            console.log(`Attempt ${attempt} failed:`, error.message);

            if (attempt < maxRetries) {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
    }

    throw new Error(`Failed after ${maxRetries} attempts: ${lastError.message}`);
}


// Fetch multiple endpoints
async function fetchMultipleEndpoints(urls) {

    const promises = urls.map(url => axios.get(url));
    const settledResults = await Promise.allSettled(promises);

    const results = {
        successful: [],
        failed: []
    };

    settledResults.forEach((result, index) => {

        if (result.status === "fulfilled") {
            console.log(`✓ Success: ${urls[index]}`);
            results.successful.push(result.value.data);
        } else {
            console.log(`✗ Failed: ${urls[index]}`);
            results.failed.push({
                url: urls[index],
                error: result.reason.message
            });
        }
    });

    return results;
}


// Test error handling
async function testErrorHandling() {

    console.log("1. Testing retry with invalid URL...");

    try {
        await fetchWithRetry("https://invalid-url-12345.com/api", 3);
    } catch (error) {
        console.log("✓ Caught error:", error.message);
    }

    console.log("\n2. Testing multiple endpoints...");

    const urls = [
        "https://jsonplaceholder.typicode.com/users/1",
        "https://invalid-url-xyz.com/api",
        "https://jsonplaceholder.typicode.com/posts/1"
    ];

    const results = await fetchMultipleEndpoints(urls);

    console.log("\nResults summary:");
    console.log(`✓ Successful: ${results.successful.length}`);
    console.log(`✗ Failed: ${results.failed.length}`);
}

testErrorHandling();
