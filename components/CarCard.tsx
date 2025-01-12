"use client";
import React from "react";
import Image from "next/image";
import supabase from "@/lib/supabaseClient";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import EngineClassCard from "@/components/EngineClassCard";

interface EngineClass {
  id: string;
  model: string;
  notes: string | null;
  image_path: string | null;
}

interface Generation {
  id: string;
  name: string;
  start_year: number;
  end_year: string | null;
  chassis_code: string[];
  car_generation_engine_classes: {
    engine_classes: EngineClass;
  }[];
}

interface CarCardProps {
  car: {
    make: string;
    model: string;
    model_year: string;
    summary: string;
    image_path?: string | null;
    car_generations: Generation[];
  };
}

export default function CarCard({ car }: CarCardProps) {
  console.log("car", car.car_generations[0].car_generation_engine_classes);

  const {
    data: { publicUrl },
  } = supabase.storage.from("car-images").getPublicUrl(car.image_path || "");

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden max-w-2xl">
      {/* Image */}
      <div className="relative h-48 w-full">
        <Image
          src={publicUrl || "/placeholder-car.jpg"}
          alt={`${car.make} ${car.model}`}
          fill
          className="object-cover"
          priority
        />
      </div>

      <div className="p-6">
        {/* Header */}
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-gray-800">{car.model}</h2>
          <p className="text-sm text-gray-600">{car.model_year}</p>
        </div>

        {/* Summary */}
        <p className="text-gray-700 mb-6">{car.summary}</p>

        {/* Generations List */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">Generations</h3>
          <div className="divide-y divide-gray-200">
            {car.car_generations.map((gen) => (
              <div key={gen.id} className="py-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-gray-800">{gen.name}</h4>
                    <p className="text-sm text-gray-600">
                      {gen.start_year} - {gen.end_year}
                    </p>
                  </div>
                  <div className="text-right w-auto">
                    {gen.car_generation_engine_classes?.[0]?.engine_classes ? (
                      <Sheet>
                        <SheetTrigger className="text-sm text-gray-600 hover:text-gray-900">
                          Engine:{" "}
                          {gen.car_generation_engine_classes?.[0]
                            ?.engine_classes?.model || "N/A"}
                        </SheetTrigger>
                        <SheetContent className="w-fit max-w-[500px] sm:max-w-[600px]">
                          <SheetHeader>
                            <SheetTitle>Engine Details</SheetTitle>
                          </SheetHeader>
                          <div className="mt-4 space-y-4">
                            <EngineClassCard
                              key={
                                gen.car_generation_engine_classes?.[0]
                                  ?.engine_classes?.id
                              }
                              engineClass={{
                                ...gen.car_generation_engine_classes?.[0]
                                  ?.engine_classes,
                                engineCount: 0,
                                configurations: {
                                  total: 0,
                                  derived: 0,
                                  original: 0,
                                },
                              }}
                            />
                          </div>
                        </SheetContent>
                      </Sheet>
                    ) : (
                      <p className="text-sm text-gray-600">N/A</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
