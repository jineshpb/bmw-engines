"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EngineClass } from "@/services/engines";

export default function EngineClassSelector({
  engineClasses,
  defaultValue = "all",
}: {
  engineClasses: EngineClass[];
  defaultValue?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  return (
    <Select
      defaultValue={searchParams.get("class") || defaultValue}
      onValueChange={(value) => {
        router.push(`?class=${value}`);
      }}
    >
      <SelectTrigger className="w-[280px]">
        <SelectValue placeholder="Select engine class" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Classes</SelectItem>
        {engineClasses.map((engineClass) => (
          <SelectItem key={engineClass.id} value={engineClass.id}>
            {engineClass.model}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
