// Raw data from JSON files
export interface EngineDetail {
  model: string;
  years: string;
  engine: string;
  power: string;
  torque: string;
}

export interface GenerationModel {
  model: string;
  image_path?: string; // Optional in JSON
  summary: string;
  model_year?: string; // Optional in some generations
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

// Database types
export interface CarGeneration {
  id?: string;
  name: string;
  model_id: string;
  start_year: number | null;
  end_year: string | null;
  chassis_code: string[];
  summary: string | null;
  image_path: string | null;
  car_generation_engines?: {
    id: string;
    created_at: string;
    engines: {
      engine_code: string;
    };
    years: string | null;
    power: string | null;
    torque: string | null;
    displacement: number | null;
  }[];
  car_generation_engine_classes?: GenerationCardEngineClass[];
}

export interface CarModel {
  id: string;
  name: string;
  model_year: string;
  summary: string;
  make_id: string;
  image_path: string | null;
  car_generations: CarGeneration[]; // Use CarGeneration interface
  car_makes: {
    name: string;
  };
}

// Type for sync results tracking
export interface GenerationSyncResult {
  name: string;
  chassis_code: string;
  status: "success" | "error";
  engines_processed?: number;
  error?: string;
}

//Generation Card Types

export interface GenerationCardEngine {
  id: string;
  created_at: string;
  engines: {
    engine_code: string;
  };
  years: string | null;
  power: string | null;
  torque: string | null;
  displacement: number | null;
}

export interface GenerationCardEngineClass {
  engine_classes: {
    id: string;
    model: string;
  };
  years: string | null;
  power: string | null;
  torque: string | null;
  displacement: number | null;
}

export interface GenerationCardProps {
  expanded?: boolean;
  generation: {
    id?: string;
    name: string;
    start_year: number | null;
    end_year: string | null;
    chassis_code: string[];
    summary: string | null;
    image_path: string | null;
    car_generation_engines?: GenerationCardEngine[];
    car_generation_engine_classes?: GenerationCardEngineClass[];
  };
}
