// services/engines.ts
import supabase from "../lib/supabaseClient";
import {
  EngineRecord,
  EngineConfiguration,
  EngineClass,
  EngineClassSummary,
} from "@/types/engines";

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
  const { data, error } = await supabase.from("engine_configurations").select(`
    *,
    engines (
      engine_code
    )
  `);

  if (error) {
    console.error("Error fetching engine configurations:", error);
    return [];
  }

  return (data || []) as EngineConfiguration[];
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
