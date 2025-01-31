"use client";

import React from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { CarGeneration, GenerationCardProps } from "@/types/cars";
import EngineCard from "@/components/EngineCard";
import { Button } from "../ui/button";
import { ArrowUpRight } from "lucide-react";
import { useRouter } from "next/navigation";

import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";

interface GenerationCardProps {
  generation: CarGeneration;
  expanded?: boolean;
}

export default function GenerationCard({
  generation,
  expanded = false,
}: GenerationCardProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(expanded);

  return (
    <div className="py-1">
      <Collapsible
        open={isOpen}
        onOpenChange={setIsOpen}
        defaultOpen={expanded}
      >
        <CollapsibleTrigger className="w-full">
          <div className="flex flex-col text-gray-600 bg-gray-100 p-2 rounded-md">
            <div className="flex justify-between items-start w-full">
              <div className="flex flex-col">
                <h4 className="font-medium text-gray-800 flex  items-center">
                  {generation.name}
                </h4>
                <div className="flex  gap-2">
                  <p className="text-sm text-gray-500">
                    ({generation.start_year} -{" "}
                    {generation.end_year || "Present"})
                  </p>
                  <p className="text-sm text-gray-500">
                    Chassis: {generation.chassis_code.join(", ")}
                  </p>
                </div>
              </div>
              {isOpen ? (
                <ChevronUp className="h-5 w-5" />
              ) : (
                <ChevronDown className="h-5 w-5" />
              )}
            </div>
            <div className="relative">
              <p
                className={`text-xs mt-2 text-left relative ${
                  isOpen ? "h-auto" : "h-10 overflow-hidden"
                }`}
              >
                {generation.summary}
              </p>
              <div className="absolute bottom-0 left-0 h-1/2 w-full bg-gradient-to-t from-gray-100 to-transparent "></div>
            </div>
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent className="mb-2">
          <div className="flex flex-col mt-4 px-2 ">
            <div className="text-sm text-gray-500 ">Engines</div>
            <div className=" w-full">
              {(generation.car_generation_engines &&
                generation.car_generation_engines.length > 0) ||
              (generation.car_generation_engine_classes &&
                generation.car_generation_engine_classes.length > 0) ? (
                <div>
                  <Sheet>
                    {generation.car_generation_engines &&
                      generation.car_generation_engines.length > 0 && (
                        <SheetTrigger className="text-sm text-gray-600 hover:text-gray-900 w-full text-left gap-2">
                          {generation.car_generation_engines?.map(
                            (engine, index: number) => (
                              <div key={index} className="flex flex-col mt-4 ">
                                <div className="flex justify-between text-purple-600">
                                  <div>{engine.engines.engine_code}</div>
                                </div>
                              </div>
                            )
                          )}
                        </SheetTrigger>
                      )}
                    <SheetContent className="w-fit max-w-[500px] sm:max-w-[600px] flex flex-col">
                      <SheetHeader className="flex-none">
                        <SheetTitle>Engine Details</SheetTitle>
                      </SheetHeader>
                      <div className="mt-4 space-y-4 overflow-y-auto flex-1">
                        {generation.car_generation_engines &&
                          generation.car_generation_engines.length > 0 && (
                            <div className="divide-y divide-gray-200">
                              <h3 className="font-medium">Specific Engines</h3>
                              <div className="space-y-4">
                                {generation.car_generation_engines.map(
                                  (engine, index) => (
                                    <EngineCard
                                      key={index}
                                      engineConfigurations={{
                                        engines: {
                                          engine_code:
                                            engine.engines.engine_code,
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
                            </div>
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
                      )
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-600">No engines available</p>
              )}
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
