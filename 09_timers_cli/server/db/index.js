const { MongoClient } = require("mongodb");

let client;
let db;

async function connect() {
  if (client) return db;

  const uri = process.env.MONGODB_URI;
  client = new MongoClient(uri);

  try {
    await client.connect();
    db = client.db();
    console.log("✅ Connected to MongoDB");
    return db;
  } catch (err) {
    console.error("❌ Failed to connect to MongoDB", err);
    process.exit(1);
  }
}

module.exports = { connect, getDb: () => db };