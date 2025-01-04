import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EngineClassSummary } from "@/types/engines";
import Image from "next/image";

interface EngineClassCardProps {
  engineClass: EngineClassSummary;
}

export default function EngineClassCard({ engineClass }: EngineClassCardProps) {
  // console.log("engineClass", engineClass);

  return (
    <Card className=" w-full">
      <CardHeader className="flex flex-row justify-between w-full items-center p-4">
        <div className="flex items-center gap-2">
          <Image
            src="/icons/engine.svg"
            alt={engineClass.model}
            width={20}
            height={20}
          />
          <CardTitle className="text-lg">{engineClass.model}</CardTitle>
        </div>
      </CardHeader>

      <CardContent className="px-4">
        <div className="flex flex-col gap-2 text-sm">
          <div>
            <span className="text-gray-500">Engines: </span>
            {engineClass.engineCount}
          </div>
          <div className="text-sm text-gray-600">
            {engineClass.configurations.total} configurations
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
