import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { CarPayload } from "@/types/cars";
import { syncCarModelImages } from "@/services/cars";

// For debugging
const logRequest = async (request: Request) => {
  console.log("Request method:", request.method);
  console.log("Request headers:", Object.fromEntries(request.headers));
  try {
    const body = await request.clone().json();
    console.log("Request body:", body);
  } catch (e) {
    console.log("Could not parse request body:", e);
  }
};

export async function POST(request: Request) {
  await logRequest(request);

  try {
    const payload = (await request.json()) as CarPayload;

    // Add detailed debug logging
    console.log("Validation check details:");
    console.log({
      make: payload.make,
      model: payload.model,
      model_year: payload.model_year,
      summary: payload.summary,
      chassis_codes: Array.isArray(payload.chassis_codes),
      engine_id: payload.engine_id,
      hasModels: payload.data?.models,
      isModelsArray: Array.isArray(payload.data?.models),
      image_path: payload.image_path,
    });

    // Enhanced payload validation
    if (
      !payload.make ||
      !payload.model ||
      !payload.model_year ||
      !payload.summary ||
      !Array.isArray(payload.chassis_codes) ||
      !payload.engine_id ||
      !payload.data?.models ||
      !Array.isArray(payload.data.models) ||
      !payload.image_path
    ) {
      return NextResponse.json(
        {
          message: "Invalid payload format",
          required: [
            "make",
            "model",
            "model_year",
            "summary",
            "chassis_codes",
            "engine_id",
            "data.models",
            "image_path",
          ],
        },
        { status: 400 }
      );
    }

    // Validate models array structure
    const isValidModels = payload.data.models.every(
      (modelData) =>
        modelData.model &&
        Array.isArray(modelData.engine_details) &&
        modelData.engine_details.every(
          (detail) =>
            detail.model &&
            detail.years &&
            detail.engine &&
            detail.power &&
            detail.torque !== undefined
        )
    );

    if (!isValidModels) {
      return NextResponse.json(
        {
          message: "Invalid models structure",
          required: {
            models: {
              model: "string",
              engine_details: [
                {
                  model: "string",
                  years: "string",
                  engine: "string",
                  power: "string",
                  torque: "string",
                },
              ],
            },
          },
        },
        { status: 400 }
      );
    }

    try {
      // Create directory if it doesn't exist
      const dirPath = path.join(
        process.cwd(),
        "lib",
        payload.make.toLowerCase(),
        "cars"
      );
      await fs.mkdir(dirPath, { recursive: true });

      // Write to file
      const filePath = path.join(
        dirPath,
        `${payload.model.toLowerCase()}.json`
      );
      await fs.writeFile(filePath, JSON.stringify(payload, null, 2), "utf-8");

      // After successful upload
      await syncCarModelImages(payload.data.models[0].model);

      return NextResponse.json({
        message: "Car data written successfully",
        modelCount: payload.data.models.length,
        filePath: filePath,
      });
    } catch (fileError) {
      console.error("File operation failed:", fileError);
      return NextResponse.json(
        {
          message: "File operation failed",
          error: (fileError as Error).message,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("API processing error:", error);
    return NextResponse.json(
      { message: "Error processing request", error: (error as Error).message },
      { status: 500 }
    );
  }
}

// Add handler for other methods
export async function GET() {
  return NextResponse.json({ message: "Method not allowed" }, { status: 405 });
}

export async function PUT() {
  return NextResponse.json({ message: "Method not allowed" }, { status: 405 });
}

export async function DELETE() {
  return NextResponse.json({ message: "Method not allowed" }, { status: 405 });
}

async function downloadImages(inputs: { imageUrls: string[] }) {
  if (!inputs.imageUrls || !Array.isArray(inputs.imageUrls)) {
    return {
      success: false,
      error: "No image URLs provided or invalid input",
    };
  }

  try {
    const results = [];

    for (const url of inputs.imageUrls) {
      try {
        // Add timeout of 5 seconds for each request
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const response = await fetch(url, {
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          results.push({
            url: url,
            status: "success",
          });
        }
      } catch (err) {
        results.push({
          url: url,
          status: "failed",
          error:
            err instanceof Error
              ? err.name === "AbortError"
                ? "Request timeout"
                : err.message
              : "Unknown error",
        });
      }
    }

    return {
      success: true,
      processed: results.length,
      successful: results.filter((r) => r.status === "success").length,
      failed: results.filter((r) => r.status === "failed").length,
      results: results,
    };
  } catch (err) {
    return {
      success: false,
      error: "Failed to process images",
      details: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

module.exports = downloadImages;
