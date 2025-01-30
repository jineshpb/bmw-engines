// services/engines.ts
import supabase from "../lib/supabaseClient";
import {
  EngineConfiguration,
  EngineClass,
  EngineClassSummary,
  EngineClassCardProps,
  Engine,
} from "@/types/engines";
import { PostgrestError } from "@supabase/supabase-js";

interface EngineConfigResponse {
  engines: {
    engine_code: string;
  };
  // ... other fields
}

export const getEngines = async (): Promise<Engine[]> => {
  const { data, error } = await supabase.from("engines").select("*");

  if (error) {
    console.error("Error fetching engines:", error);
    return [];
  }

  return data as Engine[];
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
  try {
    const { data, error } = await supabase.from("engine_classes").select(`
        id,
        model,
        summary,
        image_path,
        fuel_type,
        wikipedia_url,
        engines (
          id,
          engine_configurations (count)
        )
      `);

    if (error) {
      console.error("Error details:", error);
      throw error;
    }

    if (!data) return [];

    return data.map((engineClass) => ({
      id: engineClass.id,
      model: engineClass.model,
      notes: engineClass.summary,
      image_path: engineClass.image_path,
      fuel_type: engineClass.fuel_type || "gasoline",
      engineCount: engineClass.engines?.length || 0,
      configurations: {
        total:
          engineClass.engines?.reduce(
            (acc, engine) =>
              acc + (engine.engine_configurations[0]?.count || 0),
            0
          ) || 0,
        derived: 0,
        original: 0,
      },
    }));
  } catch (error) {
    console.error("Error fetching engine class summary:", error);
    throw error;
  }
};

export const getEnginesByClass = async (
  classId?: string
): Promise<Partial<EngineConfiguration>[]> => {
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
    fuel_type: engineClass.fuel_type,
    engineCount: engineClass.engines[0]?.count || 0,
    configurations: {
      total: engineClass.engine_configurations[0]?.count || 0,
      derived: 0,
      original: 0,
    },
  };
}

export interface EnginePayload {
  model: string;
  data?: {
    engine_code?: string;
    displacement?: string;
    power?: string;
    torque?: string;
    years?: string;
  }[];
}

export async function createEngineClass(model: string): Promise<string> {
  // Implementation for creating an engine class
  // This would interact with your database
  const classId = `class_${Date.now()}`; // Temporary ID generation
  console.log(`Creating engine class for model ${model}`);
  return classId;
}

export async function insertEnginesWithClass(
  engines: EngineData[],
  classId: string
) {
  // Implementation for inserting engines with a class ID
  // This would interact with your database
  console.log(`Inserting ${engines.length} engines for class ${classId}`);
}

interface EngineData {
  engine_code: string;
  displacement: string;
  power: string;
  torque: string;
  years: string;
}
