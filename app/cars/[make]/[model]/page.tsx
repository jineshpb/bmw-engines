import Image from "next/image";
import { notFound } from "next/navigation";
import supabase from "@/lib/supabaseClient";
import { Icon } from "@iconify/react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import KeyValuePair from "@/components/KeyValuePair";
import GenerationCard from "@/components/car/GenerationCard";
import { getCarByMakeAndModel } from "@/services/cars";

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

    console.log("Page params:", { decodedMake, decodedModel });

    const car = await getCarByMakeAndModel(decodedMake, decodedModel);

    if (!car) {
      console.log("Car not found, redirecting to 404");
      notFound();
    }

    // Get image URL with error handling
    let imageUrl = "/placeholder-car.jpg";
    if (car.image_path) {
      try {
        const {
          data: { publicUrl },
        } = supabase.storage.from("car-images").getPublicUrl(car.image_path);
        imageUrl = publicUrl;
      } catch (error) {
        console.error("Error getting image URL:", error);
      }
    }

    return (
      <div className="w-full flex flex-col gap-4">
        <div className="w-full flex items-center gap-6 py-8">
          {/* Logo container */}
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
        {/* Hero Section */}
        <div className="relative h-[40vh] rounded-xl overflow-hidden w-full bg-gradient-to-b from-gray-900/70 to-gray-900/30">
          <Image
            src={imageUrl}
            alt={`${car.car_makes.name} ${car.name}`}
            fill
            className="object-cover -z-10 "
            priority
            sizes="100vw"
          />
        </div>
        <div className="">
          <p className="text-gray-700 leading-relaxed">{car.summary}</p>
        </div>

        {/* Stats Bar - full width */}
        <div className="w-full mt-4 border-b">
          <div className=" mx-auto py-4 flex gap-8">
            <KeyValuePair
              label="Generations"
              value={car.car_generations.length.toString()}
              icon={<Icon icon="mingcute:car-line" width={28} height={28} />}
            />
            <KeyValuePair
              label="Total Engines"
              value={car.car_generations
                .reduce(
                  (acc, gen) => acc + gen.car_generation_engines.length,
                  0
                )
                .toString()}
              icon={<Icon icon="ph:engine" width={28} height={28} />}
            />
          </div>
        </div>

        {/* Main Content - full width container */}
        <div className=" w-full">
          <Tabs defaultValue="overview" className="space-y-8">
            <TabsList>
              <TabsTrigger value="generations">Generations</TabsTrigger>
              <TabsTrigger value="engines">Engines</TabsTrigger>
            </TabsList>

            <TabsContent value="generations" className="space-y-4">
              {car.car_generations.map((generation) => (
                <GenerationCard
                  key={generation.id}
                  generation={generation}
                  expanded
                />
              ))}
            </TabsContent>

            <TabsContent value="engines" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {car.car_generations.map((generation) =>
                  generation.car_generation_engines.map((engine) => (
                    <div
                      key={engine.id}
                      className="bg-white rounded-lg p-6 space-y-2"
                    >
                      <h3 className="font-semibold">{engine.name}</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <KeyValuePair
                          label="Power"
                          value={`${engine.power_hp} hp`}
                          icon={<Icon icon="ph:lightning" />}
                        />
                        <KeyValuePair
                          label="Torque"
                          value={`${engine.torque_nm} Nm`}
                          icon={<Icon icon="ph:gauge" />}
                        />
                      </div>
                    </div>
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
