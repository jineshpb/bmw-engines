// services/engines.ts
import supabase from "../lib/supabaseClient";
import {
  EngineRecord,
  EngineConfiguration,
  EngineClass,
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
