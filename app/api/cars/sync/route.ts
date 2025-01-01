import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import supabase from "@/lib/supabaseClient";

interface CarGeneration {
  name: string;
  start_year: number;
  end_year: string | number; // Can be "present" or a number
  chassis_code: string;
  engine_id: string;
}

interface CarPayload {
  make: string;
  model: string;
  model_year: string;
  summary: string;
  data: CarGeneration[];
}

export async function POST() {
  try {
    const carsDir = path.join(process.cwd(), "lib", "bmw", "cars");
    const files = await fs.readdir(carsDir);
    const results = [];

    for (const file of files) {
      if (!file.endsWith(".json")) continue;

      const content = await fs.readFile(path.join(carsDir, file), "utf-8");
      const payload = JSON.parse(content) as CarPayload;

      try {
        // 1. Upsert car make with name unique constraint
        const { data: makeData, error: makeError } = await supabase
          .from("car_makes")
          .upsert({ name: payload.make }, { onConflict: "name" })
          .select()
          .single();

        if (makeError) throw makeError;
        const makeId = makeData.id;

        // 2. Upsert car model with make_id and name unique constraint
        const { data: modelData, error: modelError } = await supabase
          .from("car_models")
          .upsert(
            {
              name: payload.model,
              make_id: makeId,
              model_year: payload.model_year,
              summary: payload.summary,
            },
            { onConflict: "make_id,name" }
          )
          .select()
          .single();

        if (modelError) throw modelError;

        // 3. Upsert car generations with model_id and chassis_code unique constraint
        for (const gen of payload.data) {
          // Look up engine configuration if engine_id exists
          let engineConfigId = null;
          if (gen.engine_id && gen.engine_id !== "N/A") {
            const { data: engineData, error: engineError } = await supabase
              .from("engines")
              .select("id, engine_configurations!inner(id)")
              .eq("engine_code", gen.engine_id)
              .single();

            if (engineError) {
              console.log(
                `Engine lookup error for ${gen.engine_id}:`,
                engineError
              );
            } else if (engineData) {
              engineConfigId = engineData.engine_configurations[0].id;
            }
          }

          const { error: genError } = await supabase
            .from("car_generations")
            .upsert(
              {
                name: gen.name,
                model_id: modelData.id,
                start_year: gen.start_year,
                end_year: gen.end_year === "present" ? null : gen.end_year,
                chassis_code: gen.chassis_code,
                engine_configuration_id: engineConfigId,
              },
              { onConflict: "model_id,chassis_code" }
            );

          if (genError) throw genError;
        }

        results.push({
          file,
          status: "success",
          make: payload.make,
          model: payload.model,
          generationsProcessed: payload.data.length,
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
