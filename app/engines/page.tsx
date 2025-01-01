import EngineCard from "@/components/EngineCard";
import EngineClassSelector from "@/components/EngineClassSelector";
import { getEngineConfigurations, getEngineClasses } from "@/services/engines";

export default async function EnginesPage() {
  const engineConfigurations = await getEngineConfigurations();
  const engineClasses = await getEngineClasses();

  return (
    <div className="min-h-screen w-full flex flex-col justify-center">
      <div className="mt-10">
        <EngineClassSelector engineClasses={engineClasses} defaultValue="all" />
      </div>
      <div className="container w-full mt-10">
        <div className="grid w-full grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {engineConfigurations.map((engineConfigurations, index) => (
            <EngineCard
              key={index}
              engineConfigurations={engineConfigurations}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
