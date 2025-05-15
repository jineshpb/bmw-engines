import { createEngineClass, insertEnginesWithClass } from "@/services/engines";
import { NextResponse } from "next/server";
import { EnginePayload } from "@/services/engines";

// For debugging
const logRequest = async (request: Request) => {
  console.log("Request method:", request.method);
  console.log("Request headers:", Object.fromEntries(request.headers));
  try {
    const body = await request.clone().json();
    console.log("Request body:", body);
  } catch (e) {
    console.log("Could not parse request body:", e);
    throw e;
  }
};

export async function POST(request: Request) {
  await logRequest(request);

  try {
    const payload = (await request.json()) as EnginePayload;
    let classId: string;

    // Debug payload structure
    console.log("=== Payload Analysis ===");
    console.log("Model:", payload.model);
    console.log("Number of engines:", payload.data?.length || 0);
    console.log("First engine sample:", payload.data?.[0]);
    console.log("=====================");

    // Validate payload structure
    if (!payload.model || !Array.isArray(payload.data)) {
      console.error("Validation failed:", {
        hasModel: Boolean(payload.model),
        dataType: typeof payload.data,
        isArray: Array.isArray(payload.data),
      });
      return NextResponse.json(
        { message: "Invalid payload format" },
        { status: 400 }
      );
    }

    try {
      // Clean and validate engine data
      const cleanedEngines = payload.data.map((engine) => ({
        engine_code: engine.engine_code?.trim() || "",
        displacement: engine.displacement?.trim() || "",
        power: engine.power?.trim() || "",
        torque: engine.torque?.trim() || "",
        years: engine.years?.trim() || "",
      }));

      console.log("=== Cleaned Engines ===");
      cleanedEngines.forEach((engine, index) => {
        console.log(`Engine ${index + 1}:`, engine);
      });
      console.log("=====================");

      // Create engine class
      classId = await createEngineClass(payload.model);
      console.log("Created engine class:", { model: payload.model, classId });

      // Insert engines
      await insertEnginesWithClass(cleanedEngines, classId);
      console.log(`Successfully inserted ${cleanedEngines.length} engines`);
    } catch (dbError) {
      console.error("Database operation failed:", {
        error: dbError,
        stack: (dbError as Error).stack,
      });
      return NextResponse.json(
        {
          message: "Database operation failed",
          error: (dbError as Error).message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Engines and class inserted successfully",
      count: payload.data.length,
      class_id: classId,
    });
  } catch (error) {
    console.error("Webhook processing error:", {
      error,
      stack: (error as Error).stack,
    });
    return NextResponse.json(
      { message: "Error processing webhook", error: (error as Error).message },
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
