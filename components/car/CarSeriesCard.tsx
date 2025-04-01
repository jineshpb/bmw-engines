"use client";

import Image from "next/image";
import supabase from "@/lib/supabaseClient";
import Link from "next/link";
import { CarGeneration } from "@/types/cars";
import KeyValuePair from "../KeyValuePair";
import { useMemo } from "react";
// import { encodeURIComponent } from "url";

interface CarSeriesCardProps {
  car: {
    make: string;
    model: string;
    model_year: string;
    summary: string;
    image_path?: string | null;
    car_generations: CarGeneration[];
  };
}

export default function CarSeriesCard({ car }: CarSeriesCardProps) {
  // console.log("@@car image path", car);

  const imageUrl = useMemo(() => {
    if (!car.image_path) {
      console.log("No image path provided, using placeholder");
      return "/placeholder-car.jpg";
    }

    // Check if it's a Wikipedia URL
    if (car.image_path.startsWith("//") || car.image_path.startsWith("http")) {
      const fullUrl = car.image_path.startsWith("//")
        ? `https:${car.image_path}`
        : car.image_path;
      console.log("Using direct URL:", fullUrl);
      return fullUrl;
    }

    try {
      // For Supabase storage URLs
      const { data } = supabase.storage
        .from("car-images")
        .getPublicUrl(car.image_path);

      console.log("Image path:", car.image_path);
      console.log("Generated public URL:", data?.publicUrl);

      if (!data?.publicUrl) {
        console.log("No public URL generated, using placeholder");
        return "/placeholder-car.jpg";
      }

      return data.publicUrl;
    } catch (error) {
      console.error("Error generating public URL:", error);
      return "/placeholder-car.jpg";
    }
  }, [car.image_path]);

  return (
    <Link
      href={`/cars/${car.make.toLowerCase()}/${encodeURIComponent(car.model)}`}
      className="hover:bg-gray-50"
    >
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden max-w-2xl h-full hover:shadow-md transition-shadow">
        {/* Image */}
        <div className="relative h-48 w-full">
          <Image
            src={imageUrl}
            alt={`${car.make} ${car.model}`}
            fill
            className="object-cover"
            priority
            onError={(e) => {
              console.error("Image load error:", e);
              const img = e.target as HTMLImageElement;
              img.src = "/placeholder-car.jpg";
            }}
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
