// app/page.tsx

import { getCarModels } from "@/services/cars";
import CarCard from "@/components/car/CarCard";
import { CarModel } from "@/types/cars";

export default async function Page() {
  const carModels = await getCarModels();

  console.log("carModels", carModels);

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {carModels.map((model: CarModel) => (
        <CarCard
          key={model.id}
          car={{
            make: model.car_makes.name,
            model: model.name,
            model_year: model.model_year,
            summary: model.summary,
            image_path: model.image_path,
            car_generations: model.car_generations,
          }}
        />
      ))}
    </div>
  );
}
