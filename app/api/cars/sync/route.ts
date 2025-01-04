import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import supabase from "@/lib/supabaseClient";
import { CarPayload } from "@/types/cars";
import fetch from "node-fetch";

// Helper function to clean image URLs
function cleanImageUrl(rawUrl: string | null): string {
  if (!rawUrl || rawUrl === "null") return ""; // Handle null or "null" string

  let imageUrl = ""; // Initialize with empty string
  try {
    const imageData = JSON.parse(rawUrl);
    if (imageData && imageData.image_link) {
      imageUrl = imageData.image_link;
    } else {
      imageUrl = rawUrl;
    }
  } catch (e) {
    imageUrl = rawUrl;
    console.log("image path cleanup error", e);
  }

  // Only try to replace if imageUrl is a string
  return typeof imageUrl === "string"
    ? imageUrl.replace(/[\[\]\n\s"]/g, "").replace(/^\/\//, "https://")
    : "";
}

// Function to download and upload image
async function handleImage(imageUrl: string, make: string, model: string) {
  try {
    console.log("Attempting to download car image:", imageUrl);

    const response = await fetch(imageUrl);
    if (!response.ok)
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    const buffer = await response.arrayBuffer();

    console.log("Image downloaded, size:", buffer.byteLength);

    const fileName = `${make.toLowerCase()}-${model.toLowerCase()}.jpg`;
    console.log("Uploading to storage as:", fileName);

    const { data, error } = await supabase.storage
      .from("car-images")
      .upload(fileName, buffer, {
        contentType: "image/jpeg",
        upsert: true,
      });

    if (error) throw error;
    console.log("Upload successful, path:", data.path);
    return data.path;
  } catch (error) {
    console.error("Image processing failed:", error);
    return null;
  }
}

export async function POST() {
  try {
    const carsDir = path.join(process.cwd(), "lib", "bmw", "cars");
    const files = await fs.readdir(carsDir);
    const results = [];

    for (const file of files) {
      if (!file.endsWith(".json")) continue;

      const content = await fs.readFile(path.join(carsDir, file), "utf-8");
      const payload = JSON.parse(content) as CarPayload;

      try {
        // 1. Upsert car make with name unique constraint
        const { data: makeData, error: makeError } = await supabase
          .from("car_makes")
          .upsert({ name: payload.make }, { onConflict: "name" })
          .select()
          .single();

        if (makeError) throw makeError;
        const makeId = makeData.id;

        // 2. Upsert car model with make_id and name unique constraint
        const { data: modelData, error: modelError } = await supabase
          .from("car_models")
          .upsert(
            {
              name: payload.model,
              make_id: makeId,
              model_year: payload.model_year,
              summary: payload.summary,
            },
            { onConflict: "make_id,name" }
          )
          .select()
          .single();

        if (modelError) throw modelError;

        // 3. Upsert car generations with model_id and chassis_code unique constraint
        for (const gen of payload.data) {
          // Look up engine configuration if engine_id exists
          let engineConfigId = null;
          if (gen.engine_id && gen.engine_id !== "N/A") {
            const { data: engineData, error: engineError } = await supabase
              .from("engines")
              .select("id, engine_configurations!inner(id)")
              .eq("engine_code", gen.engine_id)
              .single();

            if (engineError) {
              console.log(
                `Engine lookup error for ${gen.engine_id}:`,
                engineError
              );
            } else if (engineData) {
              engineConfigId = engineData.engine_configurations[0].id;
            }
          }

          const { error: genError } = await supabase
            .from("car_generations")
            .upsert(
              {
                name: gen.name,
                model_id: modelData.id,
                start_year: gen.start_year,
                end_year: gen.end_year === "present" ? null : gen.end_year,
                chassis_code: gen.chassis_code,
                engine_configuration_id: engineConfigId,
              },
              { onConflict: "model_id,chassis_code" }
            );

          if (genError) throw genError;
        }

        results.push({
          file,
          status: "success",
          make: payload.make,
          model: payload.model,
          generationsProcessed: payload.data.length,
        });

        // In your POST handler, add image handling
        if (payload.image_path) {
          const cleanedUrl = cleanImageUrl(payload.image_path);
          if (cleanedUrl) {
            const imagePath = await handleImage(
              cleanedUrl,
              payload.make,
              payload.model
            );

            if (imagePath) {
              const { error: updateError } = await supabase
                .from("car_models")
                .update({ image_path: imagePath })
                .eq("id", modelData.id);

              if (updateError)
                console.error("Failed to update model image:", updateError);
            }
          }
        }
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
