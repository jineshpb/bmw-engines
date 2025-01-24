"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import supabase from "@/lib/supabaseClient";

import { CarGeneration } from "@/types/cars";
import EngineCard from "@/components/EngineCard";
import { getEngineConfigurations } from "@/services/engines";
import { EngineConfiguration } from "@/types/engines";

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

function EngineList({
  engines,
}: {
  engines: { engines: { engine_code: string }; years: string | null }[];
}) {
  const [configurations, setConfigurations] = useState<
    Record<string, EngineConfiguration>
  >({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchConfigurations() {
      const configs = await getEngineConfigurations();
      const configMap = configs.reduce((acc, config) => {
        if (config.engines?.engine_code) {
          acc[config.engines.engine_code] = config;
        }
        return acc;
      }, {} as Record<string, EngineConfiguration>);
      setConfigurations(configMap);
      setLoading(false);
    }
    fetchConfigurations();
  }, []);

  if (loading) return <div>Loading engine details...</div>;

  return (
    <div className="space-y-4">
      {engines?.map(({ engines, years }) => (
        <div key={`${engines.engine_code}-${years || "no-years"}`}>
          <EngineCard
            engineConfigurations={
              configurations[engines.engine_code] || {
                engines: { engine_code: engines.engine_code },
                years,
                engine_id: engines.engine_code,
                displacement: null,
                power: null,
                torque: null,
                is_derived: false,
              }
            }
          />
        </div>
      ))}
    </div>
  );
}

export default function CarCard({ car }: CarCardProps) {
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
        <div className="">
          <h3 className="text-lg font-semibold text-gray-800">Generations</h3>
          <div className="divide-y divide-gray-200">
            {car.car_generations.map((generation) => (
              <GenerationCard key={generation.id} generation={generation} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
