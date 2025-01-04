import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import supabase from "@/lib/supabaseClient";
import { RawEngineData, EnginePayload } from "@/types/engines";
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
async function handleImage(
  imageUrl: string,
  model: string,
  engineCode: string
) {
  try {
    console.log("Attempting to download engine image:", imageUrl);

    const response = await fetch(imageUrl);
    if (!response.ok)
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    const buffer = await response.arrayBuffer();

    console.log("Image downloaded, size:", buffer.byteLength);

    const fileName = `${model.toLowerCase()}-${engineCode.toLowerCase()}.jpg`;
    console.log("Uploading to storage as:", fileName);

    const { data, error } = await supabase.storage
      .from("engine-images")
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
    const enginesDir = path.join(process.cwd(), "lib", "bmw", "engines");
    const files = await fs.readdir(enginesDir);
    const results = [];

    for (const file of files) {
      if (!file.endsWith(".json")) continue;

      try {
        const content = await fs.readFile(path.join(enginesDir, file), "utf-8");
        const payload = JSON.parse(content) as EnginePayload;

        // Parse notes if they exist
        let processedNotes = null;
        if (payload.notes && payload.notes !== "null") {
          try {
            // If it's already a string, use it directly
            if (typeof payload.notes === "string") {
              processedNotes = payload.notes;
            } else {
              // If it's an object, stringify it
              processedNotes = JSON.stringify(payload.notes);
            }
          } catch (e) {
            console.log("Notes processing error:", e);
          }
        }

        // First create/update the engine class
        const { data: classData, error: classError } = await supabase
          .from("engine_classes")
          .upsert(
            {
              model: payload.model,
              notes: processedNotes, // Use processed notes
            },
            { onConflict: "model" }
          )
          .select()
          .single();

        if (classError) throw classError;
        if (!classData) throw new Error("No engine class data returned");

        // Then process each unique engine within this class
        const uniqueEngines = new Set(
          payload.data
            .filter(
              (e: RawEngineData) => e.engine_code && e.engine_code.trim() !== ""
            )
            .map((e: RawEngineData) => e.engine_code)
        );

        for (const engineCode of uniqueEngines) {
          // Handle image if exists
          let processedImagePath = null;
          if (payload.image_path && payload.image_path !== "null") {
            const cleanedUrl = cleanImageUrl(payload.image_path);
            if (cleanedUrl) {
              processedImagePath = await handleImage(
                cleanedUrl,
                payload.model,
                engineCode
              );
            }
          }

          // Create/update engine record
          const { data: engineData, error: engineError } = await supabase
            .from("engines")
            .upsert(
              {
                engine_code: engineCode,
                class_id: classData.id, // Link engine to its class
                image_path: processedImagePath,
              },
              { onConflict: "engine_code" }
            )
            .select()
            .single();

          if (engineError) throw engineError;
          if (!engineData) throw new Error("No engine data returned");

          // Create/update engine configurations
          for (const config of payload.data.filter(
            (d) => d.engine_code === engineCode
          )) {
            const { error: configError } = await supabase
              .from("engine_configurations")
              .upsert(
                {
                  engine_id: engineData.id,
                  displacement: config.displacement || "",
                  power: config.power || "",
                  torque: config.torque || "",
                  years: config.years || "",
                },
                {
                  onConflict: "engine_id, displacement, power, torque, years",
                  ignoreDuplicates: true,
                }
              );

            if (configError) throw configError;
          }
        }

        results.push({
          file,
          status: "success",
          model: payload.model,
          enginesProcessed: uniqueEngines.size,
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
