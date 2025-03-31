"use client";

import { ConfigProvider } from "antd";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ConfigProvider>
      <div className="min-h-screen bg-gray-50">{children}</div>
    </ConfigProvider>
  );
}
