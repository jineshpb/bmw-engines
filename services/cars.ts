import supabase from "@/lib/supabaseClient";

export interface CarModel {
  id: string;
  name: string;
  model_year: string;
  summary: string;
  make_id: string;
  image_path: string | null;
  car_generations: {
    id: string;
    name: string;
    start_year: number;
    end_year: string | null;
    chassis_code: string;
    engine_configuration_id: string | null;
  }[];
  car_makes: {
    name: string;
  };
}

export const getCarModels = async (): Promise<CarModel[]> => {
  const { data, error } = await supabase
    .from("car_models")
    .select(
      `
      *,
      car_generations (
        id,
        name,
        start_year,
        end_year,
        chassis_code,
        engine_configuration_id
      ),
      car_makes (
        name
      )
    `
    )
    .order("name");

  if (error) {
    console.error("Error fetching car models:", error);
    return [];
  }

  return data as CarModel[];
};

// Optional: Get a single car model by ID
export const getCarModelById = async (id: string): Promise<CarModel | null> => {
  const { data, error } = await supabase
    .from("car_models")
    .select(
      `
      *,
      car_generations (
        id,
        name,
        start_year,
        end_year,
        chassis_code,
        engine_configuration_id
      ),
      car_makes (
        name
      )
    `
    )
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching car model:", error);
    return null;
  }

  return data as CarModel;
};
