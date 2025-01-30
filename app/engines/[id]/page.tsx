import EngineCard from "@/components/EngineCard";
import { getEngineClassSummary, getEnginesByClass } from "@/services/engines";
import EngineClassCard from "@/components/EngineClassCard";
import { Separator } from "@/components/ui/separator";
import { notFound } from "next/navigation";
import { EngineConfiguration } from "@/types/engines";

export default async function EngineClassPage({
  params,
}: {
  params: { id: string };
}) {
  const engineClassSummary = await getEngineClassSummary();
  const engineClass = engineClassSummary.find((ec) => ec.id === params.id);
  const engineConfigurations = await getEnginesByClass(params.id);

  if (!engineClass) {
    notFound();
  }

  return (
    <div className="min-h-screen w-full flex flex-col">
      <div className="mt-6">
        <EngineClassCard engineClass={engineClass} />
      </div>

      <div className="w-full mt-6">
        <Separator />
      </div>

      <h2 className="text-2xl font-bold mt-6">
        Various Configurations of {engineClass.model}
      </h2>

      <p className="text-muted-foreground text-sm mt-2">
        Here you can find all the configurations for this engine class.
      </p>

      <div className="container w-full mt-10">
        {engineConfigurations.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-muted-foreground">
              No engine configurations found
            </p>
          </div>
        ) : (
          <div className="grid w-full grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {engineConfigurations?.map((engine, index) => (
              <EngineCard
                key={index}
                engineConfigurations={engine as EngineConfiguration}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
