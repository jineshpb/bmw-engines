import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

// Load environment variables from .env.local
dotenv.config({ path: ".env.local" });

// Create Supabase client directly in script
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing Supabase credentials in environment variables");
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function uploadGenerationImages() {
  try {
    const carsDir = path.join(process.cwd(), "lib/bmw/cars");
    const files = await fs.promises.readdir(carsDir);

    for (const file of files) {
      if (!file.endsWith(".json")) continue;

      const content = await fs.promises.readFile(
        path.join(carsDir, file),
        "utf8"
      );
      const carData = JSON.parse(content);

      for (const gen of carData.data.models) {
        if (gen.image_path) {
          const imageUrl = gen.image_path.startsWith("//")
            ? `https:${gen.image_path}`
            : gen.image_path;

          const filename = `${carData.model
            .toLowerCase()
            .replace(/\s+/g, "_")}-${gen.model
            .toLowerCase()
            .replace(/\s+/g, "_")}.jpg`;

          console.log(`Processing: ${filename}`);

          try {
            const response = await fetch(imageUrl);
            const imageBuffer = await response.arrayBuffer();

            const { error } = await supabase.storage
              .from("car_generation_images")
              .upload(filename, imageBuffer, {
                contentType: "image/jpeg",
                upsert: true,
              });

            if (error) {
              console.error(`Error uploading ${filename}:`, error);
              continue;
            }

            console.log(`Successfully uploaded ${filename}`);
          } catch (error) {
            console.error(`Failed to process ${filename}:`, error);
          }
        }
      }
    }
  } catch (error) {
    console.error("Error in uploadGenerationImages:", error);
  }
}

uploadGenerationImages();
