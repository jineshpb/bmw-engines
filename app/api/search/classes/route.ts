import { NextResponse } from "next/server";
import meilisearch from "@/lib/meilisearch";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query) {
      return NextResponse.json({ hits: [] });
    }

    const results = await meilisearch.index("engine_classes").search(query, {
      limit: 5,
      attributesToHighlight: ["model"],
      attributesToRetrieve: [
        "id",
        "model",
        "fuel_type",
        "image_path",
        "summary",
      ],
    });

    return NextResponse.json(results);
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: "Search failed", hits: [] },
      { status: 500 }
    );
  }
}
