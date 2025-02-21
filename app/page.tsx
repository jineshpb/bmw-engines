// app/page.tsx

import { getCarModels } from "@/services/cars";
import CarSeriesCard from "@/components/car/CarSeriesCard";
import { CarModel } from "@/types/cars";

export default async function Page() {
  const carModels = await getCarModels();

  // console.log("carModels", carModels);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold  mt-10 w-full mx-auto">All cars</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {carModels.map((model: CarModel) => (
          <CarSeriesCard
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
    </div>
  );
}
