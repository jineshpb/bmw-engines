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
  const cleanEngine = engineString.replace(/\s+/g, " ").trim().toUpperCase();

  // Match patterns:
  // Full codes: B48A20M0, N55B30T0, etc.
  // Short codes: B48, N55, etc.
  const fullPattern = /([BNSM][0-9]{2}[A-Z][0-9]{2}[A-Z][0-9])/;
  const shortPattern = /([BNSM][0-9]{2})/;

  const fullMatch = cleanEngine.match(fullPattern);
  const shortMatch = cleanEngine.match(shortPattern);

  return {
    fullCode: fullMatch ? fullMatch[1] : null,
    shortCode: shortMatch ? shortMatch[1] : null,
  };
}
