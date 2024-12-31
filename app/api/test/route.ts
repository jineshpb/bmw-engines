import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import supabase from "@/lib/supabaseClient";
import { Engine } from "@/services/engines";

export async function POST() {
  try {
    const engineDir = path.join(process.cwd(), "lib", "bmw", "engines");
    const files = await fs.readdir(engineDir);
    const results = [];

    for (const file of files) {
      if (!file.endsWith(".json")) continue;

      const content = await fs.readFile(path.join(engineDir, file), "utf-8");
      const payload = JSON.parse(content);

      try {
        // 1. Upsert engine class
        const { data: classData, error: classError } = await supabase
          .from("engine_classes")
          .upsert({ model: payload.model }, { onConflict: "model" })
          .select()
          .single();

        if (classError) throw classError;
        const classId = classData.id;

        // 2. Process each unique engine code
        const uniqueEngines = new Set(payload.data.map((e) => e.engine_code));

        for (const engineCode of uniqueEngines) {
          // Upsert engine
          const { data: engineData, error: engineError } = await supabase
            .from("engines")
            .upsert(
              { engine_code: engineCode, class_id: classId },
              { onConflict: "engine_code" }
            )
            .select()
            .single();

          if (engineError) throw engineError;

          // 3. Upsert engine configurations
          const configs = payload.data
            .filter((d: Engine) => d.engine_code === engineCode)
            .map((config: Engine) => ({
              engine_id: engineData.id,
              displacement: config.displacement,
              power: config.power,
              torque: config.torque,
              years: config.years,
            }));

          const { error: configError } = await supabase
            .from("engine_configurations")
            .upsert(configs, {
              onConflict: "engine_id, displacement, power, torque, years",
            });

          if (configError) throw configError;
        }

        results.push({
          file,
          status: "success",
          model: payload.model,
          enginesProcessed: uniqueEngines.size,
        });
      } catch (error) {
        results.push({
          file,
          status: "error",
          error: (error as Error).message,
        });
      }
    }

    return NextResponse.json({
      message: "Database sync completed",
      results,
    });
  } catch (error) {
    console.error("Sync failed:", error);
    return NextResponse.json(
      { message: "Sync failed", error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ message: "Use POST to sync" }, { status: 405 });
}
