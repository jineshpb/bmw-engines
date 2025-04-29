import { NextResponse } from "next/server";
import meilisearch from "@/lib/meilisearch";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query) {
      return NextResponse.json({ hits: [] });
    }

    // Standard search without hybrid parameters
    const results = await meilisearch.index("engines").search(query, {
      limit: 10,
      attributesToHighlight: ["engine_code"],
      attributesToRetrieve: [
        "id",
        "engine_code",
        "configurations.power",
        "configurations.torque",
      ],
    });

    console.log("Search results:", results);
    return NextResponse.json(results);
  } catch (error) {
    console.error("Search error:", error);
    if (error instanceof Error) {
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
      });
    }
    return NextResponse.json(
      {
        error: "Search failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
