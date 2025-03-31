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

export const getCarModelsByEngineClass = async (
  engineClassId: string
): Promise<CarModel[]> => {
  try {
    // Return early if "all" is selected
    if (engineClassId === "all") {
      return [];
    }

    const { data, error } = await supabase
      .from("car_models")
      .select(
        `
        id,
        name,
        model_year,
        image_path,
        summary,
        car_makes (
          name
        ),
        car_generations!inner (
          car_generation_engine_classes!inner (
            engine_classes!inner (
              id
            )
          )
        )
      `
      )
      .eq(
        "car_generations.car_generation_engine_classes.engine_classes.id",
        engineClassId
      );

    if (error) {
      console.error("Error fetching car models by engine:", error);
      return [];
    }

    return data as unknown as CarModel[];
  } catch (error) {
    console.error("Error in getCarModelsByEngineClass:", error);
    return [];
  }
};

export const updateCarModelImagePath = async (
  modelId: string,
  imagePath: string
): Promise<boolean> => {
  try {
    // First check if image exists in storage
    const { data: storageData } = await supabase.storage
      .from("car-images")
      .getPublicUrl(imagePath);
    if (!storageData) {
      console.error("Storage error: No storage data found");
      return false;
    }

    // If image exists, update the car_models table
    const { error: updateError } = await supabase
      .from("car_models")
      .update({ image_path: storageData.publicUrl })
      .eq("id", modelId);

    if (updateError) {
      console.error("Update error:", updateError);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error in updateCarModelImagePath:", error);
    return false;
  }
};

// Usage in your webhook or API route:
export const syncCarModelImages = async (modelId: string): Promise<void> => {
  try {
    const { data: model, error } = await supabase
      .from("car_models")
      .select("id, image_path")
      .eq("id", modelId)
      .single();

    if (error || !model) {
      console.error("Error fetching model:", error);
      return;
    }

    // If image_path is null, try to update it
    if (!model.image_path) {
      await updateCarModelImagePath(model.id, `models/${model.id}.jpg`);
    }
  } catch (error) {
    console.error("Error in syncCarModelImages:", error);
  }
};
