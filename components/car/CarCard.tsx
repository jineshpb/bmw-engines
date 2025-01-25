"use client";

import Image from "next/image";
import supabase from "@/lib/supabaseClient";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

import { CarGeneration } from "@/types/cars";

import GenerationCard from "./GenerationCard";

interface CarCardProps {
  car: {
    make: string;
    model: string;
    model_year: string;
    summary: string;
    image_path?: string | null;
    car_generations: CarGeneration[];
  };
}

export default function CarCard({ car }: CarCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const isLongText = car.summary.length > 250;

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
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <div className="relative">
            <p
              className={`text-gray-700 mb-2 line-clamp-5 ${
                isLongText && !isExpanded ? "mask-bottom" : ""
              }`}
            >
              {car.summary}
            </p>
            <CollapsibleContent>
              <p className="text-gray-700 mb-2">{car.summary}</p>
            </CollapsibleContent>
            <div className="h-10">
              {" "}
              {/* Consistent height placeholder */}
              {isLongText && (
                <CollapsibleTrigger asChild>
                  <Button variant="link" size="sm" className="text-sm p-0 ">
                    {isExpanded ? "Show Less" : "Read More"}
                  </Button>
                </CollapsibleTrigger>
              )}
            </div>
          </div>
        </Collapsible>

        {/* Generations List */}
        <div className="">
          <h3 className="text-lg font-semibold text-gray-800 mb-1">
            Generations
          </h3>

          {car.car_generations.map((generation) => (
            <GenerationCard key={generation.id} generation={generation} />
          ))}
        </div>
      </div>
    </div>
  );
}
