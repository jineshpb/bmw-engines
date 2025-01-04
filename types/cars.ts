export interface CarGeneration {
  name: string;
  start_year: number;
  end_year: string | number; // Can be "present" or a number
  chassis_code: string;
  engine_id: string;
}

export interface CarPayload {
  make: string;
  model: string;
  model_year: string;
  summary: string;
  image_path?: string;
  data: CarGeneration[];
}
