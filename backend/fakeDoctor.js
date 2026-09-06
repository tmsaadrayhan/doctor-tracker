require("dotenv").config();

const { faker } = require("@faker-js/faker");
const { MongoClient, ObjectId } = require("mongodb");

const MONGO_URI = process.env.MONGO_URI;

const DB_NAME = "test";
const COLL_NAME = "doctors";

if (!MONGO_URI) {
  console.error("❌ MONGO_URI is not defined.");
  console.error("Make sure your .env file contains:");
  console.error("MONGO_URI=mongodb+srv://...");
  process.exit(1);
}

const BATCH_SIZE = 1000;
const TOTAL_DOCUMENTS = 20;

function generateDocument() {
  const now = new Date();

  return {
    _id: new ObjectId(),

    __v: faker.number.int({
      min: 0,
      max: 20,
    }),

    createdAt: faker.date.recent(),

    createdBy: new ObjectId(),

    email: faker.internet.email(),

    hospital: faker.company.name(),

    name: faker.person.fullName(),

    phone: faker.phone.number(),

    specialization: faker.person.jobTitle(),

    updatedAt: now,
  };
}

async function main() {
  const client = new MongoClient(MONGO_URI);

  try {
    console.log("Connecting to MongoDB...");

    await client.connect();

    console.log("✅ Connected to MongoDB");

    // Select database
    const db = client.db(DB_NAME);

    // Select collection
    const collection = db.collection(COLL_NAME);

    const numBatches = Math.ceil(TOTAL_DOCUMENTS / BATCH_SIZE);

    console.log("");
    console.log(`Starting mock data generation for ${DB_NAME}.${COLL_NAME}`);

    console.log(`Total documents to generate: ${TOTAL_DOCUMENTS}`);

    console.log(`Batch size: ${BATCH_SIZE}`);

    console.log("");

    const startTime = new Date();

    for (
      let batchStart = 0;
      batchStart < TOTAL_DOCUMENTS;
      batchStart += BATCH_SIZE
    ) {
      const batchEnd = Math.min(batchStart + BATCH_SIZE, TOTAL_DOCUMENTS);

      const batchSize = batchEnd - batchStart;

      console.log(
        `Generating batch ${
          Math.floor(batchStart / BATCH_SIZE) + 1
        } of ${numBatches} (${batchSize} documents)...`,
      );

      const batchDocuments = [];

      for (let i = 0; i < batchSize; i++) {
        batchDocuments.push(generateDocument());
      }

      // Insert documents
      const result = await collection.insertMany(batchDocuments);

      console.log(
        `✅ Batch inserted successfully. ${result.insertedCount} documents inserted.`,
      );
    }

    const endTime = new Date();

    const duration = ((endTime - startTime) / 1000).toFixed(2);

    console.log("");
    console.log("=================================");
    console.log("=== Mock Data Generation Complete ===");
    console.log("=================================");

    console.log(`Total time: ${duration} seconds`);

    console.log(`Collection: ${DB_NAME}.${COLL_NAME}`);

    // Check total documents
    const totalDocuments = await collection.countDocuments();

    console.log(`Documents currently in collection: ${totalDocuments}`);

    console.log("");
    console.log("✅ Done!");
  } catch (error) {
    console.error("");
    console.error("❌ Error connecting/inserting data:");
    console.error(error);
  } finally {
    await client.close();

    console.log("MongoDB connection closed.");
  }
}

main();
