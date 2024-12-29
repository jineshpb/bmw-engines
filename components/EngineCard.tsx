// components/EngineCard.js
import { Engine } from "../services/engines";

export default function EngineCard({ engine }: { engine: Engine }) {
  return (
    <div className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
      <h2 className="text-2xl font-semibold">{engine.engine_code}</h2>
      <p className="mt-2 text-gray-600">
        <strong>Displacement:</strong> {engine.displacement}
      </p>
      <p className="mt-1 text-gray-600">
        <strong>Power:</strong> {engine.power}
      </p>
      <p className="mt-1 text-gray-600">
        <strong>Torque:</strong> {engine.torque}
      </p>
      <p className="mt-1 text-gray-600">
        <strong>Years:</strong> {engine.years}
      </p>
    </div>
  );
}
