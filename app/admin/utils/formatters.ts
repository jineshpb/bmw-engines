import type { ReactNode } from "react";
import { createElement } from "react";
import type { DataNode } from "antd/es/tree";
import type { CarPayload, GenerationModel, EngineDetail } from "@/types/cars";
import { Button } from "antd";
import { SyncOutlined } from "@ant-design/icons";

const renderTitle = (
  label: string,
  value: string | number | boolean | null | undefined,
  isImageLink: boolean = false
): ReactNode => {
  if (value === undefined || value === null) {
    return createElement(
      "span",
      { style: { color: "#ff4d4f" } },
      `${label}: Missing`
    );
  }

  if (isImageLink && typeof value === "string") {
    return createElement(
      "span",
      {},
      `${label}: `,
      createElement(
        "a",
        {
          href: value.startsWith("//") ? `https:${value}` : value,
          target: "_blank",
          rel: "noopener noreferrer",
          style: { color: "#1890ff" },
        },
        "View Image"
      )
    );
  }

  return createElement("span", {}, `${label}: ${value}`);
};

const handleFetch = async (model: string) => {
  try {
    const response = await fetch(`/api/admin/crawl/${model}`, {
      method: "POST",
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    // You might want to handle the response or trigger a refresh
  } catch (error) {
    console.error(`Error fetching data for ${model}:`, error);
  }
};

export function formatDataForTree(carData: CarPayload[]): DataNode[] {
  return [
    {
      title: createElement(
        "div",
        { style: { fontSize: "16px", fontWeight: "bold" } },
        "BMW"
      ),
      key: "bmw",
      children: carData.map((car) => ({
        title: createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: "8px" } },
          createElement(
            "div",
            { style: { flex: 1 } },
            createElement(
              "div",
              {
                style: {
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#1f1f1f",
                  marginBottom: "4px",
                },
              },
              car.model
            ),
            createElement(
              "div",
              { style: { fontSize: "12px", color: "#666" } },
              renderTitle("Make", car.make),
              createElement("br"),
              renderTitle("Model Year", car.model_year),
              createElement("br"),
              renderTitle("Engine ID", car.engine_id),
              createElement("br"),
              renderTitle("Chassis Codes", car.chassis_codes?.join(", ")),
              createElement("br"),
              renderTitle("Image", car.image_path, true)
            )
          ),
          createElement(
            Button,
            {
              icon: createElement(SyncOutlined),
              size: "small",
              onClick: (e) => {
                e.stopPropagation();
                handleFetch(car.model);
              },
              style: { marginLeft: "auto" },
            },
            "Fetch"
          )
        ),
        key: car.model,
        children: car.data?.models?.map((model: GenerationModel) => ({
          title: createElement(
            "div",
            { style: { fontSize: "13px" } },
            createElement(
              "div",
              { style: { fontWeight: "500", color: "#2f2f2f" } },
              model.model
            ),
            createElement(
              "div",
              { style: { fontSize: "12px", color: "#666" } },
              renderTitle("Model Year", model.model_year),
              createElement("br"),
              renderTitle("Image", model.image_path, true),
              createElement("br"),
              renderTitle("Summary", model.summary ? "✓" : null)
            )
          ),
          key: `${car.model}-${model.model}`,
          children: model.engine_details?.map(
            (engine: EngineDetail, index: number) => ({
              title: createElement(
                "div",
                { style: { fontSize: "12px", color: "#444" } },
                createElement(
                  "div",
                  { style: { fontWeight: "500" } },
                  `${engine.model} (${engine.years})`
                ),
                createElement(
                  "div",
                  { style: { color: "#666" } },
                  renderTitle("Engine", engine.engine),
                  createElement("br"),
                  renderTitle("Power", engine.power),
                  createElement("br"),
                  renderTitle("Torque", engine.torque)
                )
              ),
              key: `${car.model}-${model.model}-${index}`,
              isLeaf: true,
            })
          ),
        })),
      })),
    },
  ];
}
