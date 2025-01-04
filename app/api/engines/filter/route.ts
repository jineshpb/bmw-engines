import { getEngines } from "@/services/engines";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const engines = await getEngines();
    return NextResponse.json(engines);
  } catch (error) {
    console.error("Error fetching engines:", error);
    return NextResponse.json(
      { error: "Failed to fetch engines" },
      { status: 500 }
    );
  }
}
