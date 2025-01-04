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
  image_path?: string;
  notes?: string;
}

// Database records
export interface EngineRecord {
  id: string;
  engine_code: string;
  class_id?: string;
  notes?: string;
  image_path?: string;
}

export interface EngineConfiguration {
  id?: string;
  engine_id: string;
  displacement?: string;
  power?: string;
  torque?: string;
  years?: string;
  engines?: {
    engine_code: string;
  };
  is_derived?: boolean;
}

export interface EngineClass {
  id: string;
  model: string;
  notes?: string;
}
