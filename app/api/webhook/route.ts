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
  }
};

export async function POST(request: Request) {
  await logRequest(request);

  try {
    const payload = (await request.json()) as EnginePayload;
    let classId: string;

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
      // 1. Create engine class first
      classId = await createEngineClass(payload.model);
      console.log("Created class with ID:", classId);

      // 2. Insert engines with reference to class
      await insertEnginesWithClass(payload.data, classId);
    } catch (dbError) {
      console.error("Database operation failed:", dbError);
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
    console.error("Webhook processing error:", error);
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
