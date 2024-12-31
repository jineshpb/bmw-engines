// pages/index.js
import { getEngineConfigurations, getEngines } from "../services/engines";
import EngineCard from "../components/EngineCard";
import Image from "next/image";

export default async function Home() {
  const engines = await getEngines();
  const engineConfigurations = await getEngineConfigurations();

  return (
    <div className="min-h-screen w-full flex justify-center">
      <div className="max-w-[1440px] w-full px-20">
        <div className="flex flex-row items-center mt-10 gap-2">
          <div className="flex flex-row items-center justify-center">
            <Image
              src={`/beemer_logo.png`}
              alt="BMW logo"
              width={80}
              height={80}
            />
          </div>
          <div className="flex flex-col">
            <h1 className="text-4xl font-bold">BMW catalog</h1>
            <h2 className="text-xl font-normal text-gray-400">
              Know your BMW engine code
            </h2>
          </div>
        </div>
        <div className="container w-full mt-20">
          <div className="grid w-full grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {engineConfigurations.map((engineConfigurations, index) => (
              <EngineCard
                key={index}
                engineConfigurations={engineConfigurations}
                engines={engines}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
