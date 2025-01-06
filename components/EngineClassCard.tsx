import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import supabase from "@/lib/supabaseClient";
import { EngineClassSummary } from "@/types/engines";
import Image from "next/image";
import KeyValuePair from "./KeyValuePair";

interface EngineClassCardProps {
  engineClass: EngineClassSummary;
}

export default function EngineClassCard({ engineClass }: EngineClassCardProps) {
  console.log("engineClass", engineClass);
  console.log("engineClass type:", typeof engineClass);
  console.log(
    "engineClass keys:",
    engineClass ? Object.keys(engineClass) : "no keys"
  );
  console.log("model:", engineClass?.model);
  console.log("image_path:", engineClass?.image_path);

  const publicUrl = engineClass.image_path
    ? supabase.storage
        .from("engine-images")
        .getPublicUrl(engineClass.image_path).data.publicUrl
    : null;

  return (
    <Card className=" w-[450px]">
      <CardHeader className="flex flex-col  w-full p-4">
        <CardTitle className="text-lg">{engineClass.model}</CardTitle>
      </CardHeader>

      <CardContent className="p-0">
        <div className="flex flex-col gap-2 text-sm">
          <div className="relative w-full h-[200px] overflow-hidden">
            {publicUrl && (
              <Image
                src={publicUrl}
                alt={engineClass.model}
                fill
                className="object-cover"
              />
            )}
          </div>
          <div className="flex flex-col gap-2 px-4 pb-4 pt-2">
            <div className="p-3 bg-gray-100 rounded-md">
              {engineClass.notes && (
                <p className="text-sm">{engineClass.notes}</p>
              )}
            </div>
            <div className="grid grid-cols-3 mt-2 gap-4 w-full ">
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
      </CardContent>
    </Card>
  );
}
