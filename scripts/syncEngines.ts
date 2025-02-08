import { config } from "dotenv";
import { resolve } from "path";
import { MeiliSearch } from "meilisearch";
import { createClient } from "@supabase/supabase-js";

// Load .env.local first
config({ path: resolve(process.cwd(), ".env.local") });

// Initialize clients
const meilisearch = new MeiliSearch({
  host: process.env.MEILISEARCH_HOST || "http://localhost:7700",
  apiKey: process.env.MEILISEARCH_MASTER_KEY,
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function syncEnginesAndClasses() {
  console.log("Starting sync...");

  try {
    // Sync Engines
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
          torque
        )
      `);

    if (enginesError) throw enginesError;

    // Sync Engine Classes
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

    // Create and populate engines index
    console.log("Creating engines index...");
    await meilisearch.createIndex("engines", { primaryKey: "id" });
    await meilisearch.index("engines").addDocuments(engineDocuments);

    // Create and populate classes index
    console.log("Creating engine classes index...");
    await meilisearch.createIndex("engine_classes", { primaryKey: "id" });
    await meilisearch.index("engine_classes").addDocuments(classDocuments);

    console.log("Sync completed successfully");
  } catch (error) {
    console.error("Sync failed:", error);
  }
}

syncEnginesAndClasses();
