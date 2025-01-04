import { NextResponse } from "next/server";
import { EnginePayload } from "@/types/engines";
import fs from "fs/promises";
import path from "path";

//this received the data from the webhook and writes it to the json files in the lib/bmw/engines folder
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
    const payload = (await request.json()) as EnginePayload;

    // Debug payload
    console.log("Received payload:", JSON.stringify(payload, null, 2));

    // Validate payload structure
    if (!payload.model || !Array.isArray(payload.data)) {
      return NextResponse.json(
        { message: "Invalid payload format" },
        { status: 400 }
      );
    }

    try {
      // Create directory if it doesn't exist
      const dirPath = path.join(process.cwd(), "lib", "bmw", "engines");
      await fs.mkdir(dirPath, { recursive: true });

      // Sanitize the filename
      const sanitizedModel = payload.model.replace(/[\/\\]/g, "_");
      const filePath = path.join(
        dirPath,
        `${sanitizedModel.toLowerCase()}.json`
      );

      // Write to file
      await fs.writeFile(filePath, JSON.stringify(payload, null, 2), "utf-8");

      return NextResponse.json({
        message: "Engine data written successfully",
        count: payload.data.length,
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
