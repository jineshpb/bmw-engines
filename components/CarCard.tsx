"use client";
import React from "react";
import Image from "next/image";
import supabase from "@/lib/supabaseClient";

interface Generation {
  name: string;
  start_year: number;
  end_year: string | number;
  chassis_code: string;
  engine_id: string;
}

interface CarModel {
  make: string;
  model: string;
  model_year: string;
  summary: string;
  image_path?: string | null;
  data: Generation[];
}

const CarCard = ({ car }: { car: CarModel }) => {
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
            {car.data.map((gen) => (
              <div key={gen.chassis_code} className="py-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-gray-800">{gen.name}</h4>
                    <p className="text-sm text-gray-600">
                      {gen.start_year} - {gen.end_year}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">
                      Engine: {gen.engine_id || "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarCard;
