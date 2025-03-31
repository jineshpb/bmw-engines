import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import supabase from "@/lib/supabaseClient";
import { CarPayload, GenerationSyncResult, EngineDetail } from "@/types/cars";

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

    // If we have a specific engine code, only create the engine mapping
    if (engineCode && isValidBMWEngineCode(engineCode)) {
      const { data: engine } = await supabase
        .from("engines")
        .select("id, engine_code, class_id")
        .eq("engine_code", engineCode)
        .single();

      if (engine) {
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
        // Skip engine class creation if we have a specific engine
        return;
      }
    }

    // Only process engine family if we don't have a specific engine match
    if (engineFamily) {
      const { data: engineClass } = await supabase
        .from("engine_classes")
        .select("id")
        .eq("model", engineFamily)
        .single();

      if (engineClass) {
        await supabase.from("car_generation_engine_classes").upsert(
          {
            generation_id: genData.id,
            engine_class_id: engineClass.id,
            ...engineData,
          },
          {
            onConflict: "generation_id,engine_class_id",
          }
        );
      }
    }
  } catch (error) {
    console.error("Engine processing error:", error);
    throw error;
  }
}

function extractDisplacement(engineString: string): number | null {
  const match = engineString.match(/(\d+\.?\d*)\s*L/i);
  return match ? parseFloat(match[1]) : null;
}

async function uploadGenerationImage(
  imageUrl: string,
  modelName: string,
  generationName: string
): Promise<string | null> {
  try {
    if (!imageUrl) return null;

    const cleanUrl = imageUrl.startsWith("//") ? `https:${imageUrl}` : imageUrl;
    const filename = `${modelName
      .toLowerCase()
      .replace(/\s+/g, "_")}-${generationName
      .toLowerCase()
      .replace(/\s+/g, "_")}.jpg`;

    // Download image
    const response = await fetch(cleanUrl);
    if (!response.ok)
      throw new Error(`Failed to fetch image: ${response.statusText}`);

    const imageBuffer = await response.arrayBuffer();

    // Upload to Supabase storage
    const { error } = await supabase.storage
      .from("car_generation_images")
      .upload(filename, imageBuffer, {
        contentType: "image/jpeg",
        upsert: true,
      });

    if (error) {
      console.error(`Error uploading generation image ${filename}:`, error);
      return null;
    }

    return filename;
  } catch (error) {
    console.error("Error in uploadGenerationImage:", error);
    return null;
  }
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
      if (file !== "5 series.json") continue; // Only process 1 series.json

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
            const chassisCode = chassisCodes;

            // Upload generation image if exists
            let generationImagePath = null;
            if (gen.image_path) {
              generationImagePath = await uploadGenerationImage(
                gen.image_path,
                payload.model,
                gen.model
              );
            }

            // Create/update generation with image path
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
                  image_path: generationImagePath, // Use the uploaded image path
                },
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
