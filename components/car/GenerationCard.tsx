"use client";

import React from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { GenerationCardEngine, GenerationCardProps } from "@/types/cars";
import EngineCard from "@/components/EngineCard";
import { Button } from "../ui/button";
import { ArrowUpRight } from "lucide-react";
import { useRouter } from "next/navigation";

import Image from "next/image";
import supabase from "@/lib/supabaseClient";
import { EngineConfiguration } from "@/types/engines";

const mapToEngineConfiguration = (
  engine: GenerationCardEngine
): EngineConfiguration => ({
  id: engine.id || "",
  engine_id: engine.engines.engine_code,
  engines: {
    engine_code: engine.engines.engine_code,
  },
  created_at: new Date().toISOString(),
  is_derived: false,
  displacement: engine.displacement?.toString() || "",
  power: engine.power || "",
  torque: engine.torque || "",
  years: engine.years || "",
});

export default function GenerationCard({ generation }: GenerationCardProps) {
  const router = useRouter();

  // console.log("generation", generation);

  const {
    data: { publicUrl },
  } = supabase.storage
    .from("car_generation_images")
    .getPublicUrl(generation.image_path || "");

  // console.log("publicUrl", publicUrl);

  // console.log("@@generation", generation);

  return (
    <div className=" border border-gray-200 rounded-md overflow-hidden">
      <div className="w-full">
        <div className="relative h-48 w-full">
          <Image
            src={publicUrl}
            alt={generation.name}
            fill
            className="object-cover"
            priority
          />
        </div>
        <div className="flex flex-col bg-gray-100 p-2 ">
          <div className="flex justify-between items-start w-full">
            <div className="flex flex-col">
              <h4 className="font-medium text-gray-800 flex  items-center">
                {generation.name}
              </h4>
              <div className="flex  gap-2">
                <p className="text-sm text-gray-500">
                  ({generation.start_year} - {generation.end_year || "Present"})
                </p>
                <p className="text-sm text-gray-500">
                  Chassis: {generation.chassis_code.join(", ")}
                </p>
              </div>
            </div>
          </div>
          <div className="relative">
            <p className={`text-xs mt-2 text-left relative`}>
              {generation.summary}
            </p>
          </div>
        </div>
      </div>

      <div className="mb-2">
        <div className="flex flex-col last:p-4 ">
          <div className="text-sm text-gray-600 text-capitalize">ENGINES</div>
          <p className="text-xs text-gray-500 mt-1">
            This generation had below engines in various configurations and
            markets
          </p>
          <div className=" w-full">
            {(generation.car_generation_engines &&
              generation.car_generation_engines.length > 0) ||
            (generation.car_generation_engine_classes &&
              generation.car_generation_engine_classes.length > 0) ? (
              <div>
                <div className="flex w-full flex-row gap-2">
                  <Sheet>
                    {generation.car_generation_engines &&
                      generation.car_generation_engines.length > 0 && (
                        <div className="border-b border-gray-200 flex-wrap flex gap-x-2 gap-y-1 mt-2 pb-4 w-full">
                          {generation.car_generation_engines?.map(
                            (engine, index: number) => (
                              <div key={index} className="flex flex-col mt-2">
                                <SheetTrigger className="flex border border-purple-300 rounded-lg p-2 w-auto justify-between text-purple-600 text-sm font-medium">
                                  <div>{engine.engines.engine_code}</div>
                                </SheetTrigger>
                                <SheetContent className="w-fit max-w-[500px] sm:max-w-[600px] flex flex-col">
                                  <SheetHeader className="flex-none">
                                    <SheetTitle>Engine Details</SheetTitle>
                                  </SheetHeader>
                                  <div className="mt-4 space-y-4 overflow-y-auto flex-1">
                                    {generation.car_generation_engines &&
                                      generation.car_generation_engines.length >
                                        0 && (
                                        <div className="divide-y divide-gray-200">
                                          <h3 className="font-medium">
                                            Specific Engines
                                          </h3>
                                          <div className="space-y-4">
                                            {generation.car_generation_engines.map(
                                              (engine, index) => (
                                                <EngineCard
                                                  key={index}
                                                  engineConfigurations={mapToEngineConfiguration(
                                                    engine
                                                  )}
                                                />
                                              )
                                            )}
                                          </div>
                                        </div>
                                      )}
                                  </div>
                                </SheetContent>
                              </div>
                            )
                          )}
                        </div>
                      )}
                  </Sheet>
                </div>
                <div className="mt-6">
                  <div className="text-sm text-gray-500 text-capitalize">
                    ENGINE CLASSES
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    This generation was also available in the following engine
                    configurations:
                  </p>
                  {generation.car_generation_engine_classes && (
                    <>
                      {generation.car_generation_engine_classes
                        .slice(0, 2)
                        .map((engineClass, index) => (
                          <div key={index}>
                            <div className="flex justify-between items-center mt-2">
                              <div>{engineClass.engine_classes.model}</div>
                              <Button
                                variant="link"
                                size="sm"
                                onClick={() =>
                                  router.push(
                                    `/engines/${engineClass.engine_classes.id}`
                                  )
                                }
                              >
                                <ArrowUpRight className="w-4 h-4 text-gray-300" />
                              </Button>
                            </div>
                            <div className="flex text-xs text-gray-500 flex-col">
                              <p>{engineClass.power}</p>
                              <p>{engineClass.torque}</p>
                              <p>{engineClass.displacement}</p>
                            </div>
                          </div>
                        ))}

                      {generation.car_generation_engine_classes.length > 2 && (
                        <Sheet>
                          <SheetTrigger asChild>
                            <Button variant="link" size="sm">
                              View{" "}
                              {generation.car_generation_engine_classes.length -
                                2}{" "}
                              more
                            </Button>
                          </SheetTrigger>
                          <SheetContent>
                            <SheetHeader>
                              <SheetTitle>All Engine Classes</SheetTitle>
                            </SheetHeader>
                            <div className="mt-4">
                              {generation.car_generation_engine_classes.map(
                                (engineClass, index) => (
                                  <div key={index} className="mb-4">
                                    <div className="flex justify-between items-center">
                                      <div>
                                        {engineClass.engine_classes.model}
                                      </div>
                                      <Button
                                        variant="link"
                                        size="sm"
                                        onClick={() =>
                                          router.push(
                                            `/engines/${engineClass.engine_classes.id}`
                                          )
                                        }
                                      >
                                        <ArrowUpRight className="w-4 h-4" />
                                      </Button>
                                    </div>
                                    <div className="text-sm text-gray-500">
                                      <p>{engineClass.power}</p>
                                      <p>{engineClass.torque}</p>
                                      <p>{engineClass.displacement}</p>
                                    </div>
                                  </div>
                                )
                              )}
                            </div>
                          </SheetContent>
                        </Sheet>
                      )}
                    </>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-600">No engines available</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
