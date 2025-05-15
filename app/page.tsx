// app/page.tsx

import { Metadata } from "next";
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

export async function generateMetadata(): Promise<Metadata> {
  const allCars = await getCarModels();
  const carCount = allCars.length;

  // Construct absolute URL with all parameters
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3001";
  const ogImageUrl = `${baseUrl}/api/og?type=home&carCount=${carCount}`;

  return {
    title: "BMW Models and Engines Explorer",
    description: `Explore ${carCount} BMW models and their engine configurations.`,
    openGraph: {
      title: "BMW Models and Engines Explorer",
      description: `Explore ${carCount} BMW models and their engine configurations.`,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: "BMW Engine Configurator Home",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "BMW Models and Engines Explorer",
      description: `Explore ${carCount} BMW models and their engine configurations.`,
      images: [ogImageUrl],
    },
    keywords: [
      "BMW",
      "engines",
      "configurations",
      "specifications",
      "models",
      "power output",
      "torque",
      "displacement",
    ],
  };
}
