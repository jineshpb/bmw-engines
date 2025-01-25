// services/engines.ts
import supabase from "../lib/supabaseClient";
import {
  EngineRecord,
  EngineConfiguration,
  EngineClass,
  EngineClassSummary,
  EngineClassCardProps,
} from "@/types/engines";
import { PostgrestError } from "@supabase/supabase-js";

interface EngineConfigResponse {
  engines: {
    engine_code: string;
  };
  // ... other fields
}

export const getEngines = async (): Promise<EngineRecord[]> => {
  const { data, error } = await supabase.from("engines").select("*");

  if (error) {
    console.error("Error fetching engines:", error);
    return [];
  }

  return data as EngineRecord[];
};

export const getEngineConfigurations = async (): Promise<
  EngineConfiguration[]
> => {
  const { data, error } = (await supabase.from("engine_configurations").select(`
        id,
        engine_id,
        displacement,
        power,
        torque,
        years,
        is_derived,
        engines (
          id,
          engine_code,
          class_id
        )
      `)) as {
    data: EngineConfigResponse[] | null;
    error: PostgrestError | null;
  };

  if (error) {
    console.error("Error fetching engine configurations:", error);
    return [];
  }

  return (data || []).map((config) => ({
    ...config,
    engines: {
      engine_code: config.engines?.engine_code || "",
    },
  })) as EngineConfiguration[];
};

export const getEngineClasses = async (): Promise<EngineClass[]> => {
  const { data, error } = await supabase
    .from("engine_classes")
    .select("id, model")
    .order("model", { ascending: true });

  if (error) {
    console.error("Error fetching engine classes:", error);
    return [];
  }

  return data as EngineClass[];
};

export const getEngineClassSummary = async (): Promise<
  EngineClassSummary[]
> => {
  const { data, error } = await supabase
    .from("engine_classes")
    .select(
      `
      id,
      model,
      notes,
      image_path,
      engines (
        id,
        engine_code,
        engine_configurations (
          id,
          is_derived
        )
      )
    `
    )
    .order("model", { ascending: true });

  // console.log("join data ", data);

  if (error) {
    console.error("Error fetching engine summary:", error);
    return [];
  }

  return (data || []).map((engineClass) => {
    // console.log("engineClass", engineClass);

    return {
      id: engineClass.id,
      model: engineClass.model,
      notes: engineClass.notes,
      image_path: engineClass.image_path,
      engineCount: engineClass.engines?.length || 0,
      configurations: {
        total:
          engineClass.engines?.reduce(
            (sum, engine) => sum + (engine.engine_configurations?.length || 0),
            0
          ) || 0,
        derived: 0,
        original: 0,
      },
    };
  }) as EngineClassSummary[];
};

export const getEnginesByClass = async (
  classId?: string
): Promise<EngineConfiguration[]> => {
  let query = supabase.from("engine_classes").select(`
      engines (
        id,
        engine_code,
        image_path,
        engine_configurations (
          id,
          engine_id,
          displacement,
          power,
          torque,
          years,
          is_derived
        )
      )
    `);

  if (classId && classId !== "all") {
    query = query.eq("id", classId);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching engines by class:", error);
    return [];
  }

  // Flatten the nested structure to get all configurations
  const configurations =
    data?.flatMap(
      (engineClass) =>
        engineClass.engines?.flatMap((engine) =>
          engine.engine_configurations.map((config) => ({
            ...config,
            engines: { engine_code: engine.engine_code },
          }))
        ) || []
    ) || [];

  return configurations;
};

export async function getEngineClassById(
  id: string
): Promise<EngineClassSummary> {
  const { data: engineClass } = (await supabase
    .from("engine_classes")
    .select(
      `
      *,
      engines (count),
      engine_configurations (count)
    `
    )
    .eq("id", id)
    .single()) as { data: EngineClassCardProps };

  if (!engineClass) throw new Error("Engine class not found");

  return {
    id: engineClass.id,
    model: engineClass.model,
    notes: engineClass.notes,
    image_path: engineClass.image_path,
    engineCount: engineClass.engines[0]?.count || 0,
    configurations: {
      total: engineClass.engine_configurations[0]?.count || 0,
      derived: 0,
      original: 0,
    },
  };
}
