import type { DataNode } from "antd/es/tree";
import type { CarPayload, GenerationModel, EngineDetail } from "@/types/cars";

export function formatDataForTree(carData: CarPayload[]): DataNode[] {
  return [
    {
      title: "BMW",
      key: "bmw",
      children: carData.map((car) => ({
        title: car.model,
        key: car.model,
        children: car.data?.models?.map((model: GenerationModel) => ({
          title: model.model,
          key: `${car.model}-${model.model}`,
          children: model.engine_details?.map(
            (engine: EngineDetail, index: number) => ({
              title: `${engine.model} (${engine.years})`,
              key: `${car.model}-${model.model}-${index}`,
              isLeaf: true,
            })
          ),
        })),
      })),
    },
  ];
}
