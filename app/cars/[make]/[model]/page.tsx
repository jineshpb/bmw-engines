import Image from "next/image";
import { notFound } from "next/navigation";
import supabase from "@/lib/supabaseClient";
import { Icon } from "@iconify/react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import GenerationCard from "@/components/car/GenerationCard";
import { getCarByMakeAndModel } from "@/services/cars";
import EngineCard from "@/components/EngineCard";
import { CarGeneration } from "@/types/cars";

// Component to render generation images

// Component to render generation images
const GenerationImages = ({ generations }: { generations: CarGeneration }) => {
  console.log("@@generations", generations);

  let imageUrl = "/placeholder-car.jpg";

  if (generations.image_path) {
    try {
      const {
        data: { publicUrl },
      } = supabase.storage
        .from("car_generation_images")
        .getPublicUrl(generations.image_path);
      imageUrl = publicUrl;

      console.log("@@imageUrl", imageUrl);
    } catch (error) {
      console.error("Error getting image URL:", error);
    }
  }

  return (
    <div className="h-32 relative overflow-hidden">
      <Image
        src={imageUrl}
        alt={generations.name}
        fill
        className="object-cover hover:scale-110 transition-transform"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      />
    </div>
  );
};

export default async function CarPage({
  params,
}: {
  params: Promise<{ make: string; model: string }>;
}) {
  try {
    // First await the params
    const resolvedParams = await params;
    const decodedMake = decodeURIComponent(resolvedParams.make).toLowerCase(); // Normalize case
    const decodedModel = decodeURIComponent(resolvedParams.model);

    // console.log("Page params:", { decodedMake, decodedModel });

    const car = await getCarByMakeAndModel(decodedMake, decodedModel);

    if (!car) {
      console.log("Car not found, redirecting to 404");
      notFound();
    }

    // console.log("@@imageUrl", imageUrl);
    // console.log("@@car", car);

    return (
      <div className="w-full flex flex-col gap-4">
        <div className="w-full flex flex-col  gap-6 p-8">
          {/* Logo container */}
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="w-20 h-20 relative rounded-xl border-2 border-gray-300 overflow-hidden flex-shrink-0">
              <Image
                src={"/beemer_logo.png"}
                alt={"Make Logo"}
                fill
                className="object-contain p-4"
                priority
              />
            </div>

            {/* Text container */}
            <div>
              <h1 className="text-4xl font-bold">{car.name}</h1>
              <p className="text-xl opacity-90">{car.car_makes.name}</p>
            </div>
          </div>
          <div className="max-w-2xl">
            <p className="text-gray-700 leading-relaxed">{car.summary}</p>
          </div>
        </div>

        {/* Hero Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 xl:grid-cols-6">
          {car.car_generations.map((generation) => (
            <GenerationImages key={generation.id} generations={generation} />
          ))}
        </div>

        {/* <div className="relative h-[40vh] rounded-xl overflow-hidden w-full bg-gradient-to-b from-gray-900/70 to-gray-900/30">
          <Image
            src={imageUrl}
            alt={`${car.car_makes.name} ${car.name}`}
            fill
            className="object-cover -z-10 "
            priority
            sizes="100vw"
          />
        </div> */}

        {/* Main Content - full width container */}
        <div className=" w-full">
          <Tabs defaultValue="generations" className="space-y-8">
            <TabsList className=" h-auto">
              <TabsTrigger
                value="generations"
                defaultValue="generations"
                className="flex gap-2"
              >
                <div className="flex items-center gap-2">
                  <Icon
                    icon="mingcute:car-line"
                    className="text-gray-400"
                    width={16}
                    height={16}
                  />
                  <p>Generations</p>
                </div>
                <div className="flex items-center gap-2">
                  <p>{car.car_generations.length.toString()}</p>
                </div>
              </TabsTrigger>
              <TabsTrigger value="engines" className="flex  gap-2">
                <div className="flex items-center gap-2">
                  <Icon
                    icon="ph:engine"
                    width={16}
                    height={16}
                    className="text-gray-400"
                  />
                  <p>Engines</p>
                </div>
                <div className="flex items-center gap-2">
                  <p>
                    {car.car_generations
                      .reduce(
                        (acc, gen) =>
                          acc + (gen.car_generation_engines?.length || 0),
                        0
                      )
                      .toString()}
                  </p>
                </div>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="generations" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
                {car.car_generations.map((generation) => (
                  <GenerationCard key={generation.id} generation={generation} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="engines" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {car.car_generations.map((generation) =>
                  generation.car_generation_engines?.map((engine) => (
                    <EngineCard
                      key={engine.id}
                      engineConfigurations={{
                        ...engine,
                        engine_id: engine.engines.engine_code,
                        is_derived: false,
                        displacement: engine.displacement?.toString() || "",
                        created_at: new Date().toISOString(),
                        power: engine.power || undefined,
                        torque: engine.torque || undefined,
                        years: engine.years || undefined,
                      }}
                    />
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error in CarPage:", error);
    notFound();
  }
}
