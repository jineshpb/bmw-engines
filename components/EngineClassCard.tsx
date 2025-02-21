import supabase from "@/lib/supabaseClient";
import { EngineClassSummary } from "@/types/engines";
import Image from "next/image";
import KeyValuePair from "./KeyValuePair";

interface EngineClassCardProps {
  engineClass: EngineClassSummary;
}

export default async function EngineClassCard({
  engineClass,
}: EngineClassCardProps) {
  const publicUrl = engineClass.image_path
    ? supabase.storage
        .from("engine-images")
        .getPublicUrl(engineClass.image_path).data.publicUrl
    : null;

  return (
    <div className="flex flex-col md:flex-row border border-gray-200 rounded-md w-full max-w-[1500px] overflow-hidden">
      <div className=" w-full md:w-[30%] md:h-full h-[200px] overflow-hidden">
        {publicUrl && (
          <Image
            src={publicUrl}
            alt={engineClass.model}
            width={1000}
            height={1000}
            className="object-cover w-full h-full"
          />
        )}
      </div>
      <div className="flex flex-col gap-2 px-4 pb-4 pt-2 w-full md:w-[70%]">
        <div className="flex flex-col md:flex-row gap-2 w-full p-4">
          <h2 className="text-lg font-bold">Engine Class</h2>
          <div className="text-lg">{engineClass.model}</div>
        </div>
        <div className="p-3 bg-gray-100 rounded-md">
          {engineClass.notes && <p className="text-sm">{engineClass.notes}</p>}
        </div>
        <div className="grid grid-cols-3 mt-2 gap-4 w-full">
          <KeyValuePair
            label="Engines"
            value={engineClass.engineCount.toString()}
          />
          <KeyValuePair
            label="Configurations"
            value={engineClass.configurations.total.toString()}
          />
          <KeyValuePair
            label="Derived"
            value={engineClass.configurations.derived.toString()}
          />
          <KeyValuePair
            label="Original"
            value={engineClass.configurations.original.toString()}
          />
        </div>
      </div>
    </div>
  );
}
