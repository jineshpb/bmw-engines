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
import { getCarModelsByEngineClass } from "@/services/cars";
import CarModelCard from "@/components/car/CarModelCard";
import { PageHeader } from "@/components/ui/EnginePageHeader";
import { Metadata } from "next";
// import { Props } from "next/script";

type PageProps = {
  searchParams: Promise<{ query?: string; class?: string }>;
};

export default async function EnginesPage({ searchParams }: PageProps) {
  // Await searchParams before using it
  const resolvedSearchParams = await searchParams;

  const selectedClass = resolvedSearchParams.class || "all";
  const searchQuery = resolvedSearchParams.query;

  const models = await getCarModelsByEngineClass(selectedClass);

  const engineConfigurations = searchQuery
    ? await searchEngineConfigurations(searchQuery)
    : await getEnginesByClass(selectedClass);

  const engineClassSummary = await getEngineClassSummary();

  const selectedClassDetails =
    selectedClass !== "all"
      ? engineClassSummary.find((ec) => ec.id === selectedClass)
      : null;

  // Create dynamic title based on search params
  const pageTitle = searchQuery
    ? `Search results for "${searchQuery}"`
    : selectedClass !== "all"
    ? `${selectedClassDetails?.model || "Engine Class"}`
    : "All engines";

  const showClearButton = searchQuery || selectedClass !== "all";

  return (
    <div className="min-h-screen w-full flex flex-col">
      <div className="flex flex-col md:flex-row items-start md:justify-between gap-4 md:items-center mt-10">
        <PageHeader title={pageTitle} showClear={!!showClearButton} />
        <EngineSearch defaultQuery={resolvedSearchParams.query || ""} />
      </div>

      <div className="mt-10">{/* <EngineClassSelector /> */}</div>
      {selectedClassDetails && (
        <>
          <div className="mt-6">
            <EngineClassCard engineClass={selectedClassDetails} />
          </div>
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4">
              Models using this engine
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
              {models.map((model) => (
                <CarModelCard key={model.id} model={model} />
              ))}
            </div>
          </div>
          <div className="w-full mt-6">
            <Separator />
          </div>
        </>
      )}

      {selectedClassDetails && (
        <>
          <h2 className="text-xl font-bold mt-6">
            Various Configurations{" "}
            {selectedClassDetails && (
              <span> of {selectedClassDetails.model}</span>
            )}
          </h2>

          <p className="text-muted-foreground text-sm mt-2">
            Here you can find all the configurations for the selected engine
            class.
          </p>
        </>
      )}

      <div className="w-full mt-10"></div>
      {engineConfigurations.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-muted-foreground">
            No engine configurations found
          </p>
        </div>
      ) : (
        <div className="grid w-full  grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
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

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ query?: string; class?: string }>;
}): Promise<Metadata> {
  // Await the searchParams
  const resolvedParams = await searchParams;

  const engineConfigurations = await getEnginesByClass(resolvedParams.class);
  const firstEngine = engineConfigurations[0];

  console.log("@@engineConfigurations", engineConfigurations);

  const title = resolvedParams.query
    ? `Search: ${resolvedParams.query}`
    : resolvedParams.class
    ? `Class: ${resolvedParams.class}`
    : "All Engines";

  const ogImageUrl = new URL(
    "/api/og/engine",
    process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3001"
  );

  const engineClassSummary = await getEngineClassSummary();
  const engineClass = engineClassSummary.find(
    (ec) => ec.id === resolvedParams.class
  );

  if (!engineClass) {
    return {
      title: "Engine Class Not Found",
      description: "The requested engine class could not be found.",
    };
  }

  // console.log("@@engineClass", engineClass);

  ogImageUrl.searchParams.set("engineCode", engineClass.model);
  if (firstEngine) {
    ogImageUrl.searchParams.set("displacement", firstEngine.displacement || "");
    ogImageUrl.searchParams.set("power", firstEngine.power || "");
    ogImageUrl.searchParams.set("torque", firstEngine.torque || "");
    ogImageUrl.searchParams.set("years", firstEngine.years || "");
    ogImageUrl.searchParams.set("description", engineClass.notes || "");
  }
  ogImageUrl.searchParams.set(
    "engineCount",
    engineClass.engineCount.toString()
  );
  ogImageUrl.searchParams.set(
    "configCount",
    engineClass.configurations.total.toString()
  );

  return {
    title,
    description:
      engineClass.notes ||
      `BMW ${engineClass.model} engine class with ${engineClass.engineCount} engines and ${engineClass.configurations.total} configurations.`,
    openGraph: {
      title: engineClass.model,
      description:
        engineClass.notes ||
        `BMW ${engineClass.model} engine class with ${engineClass.engineCount} engines and ${engineClass.configurations.total} configurations.`,
      images: [
        {
          url: ogImageUrl.toString(),
          width: 1200,
          height: 630,
          alt: `${engineClass.model} Engine Class Details`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: engineClass.model,
      description:
        engineClass.notes ||
        `BMW ${engineClass.model} engine class with ${engineClass.engineCount} engines and ${engineClass.configurations.total} configurations.`,
      images: [ogImageUrl.toString()],
    },
  };
}
