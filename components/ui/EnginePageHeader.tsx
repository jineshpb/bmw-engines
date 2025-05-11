// components/PageHeader.tsx
"use client";

import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";

interface PageHeaderProps {
  title: string;
  showClear: boolean;
}

export function PageHeader({ title, showClear }: PageHeaderProps) {
  const router = useRouter();

  return (
    <div className="flex items-center gap-3">
      <h1 className="text-3xl font-bold">{title}</h1>
      {showClear && (
        <Button
          variant="ghost"
          size="sm"
          className="h-8"
          onClick={() => router.push("/engines")}
        >
          <X className="h-4 w-4" />
          Clear search
        </Button>
      )}
    </div>
  );
}
