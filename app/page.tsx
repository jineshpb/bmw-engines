// app/page.tsx

import { getCarModels } from "@/services/cars";
import CarCard from "@/components/CarCard";

export default async function Page() {
  const carModels = await getCarModels();

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {carModels.map((model) => (
        <CarCard
          key={model.id}
          car={{
            make: model.car_makes.name,
            model: model.name,
            model_year: model.model_year,
            summary: model.summary,
            image_path: model.image_path,
            data: model.car_generations.map((gen) => ({
              name: gen.name,
              start_year: gen.start_year,
              end_year: gen.end_year || "present",
              chassis_code: gen.chassis_code,
              engine_id: gen.engine_configuration_id || "N/A",
            })),
          }}
        />
      ))}
    </div>
  );
}
