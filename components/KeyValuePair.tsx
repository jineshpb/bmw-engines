import React from "react";

function KeyValuePair({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode; // Changed from ElementType to ReactNode
}) {
  return (
    <div className="flex gap-1 py-2 ">
      <div className="flex items-center w-12 h-12 justify-center p-2 text-gray-400  rounded-full">
        {icon}
      </div>
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
