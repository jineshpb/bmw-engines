import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import supabase from "@/lib/supabaseClient";
import {
  CarPayload,
  CarGeneration,
  GenerationSyncResult,
  EngineDetail,
} from "@/types/cars";

import { cleanImageUrl } from "@/lib/utils/cars/imageUtils";
import { handleImage } from "@/lib/utils/cars/imageUtils";
import { parseModelYear } from "@/lib/utils/cars/parser";
import { extractChassisCode } from "@/lib/utils/cars/parser";

import { extractBMWEngineCode } from "@/lib/utils/cars/engineCodePars";
import { isValidBMWEngineCode } from "@/lib/utils/cars/engineCodePars";

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

async function processEngineDetails(
  engineDetail: EngineDetail,
  genData: { id: string }
) {
  try {
    const { code: engineCode, engineFamily } = extractBMWEngineCode(
      engineDetail.engine
    );
    const engineData = {
      power: engineDetail.power,
      torque: engineDetail.torque,
      displacement: extractDisplacement(engineDetail.engine),
      years: engineDetail.years,
    };

    // First try to find exact engine match if we have a specific code
    if (engineCode && isValidBMWEngineCode(engineCode)) {
      const { data: engine } = await supabase
        .from("engines")
        .select(
          `
          id,
          engine_code,
          class_id
        `
        )
        .eq("engine_code", engineCode)
        .single();

      if (engine) {
        console.log(`Found exact engine match: ${engine.engine_code}`);

        // Store car-specific data in junction table
        const { error: junctionError } = await supabase
          .from("car_generation_engines")
          .upsert(
            {
              generation_id: genData.id,
              engine_id: engine.id,
              ...engineData,
            },
            {
              onConflict: "generation_id,engine_id",
            }
          );

        if (junctionError) {
          console.warn("Failed to create engine mapping:", junctionError);
        }

        // Also try to store in engine class junction if available
        if (engine.class_id) {
          await supabase.from("car_generation_engine_classes").upsert(
            {
              generation_id: genData.id,
              engine_class_id: engine.class_id,
              ...engineData,
            },
            {
              onConflict: "generation_id,engine_class_id",
            }
          );
        }
      }
    }

    // If no exact match or engine code, try engine family
    if (engineFamily) {
      const { data: engineClass } = await supabase
        .from("engine_classes")
        .select("id")
        .eq("model", engineFamily)
        .single();

      if (engineClass) {
        console.log(`Found engine class match: ${engineFamily}`);

        // Store in engine class junction
        const { error: classJunctionError } = await supabase
          .from("car_generation_engine_classes")
          .upsert(
            {
              generation_id: genData.id,
              engine_class_id: engineClass.id,
              ...engineData,
            },
            {
              onConflict: "generation_id,engine_class_id",
            }
          );

        if (classJunctionError) {
          console.warn(
            "Failed to create engine class mapping:",
            classJunctionError
          );
        }
      } else {
        console.warn(`No engine class match found for family: ${engineFamily}`);
      }
    } else {
      console.warn(
        `No valid engine code or family found for: ${engineDetail.engine}`
      );
    }
  } catch (error) {
    console.error("Engine processing failed:", error);
    throw error;
  }
}

function extractDisplacement(engineString: string): number | null {
  const match = engineString.match(/(\d+\.?\d*)\s*L/i);
  return match ? parseFloat(match[1]) : null;
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
          const chassisCode: string | null = null;

          try {
            const chassisCodes = extractChassisCode(gen.model);
            if (chassisCodes.length === 0) {
              console.warn(
                `Warning: No chassis code found for generation: ${gen.model}`
              );
              continue;
            }
            const chassisCode = chassisCodes; // Use the whole array

            // Create/update generation
            const yearData = gen.model_year
              ? parseModelYear(gen.model_year)
              : parseModelYear(gen.engine_details?.[0]?.years || "");

            const { data: genData, error: genError } = await supabase
              .from("car_generations")
              .upsert(
                {
                  name: gen.model,
                  model_id: modelData.id,
                  chassis_code: chassisCode,
                  summary: gen.summary,
                  ...yearData,
                  image_path: gen.image_path || null,
                } satisfies Omit<
                  CarGeneration,
                  "id" | "car_generation_engines"
                >,
                {
                  onConflict: "model_id,name,start_year",
                  ignoreDuplicates: false,
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
                  model_year: gen.model_year,
                },
              });
              throw genError;
            }

            console.log("Generation created:", genData);

            // Process engines
            for (const engineDetail of gen.engine_details) {
              try {
                await processEngineDetails(engineDetail, genData);
                processedEngines.add(engineDetail.engine);
              } catch (engineError) {
                console.warn("Engine processing failed:", {
                  engine: engineDetail.engine,
                  error: engineError,
                });
              }
            }

            generationResults.push({
              name: gen.model,
              chassis_code: chassisCode.join("/"),
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
