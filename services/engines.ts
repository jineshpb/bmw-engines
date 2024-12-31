// services/engines.ts
import supabase from "../lib/supabaseClient";

// Define the type for Engine data
export interface Engine {
  id?: string;
  engine_code: string;
  displacement: string;
  power: string;
  torque: string;
  years: string;
}

export interface EnginePayload {
  data: Engine[];
  model: string;
}

export interface EngineClass {
  id?: string;
  model: string;
}

export interface EngineConfiguration {
  id?: string;
  engine_id: string;
  displacement?: string;
  power?: string;
  torque?: string;
  years?: string;
}

export const getEngines = async (): Promise<Engine[]> => {
  const { data, error } = await supabase.from("engines").select("*");

  // console.log("data", data);

  if (error) {
    console.error("Error fetching engines:", error);
    return [];
  }

  return data as Engine[];
};

export const getEngineConfigurations = async (): Promise<
  EngineConfiguration[]
> => {
  const { data, error } = await supabase
    .from("engine_configurations")
    .select("*");

  if (error) {
    console.error("Error fetching engine configurations:", error);
    return [];
  }

  return data as EngineConfiguration[];
};

export const upsertEngines = async (engines: Engine[]): Promise<void> => {
  const { error } = await supabase.from("engines").upsert(engines, {
    onConflict: "engine_code",
    ignoreDuplicates: false,
  });

  if (error) throw error;
};

export const createEngineClass = async (model: string): Promise<string> => {
  try {
    console.log("Attempting to create class with model:", model);
    const { data, error } = await supabase
      .from("engine_classes")
      .insert({ model })
      .select()
      .single();

    if (error) {
      console.error("Error creating class:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      });
      throw error;
    }

    console.log("Class creation response:", data);
    if (!data) {
      throw new Error("No data returned from class creation");
    }

    return data.id;
  } catch (error) {
    console.error("createEngineClass failed:", {
      name: (error as Error).name,
      message: (error as Error).message,
      stack: (error as Error).stack,
    });
    throw error;
  }
};

export const insertEnginesWithClass = async (
  engines: Engine[],
  classId: string
): Promise<void> => {
  try {
    const enginesWithClass = engines.map((engine) => ({
      ...engine,
      class_id: classId,
    }));

    const { error } = await supabase.from("engines").insert(enginesWithClass);

    if (error) {
      console.error("Error inserting engines:", error);
      throw error;
    }
  } catch (error) {
    console.error("insertEnginesWithClass failed:", error);
    throw error;
  }
};
