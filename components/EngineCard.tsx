// components/EngineCard.js
import Image from "next/image";
import { Engine, EngineConfigurations } from "../services/engines";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { decodeEngineCode } from "@/lib/utils";
import { engineMapping } from "@/lib/utils";
import { RedoIcon } from "lucide-react";

const formatYearRange = (yearRange: string | null) => {
  if (!yearRange) return "N/A";
  return yearRange.endsWith("–") || yearRange.endsWith("-")
    ? `${yearRange} Present`
    : yearRange;
};

export default function EngineCard({
  engineConfigurations,
  engines,
}: {
  engineConfigurations: EngineConfigurations;
  engines: Engine[];
}) {
  // console.log(decodeEngineCode(engine.engine_code));

  return (
    <Card className="font-geist">
      <CardHeader className="flex flex-row justify-between w-full items-center p-4 ">
        <div className="flex items-center gap-2">
          <Image
            src={`/icons/engine.svg`}
            alt={engineConfigurations?.engine_id}
            width={20}
            height={20}
          />
          <CardTitle className="text-lg">{engines[0]?.engine_code}</CardTitle>
        </div>
        <div className="flex items-center gap-2">
          <p className="text-sm text-gray-600">
            {formatYearRange(engineConfigurations?.years ?? null)}
          </p>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-2 px-4">
        <p className="text-sm text-gray-400 bg-gray-100 rounded-md p-2">
          {decodeEngineCode(engines[0]?.engine_code)}
        </p>
        <div className="flex flex-col gap-2 min-w-6 flex-wrap mt-2 ">
          <div className="flex items-center gap-3 text-sm">
            <Image
              src={`/icons/piston.svg`}
              alt="Displacement"
              width={16}
              height={16}
            />
            <span className="">
              {
                engineMapping.cylinderCount[
                  engineConfigurations
                    .engine_id[1] as keyof typeof engineMapping.cylinderCount
                ]
              }
            </span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Image
              src={`/icons/displacement.svg`}
              alt="Displacement"
              width={16}
              height={16}
            />
            <span className="">{engineConfigurations.displacement}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Image
              src={`/icons/power.svg`}
              alt="Power"
              width={16}
              height={16}
            />
            <span className="">{engineConfigurations.power}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <RedoIcon className="w-4 h-4" />
            <span className="">{engineConfigurations.torque}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
