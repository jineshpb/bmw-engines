"use client";

import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EngineClassSummary } from "@/types/engines";

interface EngineClassSelectorProps {
  engineSummary: EngineClassSummary[] | undefined;
  defaultValue: string;
}

export function EngineClassSelector({
  engineSummary,
  defaultValue,
}: EngineClassSelectorProps) {
  const router = useRouter();

  if (!engineSummary) return null;

  const handleValueChange = (value: string) => {
    router.push(`/engines?class=${value}`);
  };

  return (
    <Select defaultValue={defaultValue} onValueChange={handleValueChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select class" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Classes</SelectItem>
        {engineSummary.map((engineClass) => (
          <SelectItem key={engineClass.id} value={engineClass.id}>
            <div className="flex w-full justify-between">
              <span>{engineClass.model}</span>
              <span className="text-muted-foreground">
                {engineClass.engineCount} engines
              </span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
