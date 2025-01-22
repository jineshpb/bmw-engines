import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import supabase from "@/lib/supabaseClient";
import { CarPayload, CarGeneration, GenerationSyncResult } from "@/types/cars";

import { cleanImageUrl } from "@/lib/utils/cars/imageUtils";
import { handleImage } from "@/lib/utils/cars/imageUtils";
import { parseModelYear } from "@/lib/utils/cars/parser";
import { extractChassisCode } from "@/lib/utils/cars/parser";
import { extractEngineCode } from "@/lib/utils/cars/engineUtils";

interface SyncResult {
  file: string;
  status: "success" | "error";
  model?: string;
  generations?: {
    name: string;
    chassis_code: string;
    status: "success" | "error";
    engines_processed?: number;
    error?: string;
  }[];
  error?: string;
}

export async function POST() {
  try {
    const carsDir = path.join(process.cwd(), "lib", "bmw", "cars");
    const files = await fs.readdir(carsDir);
    const results: SyncResult[] = [];

    // Get BMW make_id
    const { data: makeData, error: makeError } = await supabase
      .from("car_makes")
      .select("id")
      .eq("name", "BMW")
      .single();

    if (makeError) {
      return NextResponse.json(
        { message: "Make BMW not found", error: makeError.message },
        { status: 404 }
      );
    }

    for (const file of files) {
      if (!file.endsWith(".json")) continue;

      try {
        const content = await fs.readFile(path.join(carsDir, file), "utf-8");
        const payload: CarPayload = JSON.parse(content);

        // Handle car model image
        let modelImagePath = null;
        if (payload.image_path) {
          console.log("Processing image for:", payload.model);
          const cleanedUrl = cleanImageUrl(payload.image_path);
          console.log("Cleaned URL:", cleanedUrl);

          if (cleanedUrl) {
            modelImagePath = await handleImage(
              cleanedUrl,
              payload.make,
              payload.model
            );
            console.log("Received image path:", modelImagePath);
          }
        }

        // Create/Update car model
        const { data: modelData, error: modelError } = await supabase
          .from("car_models")
          .upsert(
            {
              name: payload.model,
              make_id: makeData.id,
              model_year: payload.model_year,
              summary: payload.summary,
              image_path: modelImagePath,
            },
            {
              onConflict: "make_id,name",
            }
          )
          .select()
          .single();

        if (modelError) throw modelError;

        // Process generations
        const generationResults: GenerationSyncResult[] = [];
        for (const gen of payload.data.models) {
          const processedEngines = new Set<string>();
          let chassisCode: string | null = null;

          try {
            chassisCode = extractChassisCode(gen.model);
            if (!chassisCode) {
              console.warn(
                `Warning: No chassis code found for generation: ${gen.model}`
              );
              continue;
            }

            // Create/update generation
            const { data: genData, error: genError } = await supabase
              .from("car_generations")
              .upsert(
                {
                  name: gen.model,
                  model_id: modelData.id,
                  chassis_code: [chassisCode],
                  ...parseModelYear(gen.model_year),
                  image_path: gen.image_path,
                } as CarGeneration,
                {
                  onConflict: "model_id,name,start_year",
                }
              )
              .select()
              .single();

            if (genError) {
              console.error("Generation creation error:", {
                error: genError,
                data: {
                  name: gen.model,
                  model_id: modelData.id,
                  chassis_code: chassisCode,
                  ...parseModelYear(gen.model_year),
                },
              });
              continue;
            }

            console.log("Generation created:", genData);

            // Process each engine in engine_details array
            for (const engineDetail of gen.engine_details) {
              try {
                const engineCode = extractEngineCode(engineDetail.engine);
                if (!engineCode) {
                  console.warn(
                    `No engine code found for engine: ${engineDetail.engine}`
                  );
                  continue;
                }

                // Look up the specific engine by engine_code
                const { data: engine, error: engineError } = await supabase
                  .from("engines")
                  .select("id, engine_code, class_id")
                  .eq("engine_code", engineCode)
                  .single();

                if (engineError || !engine) {
                  console.warn(`Engine not found for code: ${engineCode}`);
                  continue;
                }

                console.log(`Found engine for ${engineCode}:`, engine);

                // Create the junction record using the engine's class_id
                const { error: junctionError } = await supabase
                  .from("car_generation_engine_classes")
                  .upsert(
                    {
                      generation_id: genData.id,
                      engine_class_id: engine.class_id,
                    },
                    {
                      onConflict: "generation_id,engine_class_id",
                    }
                  );

                if (junctionError) {
                  console.warn(
                    "Failed to create engine mapping:",
                    junctionError
                  );
                } else {
                  processedEngines.add(engineCode);
                }
              } catch (engineError) {
                console.warn("Engine processing failed:", engineError);
              }
            }

            generationResults.push({
              name: gen.model,
              chassis_code: chassisCode,
              status: "success",
              engines_processed: processedEngines.size,
            });
          } catch (error) {
            console.warn("Warning: Generation processing failed:", {
              generation: gen.model,
              error: error,
            });
            generationResults.push({
              name: gen.model,
              chassis_code: chassisCode || "",
              status: "error",
              error: (error as Error).message,
            });
          }
        }

        results.push({
          file,
          status: "success",
          model: payload.model,
          generations: generationResults,
        });
      } catch (error) {
        results.push({
          file,
          status: "error",
          error: (error as Error).message,
        });
      }
    }

    return NextResponse.json({
      message: "Database sync completed",
      results,
    });
  } catch (error) {
    console.error("Sync failed:", error);
    return NextResponse.json(
      { message: "Sync failed", error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ message: "Use POST to sync" }, { status: 405 });
}
