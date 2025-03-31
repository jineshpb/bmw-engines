"use client";

import { Tree, Spin } from "antd";
import type { DataNode } from "antd/es/tree";
import { useEffect, useState } from "react";
import { formatDataForTree } from "./utils/formatters";

export default function AdminPage() {
  const [treeData, setTreeData] = useState<DataNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCarData = async () => {
      try {
        const response = await fetch("/api/admin/cars");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        const formattedData = formatDataForTree(data);
        setTreeData(formattedData);
      } catch (error) {
        console.error("Error fetching car data:", error);
        setError(
          error instanceof Error ? error.message : "Failed to fetch data"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCarData();
  }, []);

  if (error) {
    return <div className="p-6 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">BMW Engine Configurator Admin</h1>
      <div className="flex gap-6">
        <div className="w-1/3">
          {loading ? (
            <div className="flex justify-center">
              <Spin size="large" />
            </div>
          ) : (
            <Tree
              treeData={treeData}
              showLine
              showIcon
              defaultExpandedKeys={["bmw"]}
            />
          )}
        </div>
        <div className="w-2/3">{/* Details panel will go here */}</div>
      </div>
    </div>
  );
}
