import EngineCard from "@/components/EngineCard";
import { getEngineClassSummary, getEnginesByClass } from "@/services/engines";
import EngineClassCard from "@/components/EngineClassCard";
import { Separator } from "@/components/ui/separator";
import { notFound } from "next/navigation";
import { EngineConfiguration } from "@/types/engines";
import { Metadata } from "next";

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

type Props = {
  params: { id: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const engineClassSummary = await getEngineClassSummary();
  const engineClass = engineClassSummary.find((ec) => ec.id === params.id);

  console.log("@@params from engine ID", params);

  if (!engineClass) {
    return {
      title: "Engine Class Not Found | BMW Engine Configurator",
      description: "The requested engine class could not be found.",
    };
  }

  // Get the first engine configuration to show in OG image
  const engineConfigurations = await getEnginesByClass(params.id);
  const firstEngine = engineConfigurations[0];

  const baseUrl = process.env.NEXT_PUBLIC_PERSONAL_URL
    ? `https://${process.env.NEXT_PUBLIC_PERSONAL_URL}`
    : "http://localhost:3001";

  // Build the OG image URL with all the data we want to show
  const ogImageUrl = new URL("/api/og/engine", baseUrl);
  ogImageUrl.searchParams.set("engineCode", engineClass.model);
  if (firstEngine) {
    ogImageUrl.searchParams.set("displacement", firstEngine.displacement || "");
    ogImageUrl.searchParams.set("power", firstEngine.power || "");
    ogImageUrl.searchParams.set("torque", firstEngine.torque || "");
    ogImageUrl.searchParams.set("years", firstEngine.years || "");
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
    title: `${engineClass.model} Engine Class | BMW Engine Configurator`,
    description:
      engineClass.notes ||
      `BMW ${engineClass.model} engine class with ${engineClass.engineCount} engines and ${engineClass.configurations.total} configurations.`,
    openGraph: {
      title: `${engineClass.model} Engine Class | BMW Engine Configurator`,
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
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${engineClass.model} Engine Class | BMW Engine Configurator`,
      description:
        engineClass.notes ||
        `BMW ${engineClass.model} engine class with ${engineClass.engineCount} engines and ${engineClass.configurations.total} configurations.`,
      images: [ogImageUrl.toString()],
    },
    alternates: {
      canonical: `/engines/${params.id}`,
    },
  };
}
