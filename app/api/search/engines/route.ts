import { NextResponse } from "next/server";
import meilisearch from "@/lib/meilisearch";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query) {
      return NextResponse.json({ hits: [] });
    }

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

    console.log("Search results:", results); // Debug log
    return NextResponse.json(results);
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: "Search failed", hits: [] },
      { status: 500 }
    );
  }
}
