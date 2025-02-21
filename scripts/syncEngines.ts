import { config } from "dotenv";
import { resolve } from "path";
import { MeiliSearch } from "meilisearch";
import { createClient } from "@supabase/supabase-js";

// Load .env.local first
config({ path: resolve(process.cwd(), ".env.local") });

const MEILISEARCH_URL = "https://meilisearch-demo.jdawg.xyz";

console.log("Connecting to Meilisearch at:", MEILISEARCH_URL);

const meilisearch = new MeiliSearch({
  host: MEILISEARCH_URL,
  apiKey: process.env.NEXT_PUBLIC_MEILISEARCH_KEY,
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Test connection before proceeding
async function testConnection() {
  try {
    const health = await meilisearch.health();
    console.log("Meilisearch connection test:", health);
    return true;
  } catch (error) {
    console.error("Meilisearch connection failed:", error);
    return false;
  }
}

async function syncEnginesAndClasses() {
  if (!testConnection()) {
    console.error("Meilisearch connection failed. Exiting.");
    process.exit(1);
  }

  console.log(
    "Starting sync with Meilisearch at:",
    process.env.NEXT_PUBLIC_MEILISEARCH_URL
  );

  try {
    // Fetch engines with their configurations
    const { data: engines, error: enginesError } = await supabase.from(
      "engines"
    ).select(`
        id,
        engine_code,
        class_id,
        notes,
        image_path,
        engine_configurations (
          power,
          torque,
          displacement,
          years
        )
      `);

    if (enginesError) throw enginesError;

    // Fetch engine classes
    const { data: classes, error: classesError } = await supabase.from(
      "engine_classes"
    ).select(`
        id,
        model,
        summary,
        image_path,
        fuel_type,
        wikipedia_url
      `);

    if (classesError) throw classesError;

    console.log(
      `Fetched ${engines?.length || 0} engines and ${
        classes?.length || 0
      } classes`
    );

    // Format engines for Meilisearch
    const engineDocuments =
      engines?.map((engine) => ({
        id: engine.id,
        engine_code: engine.engine_code,
        class_id: engine.class_id,
        notes: engine.notes,
        image_path: engine.image_path,
        power: engine.engine_configurations?.[0]?.power,
        torque: engine.engine_configurations?.[0]?.torque,
        displacement: engine.engine_configurations?.[0]?.displacement,
        years: engine.engine_configurations?.[0]?.years,
      })) || [];

    // Format classes for Meilisearch
    const classDocuments =
      classes?.map((engineClass) => ({
        id: engineClass.id,
        model: engineClass.model,
        summary: engineClass.summary,
        image_path: engineClass.image_path,
        fuel_type: engineClass.fuel_type,
        wikipedia_url: engineClass.wikipedia_url,
      })) || [];

    // Delete existing indices if they exist
    try {
      await meilisearch.deleteIndex("engines");
      await meilisearch.deleteIndex("engine_classes");
      console.log("Deleted existing indices");
    } catch (error) {
      console.log("No existing indices to delete", error);
    }

    // Create and populate engines index
    console.log("Creating engines index...");
    await meilisearch.createIndex("engines", { primaryKey: "id" });
    await meilisearch.index("engines").addDocuments(engineDocuments);
    console.log(`Added ${engineDocuments.length} engine documents`);

    // Create and populate classes index
    console.log("Creating engine classes index...");
    await meilisearch.createIndex("engine_classes", { primaryKey: "id" });
    await meilisearch.index("engine_classes").addDocuments(classDocuments);
    console.log(`Added ${classDocuments.length} class documents`);

    console.log("Sync completed successfully");
  } catch (error) {
    console.error("Sync failed:", error);
    throw error;
  }
}

syncEnginesAndClasses().catch(console.error);
