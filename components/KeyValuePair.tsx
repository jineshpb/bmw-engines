import { cn } from "@/lib/utils";
import React from "react";

function KeyValuePair({
  label,
  value,
  icon,
  className,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode; // Changed from ElementType to ReactNode
  className?: string;
}) {
  return (
    <div className={cn("flex gap-2 py-2 items-center", className)}>
      {icon && (
        <div className="flex items-center w-12 h-12 justify-center p-2 text-gray-400 border bg-gray-50 border-gray-200 rounded-xl">
          {icon}
        </div>
      )}
      <div className="flex flex-col gap-0">
        <span className="text-lg text-gray-900 font-semibold">
          {value === "0" ? "--" : value}
        </span>
        <span className="text-muted-foreground text-sm">{label}</span>
      </div>
    </div>
  );
}

export default KeyValuePair;
