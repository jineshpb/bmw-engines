import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export async function GET() {
  try {
    const carsDir = path.join(process.cwd(), "lib", "bmw", "cars");
    const files = await fs.readdir(carsDir);

    const carData = await Promise.all(
      files.map(async (file) => {
        const content = await fs.readFile(path.join(carsDir, file), "utf-8");
        return JSON.parse(content);
      })
    );

    return NextResponse.json(carData);
  } catch (error) {
    console.error("Error reading car data:", error);
    return NextResponse.json(
      { error: "Failed to fetch car data" },
      { status: 500 }
    );
  }
}
