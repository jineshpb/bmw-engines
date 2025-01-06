import React from "react";

function KeyValuePair({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-muted-foreground text-sm">{label}</span>
      <span className="text-md text-gray-900 font-semibold">
        {value === "0" ? "--" : value}
      </span>
    </div>
  );
}

export default KeyValuePair;
