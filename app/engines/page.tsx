import EngineCard from "@/components/EngineCard";
import { EngineClassSelector } from "@/components/EngineClassSelector";

import { getEngineClassSummary, getEnginesByClass } from "@/services/engines";
import EngineClassCard from "@/components/EngineClassCard";
import { Separator } from "@/components/ui/separator";

export default async function EnginesPage({
  searchParams,
}: {
  searchParams: { class?: string };
}) {
  const selectedClass = searchParams.class || "all";
  const engineConfigurations = await getEnginesByClass(selectedClass);
  const engineClassSummary = await getEngineClassSummary();

  const selectedClassDetails =
    selectedClass !== "all"
      ? engineClassSummary.find((ec) => ec.id === selectedClass)
      : null;

  // console.log("selectedClassDetails", selectedClassDetails);

  return (
    <div className="min-h-screen w-full flex flex-col ">
      <div className="mt-10">
        <EngineClassSelector
          engineSummary={engineClassSummary}
          defaultValue={selectedClass}
        />
      </div>
      {selectedClassDetails && (
        <div className="mt-6">
          <EngineClassCard engineClass={selectedClassDetails} />
        </div>
      )}
      <div className="w-full mt-6">
        <Separator />
      </div>
      <h2 className="text-2xl font-bold mt-6">
        Various Configurations{" "}
        {selectedClassDetails && <span> of {selectedClassDetails.model}</span>}
      </h2>

      <p className="text-muted-foreground text-sm mt-2">
        Here you can find all the configurations for the selected engine class.
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
              <EngineCard key={index} engineConfigurations={engine} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
