export interface EngineDetail {
  model: string;
  years: string;
  engine: string;
  power: string;
  torque: string;
}

export interface GenerationModel {
  model: string;
  image_path: string;
  model_year: string;
  engine_details: EngineDetail[];
}

export interface CarPayload {
  make: string;
  model: string;
  model_year: string;
  summary: string;
  chassis_codes: string[];
  engine_id?: string;
  data: {
    models: GenerationModel[];
  };
  image_path?: string;
}

// For database operations
export interface CarGeneration {
  id?: string;
  name: string;
  model_id: string;
  start_year: string;
  end_year?: string | null;
  chassis_code: string[];
  image_path?: string;
}

export interface CarModel {
  id?: string;
  name: string;
  make_id: string;
  model_year: string;
  summary?: string;
  image_path?: string;
}

// Type for sync results tracking
export interface GenerationSyncResult {
  name: string;
  chassis_code: string;
  status: "success" | "error";
  engines_processed?: number;
  error?: string;
}
