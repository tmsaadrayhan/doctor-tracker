// Mock Data Generator Script
// Document count: 20

const { faker } = require("@faker-js/faker");

// Database and collection configuration - edit these to target a different location
const DB_NAME = "test";
const COLL_NAME = "doctors";

// Connect to database
use(DB_NAME);

// Document generation function
function generateDocument() {
  return {
    _id: new ObjectId(),
    __v: faker.number.int({ min: 0, max: 20 }),
    createdAt: faker.date.recent(),
    createdBy: new ObjectId(),
    email: faker.internet.email(),
    hospital: faker.company.name(),
    name: faker.person.fullName(),
    phone: faker.phone.number(),
    specialization: faker.person.jobTitle(),
    updatedAt: faker.date.recent(),
  };
}

const BATCH_SIZE = 1000; // Number of documents to insert per batch
const TOTAL_DOCUMENTS = 20;
const numBatches = Math.ceil(TOTAL_DOCUMENTS / BATCH_SIZE);

console.log(`Starting mock data generation for ${DB_NAME}.${COLL_NAME}`);
console.log(`Total documents to generate: ${TOTAL_DOCUMENTS} documents`);
console.log(`Batch size: ${BATCH_SIZE} documents per batch`);

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

  // Generate documents for this batch
  const batchDocuments = [];
  for (let i = 0; i < batchSize; i++) {
    batchDocuments.push(generateDocument());
  }

  // Insert the batch
  db.getCollection(COLL_NAME).insertMany(batchDocuments);

  console.log(`Batch inserted successfully.`);
}

const endTime = new Date();
const duration = ((endTime - startTime) / 1000).toFixed(2);

console.log(`\n=== Mock Data Generation Complete ===`);
console.log(`Total time: ${duration} seconds`);
console.log(`Collection: ${DB_NAME}.${COLL_NAME}`);
