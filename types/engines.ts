// types/engines.ts

// Raw data from JSON files
export interface RawEngineData {
  engine_code: string;
  displacement?: string;
  power?: string;
  torque?: string;
  years?: string;
}

export interface EnginePayload {
  data: RawEngineData[];
  model: string;
  fuel_type: string;
  image_path?: string;
  notes?: string;
  wikipedia_url?: string;
  summary?: string;
}

// Database records
export interface EngineClass {
  id: string;
  created_at: string;
  model: string;
  summary?: string;
  image_path?: string;
  wikipedia_url?: string;
  fuel_type: string;
}

export interface Engine {
  id: string;
  created_at: string;
  updated_at: string;
  engine_code: string;
  class_id?: string;
  notes?: string;
  image_path?: string;
}

export interface EngineConfiguration {
  id: string;
  created_at: string;
  engine_id: string;
  power?: string;
  torque?: string;
  years?: string;
  displacement?: string;
  is_derived: boolean;
  fuel_type?: string;
  engines?: {
    engine_code: string;
  };
}

// Summary types for UI
export interface EngineClassSummary {
  id: string;
  model: string;
  notes: string | null;
  image_path: string | null;
  engineCount: number;
  configurations: {
    total: number;
    derived: number;
    original: number;
  };
  fuel_type: string;
}

export interface EngineClassCardProps {
  id: string;
  model: string;
  notes: string | null;
  image_path: string | null;
  fuel_type: string;
  engines: { count: number }[];
  engine_configurations: { count: number }[];
}
