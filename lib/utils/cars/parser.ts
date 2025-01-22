export function parseModelYear(modelYear: string): {
  start_year: string;
  end_year: string | null;
} {
  const [start, end] = modelYear.split("-");
  return {
    start_year: start,
    end_year: end === "present" ? null : end,
  };
}

export function extractChassisCode(generationName: string): string | null {
  const match = generationName.match(/\(([A-Z][0-9]{2})\)/);
  return match ? match[1] : null;
}
