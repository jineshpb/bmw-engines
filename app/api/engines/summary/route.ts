import { getEngineClassSummary } from "@/services/engines";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const summary = await getEngineClassSummary();
    return NextResponse.json(summary);
  } catch (error) {
    console.error("Error fetching engine summary:", error);
    return NextResponse.json(
      { error: "Failed to fetch engine summary" },
      { status: 500 }
    );
  }
}
