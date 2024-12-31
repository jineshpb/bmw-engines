import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const engineMapping = {
  engineType: {
    M: "Standard engine",
    N: "New gen engine",
    B: "Modular engine",
    S: "BMW M GmbH road car engine",
    P: "BMW Motorsport racing engine",
    W: "Engine shared with other manufacturers",
  },
  cylinderCount: {
    "3": "3 cylinder inline",
    "4": "4 cylinder inline",
    "5": "6 cylinder inline",
    "6": "8 cylinder inline",
    "8": "10 cylinder inline",
  },
  derivation: {
    "6": "SULEV turbo valvetronic",
    "8": " Turbo valvetronic direct injection",
    "0": "Original engine concept",
  },
  engineMounting: {
    a: "transverse mounted",
    b: "longitudinal mounted",
    k: "transverse mid mounted",
  },
  engineDisplacement: {
    "12": "1.5 liter",
    "20": "2.0 liter",
    "30": "3.0 liter",
    "44": "4.4 liter",
  },
  engineTuningState: {
    k: "lowest performance",
    u: "lower performance",
    m: "middle performance",
    o: "upper performance",
    t: "top performance",
    s: "super performance",
  },
  revision: {
    "0": "new development",
    "1": "first revision",
    "2": "second revision",
  },
};

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
