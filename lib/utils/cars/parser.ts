export function parseModelYear(modelYear: string): {
  start_year: number | null;
  end_year: string | null;
} {
  // Handle various dash types and clean the input
  const cleanedYear = modelYear
    .replace("–", "-") // Replace em dash with hyphen
    .replace("—", "-") // Replace em dash with hyphen
    .replace(/\s/g, "") // Remove any whitespace
    .replace(/^(\d{2})\//, "19$1/") // Convert "82/" to "1982/"
    .replace(/^(\d{2})-/, "19$1-"); // Convert "82-" to "1982-"

  // Handle dates with months (e.g., "09/2007-10/2011")
  if (cleanedYear.includes("/")) {
    const [start, end] = cleanedYear.split("-");
    return {
      start_year: parseInt(start.split("/")[1]),
      end_year: end ? end.split("/")[1] : null,
    };
  }

  // Handle regular year ranges (e.g., "1981-1983" or "2019-present")
  const [start, end] = cleanedYear.split("-");
  return {
    start_year: parseInt(start) || null,
    end_year: end === "present" ? null : end || null,
  };
}

export function extractChassisCode(generationName: string): string[] {
  // Handle multiple chassis codes separated by slashes
  const codes = generationName.split("/");

  return codes
    .map((code) => {
      // Clean up each code and validate format
      const cleanCode = code.trim();
      if (cleanCode.match(/^[A-Z][0-9]{2}$/)) {
        return cleanCode;
      }
      return null;
    })
    .filter((code): code is string => code !== null);
}

interface EngineCodeResult {
  fullCode: string | null; // e.g., "B48A20M0"
  shortCode: string | null; // e.g., "B48"
}

export function extractEngineCode(engineString: string): EngineCodeResult {
  if (!engineString) {
    return { fullCode: null, shortCode: null };
  }

  // Clean the input string
  const cleanEngine = engineString.toUpperCase();

  // 1. Most specific: Full codes with variant and revision
  // Examples: B48A20M1, N55B30M0, S55B30T0, B37C15U0
  const fullVariantPattern = /\b([BNSM][0-9]{2}[A-Z][0-9]{2}[A-Z][0-9])\b/;

  // 2. Full codes with displacement
  // Examples: B48A20, N55B30, B37C15
  const fullDisplacementPattern = /\b([BNSM][0-9]{2}[A-Z][0-9]{2})\b/;

  // 3. Base engine family - handles both standalone and embedded in text
  // Examples: "B48", "N55", or "2.0 L N47 inline-4"
  const shortPattern = /\b([BNSM][0-9]{2})\b/;

  const fullVariantMatch = cleanEngine.match(fullVariantPattern) || null;
  const fullDisplacementMatch =
    cleanEngine.match(fullDisplacementPattern) || null;
  const shortMatches = cleanEngine.match(shortPattern) || null;

  return {
    fullCode: fullVariantMatch?.at(1) || fullDisplacementMatch?.at(1) || null,
    shortCode: shortMatches?.at(1) || null,
  };
}
