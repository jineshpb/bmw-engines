import { EngineSearch } from "@/components/EngineSearch";
import {
  getEngineClassSummary,
  getEnginesByClass,
  searchEngineConfigurations,
} from "@/services/engines";
import EngineClassCard from "@/components/EngineClassCard";
import { Separator } from "@/components/ui/separator";
import { EngineConfiguration } from "@/types/engines";
import EngineCard from "@/components/EngineCard";

export default async function EnginesPage({
  searchParams,
}: {
  searchParams: { query?: string; class?: string };
}) {
  const selectedClass = searchParams.class || "all";
  const searchQuery = searchParams.query;

  const engineConfigurations = searchQuery
    ? await searchEngineConfigurations(searchQuery)
    : await getEnginesByClass(selectedClass);

  const engineClassSummary = await getEngineClassSummary();

  const selectedClassDetails =
    selectedClass !== "all"
      ? engineClassSummary.find((ec) => ec.id === selectedClass)
      : null;

  return (
    <div className="min-h-screen w-full flex flex-col">
      <div className="flex justify-between items-center mt-10">
        <h1 className="text-3xl font-bold">All engines</h1>
        <EngineSearch defaultQuery={searchParams.query || ""} />
      </div>

      <div className="mt-10">{/* <EngineClassSelector /> */}</div>
      {selectedClassDetails && (
        <div className="mt-6">
          <EngineClassCard engineClass={selectedClassDetails} />
        </div>
      )}
      <div className="w-full mt-6">
        <Separator />
      </div>
      <h2 className="text-xl font-bold mt-6">
        Various Configurations{" "}
        {selectedClassDetails && <span> of {selectedClassDetails.model}</span>}
      </h2>

      <p className="text-muted-foreground text-sm mt-2">
        Here you can find all the configurations for the selected engine class.
      </p>
      <div className="w-full mt-10"></div>
      {engineConfigurations.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-muted-foreground">
            No engine configurations found
          </p>
        </div>
      ) : (
        <div className="grid w-full  lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
          {engineConfigurations
            ?.filter((e): e is EngineConfiguration => !!e.id)
            .map((engine, index) => (
              <EngineCard key={index} engineConfigurations={engine} />
            ))}
        </div>
      )}
    </div>
  );
}
