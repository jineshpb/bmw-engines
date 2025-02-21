import supabase from "@/lib/supabaseClient";
import { CarModel } from "@/types/cars";

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
        image_path,
        summary,
        car_generation_engines (
          years,
          power,
          torque,
          displacement,
          engines (
            engine_code
          )
        ),
        car_generation_engine_classes (
          years,
          power,
          torque,
          displacement,
          engine_classes (
            id,
            model
          )
        )
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
        car_generation_engines (
          years,
          engines (
            engine_code
          )
        )
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

export const getCarByMakeAndModel = async (
  make: string,
  model: string
): Promise<CarModel | null> => {
  try {
    const cleanMake = decodeURIComponent(make).toLowerCase();
    const cleanModel = decodeURIComponent(model);

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
          image_path,
          summary,
          car_generation_engines (
            power,
            torque,
            displacement,
            years,
            engines (
              engine_code,
              id,
              class_id
            )
          ),
          car_generation_engine_classes (
            power,
            torque,
            displacement,
            years,
            engine_classes (
              id,
              model
            )
          )
        ),
        car_makes!inner (
          id,
          name
        )
      `
      )
      .ilike("car_makes.name", cleanMake)
      .ilike("name", cleanModel)
      .single();

    if (error) return null;
    return data as CarModel;
  } catch (error) {
    console.log("Error in getCarByMakeAndModel:", error);
    return null;
  }
};
