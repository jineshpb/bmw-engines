import { engineMapping } from "@/lib/utils";

export function extractEngineCode(engineString: string | null): string | null {
  if (!engineString) return null;

  // Match patterns like M40B16, N54B30, B48B20, M10B18, N43B20, B58
  const patterns = [
    // Try full engine codes first
    /[MNS][0-9]{2}[A-Z][0-9]{2}/, // Legacy (M40B16, N54B30, S14B20)
    /[BNS][0-9]{2}[A-Z][0-9]{2}[A-Z]?[0-9]?/, // Modern (B48B20, B37C15U0)

    // Only if no full code found, try basic codes
    /[MNS][0-9]{2}\b/, // Basic (M10, S14)
    /[BNS][0-9]{2}\b/, // Short modern (B48, B58, N54)
  ];

  for (const pattern of patterns) {
    const match = engineString.match(pattern);
    if (match) {
      const code = match[0];
      console.log(`Found engine code ${code} in: ${engineString}`);
      return code;
    }
  }

  console.warn(`No engine code found in: ${engineString}`);
  return null;
}

export function decodeEngineCode(engineCode: string): string {
  const type = engineCode[0] as keyof typeof engineMapping.engineType;
  const cylinders = engineCode[1] as keyof typeof engineMapping.cylinderCount;
  const tech = engineCode[2] as keyof typeof engineMapping.derivation;
  const mount = engineCode[3] as keyof typeof engineMapping.engineMounting;
  const disp = engineCode.slice(
    4,
    6
  ) as keyof typeof engineMapping.engineDisplacement;
  const tune = engineCode[6] as keyof typeof engineMapping.engineTuningState;
  const revision = engineCode[7];

  return `${engineMapping.engineType[type]} ${engineMapping.cylinderCount[cylinders]} with ${engineMapping.derivation[tech]}, ${engineMapping.engineMounting[mount]}, ${engineMapping.engineDisplacement[disp]}, ${engineMapping.engineTuningState[tune]} (revision ${revision})`;
}
