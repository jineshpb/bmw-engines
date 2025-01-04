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
  if (!engineSummary) return null;

  return (
    <Select defaultValue={defaultValue}>
      <SelectTrigger className="w-[280px]">
        <SelectValue placeholder="Select engine class" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Classes</SelectItem>
        {engineSummary.map((engineClass: EngineClassSummary) => (
          <SelectItem
            key={engineClass.id}
            value={engineClass.id}
            className="!pr-4"
          >
            <div className="flex w-full justify-between">
              <span>{engineClass.model} </span>{" "}
              <span className="text-muted-foreground">
                - {engineClass.engineCount} engines
              </span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
