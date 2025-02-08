import { config } from "dotenv";
import { resolve } from "path";
import { MeiliSearch } from "meilisearch";
import b38Data from "../lib/bmw/engines/b38.json";

// Load .env.local
config({ path: resolve(process.cwd(), ".env.local") });

const client = new MeiliSearch({
  host: process.env.MEILISEARCH_HOST || "http://localhost:7700",
  apiKey: process.env.MEILISEARCH_MASTER_KEY,
});

async function testMeilisearch() {
  console.log("Testing Meilisearch connection...");

  try {
    // Format the data
    const documents = b38Data.data.map((engine, index) => ({
      id: index + 1,
      engine_code: engine.engine_code,
      displacement: engine.displacement,
      power: engine.power,
      torque: engine.torque,
      years: engine.years,
      class_name: "B38",
    }));

    // Create index first
    console.log("Creating index...");
    await client.createIndex("test_engines", { primaryKey: "id" });

    // Wait for index creation
    console.log("Waiting for index creation...");
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Add documents
    console.log("Adding documents...");
    await client.index("test_engines").addDocuments(documents);

    // Wait for indexing
    console.log("Waiting for indexing...");
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Test search
    console.log("Testing search...");
    const searchResult = await client.index("test_engines").search("B38");
    console.log("Search results:", searchResult);
  } catch (error) {
    console.error("Meilisearch error:", error);
  }
}

testMeilisearch()
  .then(() => console.log("Test completed"))
  .catch(console.error);
