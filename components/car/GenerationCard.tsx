import React from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { GenerationCardProps } from "@/types/cars";
import EngineCard from "@/components/EngineCard";
import { Button } from "../ui/button";
import { ArrowUpRight } from "lucide-react";

export default function GenerationCard({ generation }: GenerationCardProps) {
  console.log(generation);

  return (
    <div className="py-3 flex flex-col">
      <div className="flex flex-col text-gray-600 bg-gray-100 p-2 rounded-md">
        {/* //TODO: image */}
        <h4 className="font-medium text-gray-800 flex gap-2 items-center">
          {generation.name}{" "}
        </h4>
        <div className="flex items-center gap-2">
          <p className="text-sm text-gray-500">
            ({generation.start_year} - {generation.end_year || "Present"})
          </p>
          <p className="text-sm text-gray-500">
            Chassis: {generation.chassis_code.join(", ")}
          </p>
        </div>

        <p className="text-xs  mt-2">{generation.summary}</p>
      </div>
      <div className="flex flex-col mt-4 ">
        <div className="text-sm text-gray-500">Engines</div>
        <div className=" w-full">
          {(generation.car_generation_engines &&
            generation.car_generation_engines.length > 0) ||
          (generation.car_generation_engine_classes &&
            generation.car_generation_engine_classes.length > 0) ? (
            <div>
              <div></div>
              <Sheet>
                <SheetTrigger className="text-sm text-gray-600 hover:text-gray-900 w-full text-left gap-2">
                  <div className="flex flex-col w-full mb-4 ">
                    {generation.car_generation_engines?.map(
                      (engine, index: number) => (
                        <div key={index} className="flex flex-col mt-4 ">
                          <div className="flex justify-between text-purple-600">
                            <div>{engine.engines.engine_code}</div>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </SheetTrigger>
                <SheetContent className="w-fit max-w-[500px] sm:max-w-[600px] flex flex-col">
                  <SheetHeader className="flex-none">
                    <SheetTitle>Engine Details</SheetTitle>
                  </SheetHeader>
                  <div className="mt-4 space-y-4 overflow-y-auto flex-1">
                    {generation.car_generation_engines &&
                      generation.car_generation_engines.length > 0 && (
                        <>
                          <h3 className="font-medium">Specific Engines</h3>
                          <div className="space-y-4">
                            {generation.car_generation_engines.map(
                              (engine, index) => (
                                <EngineCard
                                  key={index}
                                  engineConfigurations={{
                                    engines: {
                                      engine_code: engine.engines.engine_code,
                                    },
                                    years: engine.years || undefined,
                                    engine_id: engine.engines.engine_code,
                                    displacement:
                                      engine.displacement?.toString() ||
                                      undefined,
                                    power: engine.power || undefined,
                                    torque: engine.torque || undefined,
                                    is_derived: false,
                                  }}
                                />
                              )
                            )}
                          </div>
                        </>
                      )}
                  </div>
                </SheetContent>
              </Sheet>
              <div>
                {generation.car_generation_engine_classes?.map(
                  (engineClass, index) => (
                    <div key={index}>
                      <div className="flex justify-between items-center mt-2">
                        <div>{engineClass.engine_classes.model}</div>
                        <Button variant="link" size="sm">
                          <ArrowUpRight className="w-4 h-4 text-gray-300" />
                        </Button>
                      </div>
                      <div className="flex text-xs text-gray-500 mt-1 flex-col">
                        <p>{engineClass.power}</p>
                        <p>{engineClass.torque}</p>
                        <p>{engineClass.displacement}</p>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-600">No engines available</p>
          )}
        </div>
      </div>
    </div>
  );
}
