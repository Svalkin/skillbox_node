const { MongoClient } = require("mongodb");

let client;
let db;

async function connect() {
  if (client) return db;

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is not set");
  }

  client = new MongoClient(uri);

  try {
    await client.connect();
    db = client.db();
    console.log("✅ Connected to MongoDB");
    return db;
  } catch (err) {
    console.error("❌ Failed to connect to MongoDB", err);
    throw err;
  }
}

module.exports = { connect, getDb: () => db };
