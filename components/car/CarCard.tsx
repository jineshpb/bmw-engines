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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import Link from "next/link";

import { CarGeneration } from "@/types/cars";

import GenerationCard from "./GenerationCard";
import { MingcuteCarLine } from "@/lib/icons/iconify/MingcuteCarLine";
import KeyValuePair from "../KeyValuePair";
import { Icon, InlineIcon } from "@iconify/react";

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
  const [showAllGenerations, setShowAllGenerations] = useState(false);
  const isLongText = car.summary.length > 250;
  const hasMoreGenerations = car.car_generations.length > 3;

  const {
    data: { publicUrl },
  } = supabase.storage.from("car-images").getPublicUrl(car.image_path || "");

  const previewGenerations = car.car_generations.slice(0, 3);

  return (
    <Link
      href={`/cars/${encodeURIComponent(
        car.make.toLowerCase()
      )}/${encodeURIComponent(car.model.toLowerCase())}`}
    >
      <div className="bg-white rounded-lg shadow-md overflow-hidden max-w-2xl hover:shadow-lg transition-shadow">
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

          {/* Generations Preview */}
          <div className="">
            <h3 className="text-lg font-semibold text-gray-800 mb-1">
              Generations and engines
            </h3>
            <div className="flex items-center  mt-2 gap-4">
              <KeyValuePair
                label="Generations"
                value={car.car_generations.length.toString()}
                icon={
                  <InlineIcon icon="mingcute:car-line" width={28} height={28} />
                }
              />
              <KeyValuePair
                label="Engines"
                value={car.car_generations.length.toString()}
                icon={<Icon icon="ph:engine" width={28} height={28} />}
              />
            </div>

            <div className="space-y-2">
              {previewGenerations.map((generation) => (
                <GenerationCard key={generation.id} generation={generation} />
              ))}

              {hasMoreGenerations && (
                <Sheet>
                  <SheetTrigger asChild>
                    <Button
                      variant="link"
                      size="sm"
                      className="text-sm p-0 mt-2"
                    >
                      View All {car.car_generations.length} Generations
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-full sm:max-w-xl">
                    <SheetHeader>
                      <SheetTitle>{car.model} Generations</SheetTitle>
                    </SheetHeader>
                    <div className="mt-6 space-y-4">
                      {car.car_generations.map((generation) => (
                        <GenerationCard
                          key={generation.id}
                          generation={generation}
                          expanded
                        />
                      ))}
                    </div>
                  </SheetContent>
                </Sheet>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
