// pages/index.js
import { getEngines } from "../services/engines";
import EngineCard from "../components/EngineCard";

export default async function Home() {
  const engines = await getEngines();

  console.log(engines);

  return (
    <div className="min-h-screen">
      <div className="container mx-auto py-10">
        <h1 className="text-4xl font-bold text-center mb-10">
          Available BMW Engines
        </h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {engines.map((engine) => (
            <EngineCard key={engine.id} engine={engine} />
          ))}
        </div>
      </div>
    </div>
  );
}
