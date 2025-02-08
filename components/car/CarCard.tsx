"use client";

import Image from "next/image";
import supabase from "@/lib/supabaseClient";

import Link from "next/link";
import { CarGeneration } from "@/types/cars";
import KeyValuePair from "../KeyValuePair";
// import { encodeURIComponent } from "url";

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
  const {
    data: { publicUrl },
  } = supabase.storage.from("car-images").getPublicUrl(car.image_path || "");

  return (
    <Link
      href={`/cars/${car.make.toLowerCase()}/${encodeURIComponent(car.model)}`}
      className="hover:bg-gray-50"
    >
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden max-w-2xl h-full hover:shadow-md transition-shadow">
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
            <div className="text-2xl font-bold text-gray-800">{car.model}</div>
            <p className="text-sm text-gray-600">{car.model_year}</p>
          </div>

          {/* Summary */}

          <div className="relative h-32 overflow-hidden mask-bottom">
            <p className={`text-gray-700 mb-2 text-sm  text-clamp-5`}>
              {car.summary}
            </p>
          </div>

          {/* Generations Preview */}
          <div>
            <h3 className="text-md font-semibold text-gray-400 mb-1">
              Generations and engines
            </h3>
            <div className="flex items-center  mt-2 gap-6">
              <KeyValuePair
                label="Generations"
                value={car.car_generations.length.toString()}
              />
              <KeyValuePair
                label="Engines"
                value={car.car_generations
                  .reduce(
                    (acc, generation) =>
                      acc + (generation.car_generation_engines?.length || 0),
                    0
                  )
                  .toString()}
              />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
