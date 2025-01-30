/**
 * Extracts BMW engine code from engine string description
 * Handles various BMW engine naming conventions:
 * - Modern codes (B48, B58B30O0)
 * - Legacy codes (M30, N63)
 * - Hybrid variants (B38A15M0)
 * - Diesel variants (B47, N47)
 */
export function extractBMWEngineCode(engineString: string): {
  code: string | null;
  engineFamily: string | null;
} {
  // Guard clause for invalid input
  if (!engineString || typeof engineString !== "string") {
    return { code: null, engineFamily: null };
  }

  // Clean and normalize the input string
  const normalizedString = engineString
    .toUpperCase()
    .replace(/[\s\-_]+/g, "") // Remove spaces, hyphens, underscores
    .replace(/[．•·]/g, ".") // Normalize dots
    .replace(/[،٫]/g, ",") // Normalize commas
    .trim();

  // Regular expressions for BMW engine codes
  const patterns = {
    // Modern detailed format (e.g., B38A15M0, B58B30O0)
    modern: /[NBMSW]\d{2}[A-Z]\d{2}[A-Z]\d/,

    // Modern with technical suffix (e.g., B48B20M0, B58B30TÜ1)
    modernTechnical: /[NBMSW]\d{2}[A-Z]\d{2}(?:[A-Z][A-Z0-9])?/,

    // Basic format (e.g., B48, N63, M30)
    basic: /[NBMSW]\d{2}/,

    // Legacy format (e.g., M30B30, N63B44)
    legacy: /[NBMSW]\d{2}[A-Z]\d{2}/,

    // Desperate pattern for finding any engine family
    familyPattern: /[NBMSW]\s*\d\s*\d/,
  };

  try {
    // Always try to extract the engine family first
    let engineFamily: string | null = null;

    // Search for family using all patterns in priority order
    const textToSearch = normalizedString;
    for (const pattern of [
      patterns.modern,
      patterns.modernTechnical,
      patterns.legacy,
      patterns.basic,
      patterns.familyPattern,
    ]) {
      const match = textToSearch.match(pattern);
      if (match) {
        engineFamily = match[0].slice(0, 3).replace(/\s/g, "");
        break;
      }
    }

    // Find the most specific engine code
    let engineCode: string | null = null;

    // Try matching patterns in order of specificity
    const matches = [
      normalizedString.match(patterns.modern),
      normalizedString.match(patterns.modernTechnical),
      normalizedString.match(patterns.legacy),
      normalizedString.match(patterns.basic),
    ].filter(Boolean);

    if (matches.length > 0) {
      engineCode = matches[0]![0];
    }

    return {
      code: engineCode,
      engineFamily: engineFamily,
    };
  } catch (error) {
    console.error("Error parsing engine code:", error);
    return {
      code: null,
      engineFamily: null,
    };
  }
}

/**
 * Example usage with real payloads:
 *
 * "B38A15M0 1.5 L I3 turbo"           -> { code: "B38A15M0", engineFamily: "B38" }
 * "N20B20 2.0 L I4 turbo"             -> { code: "N20B20", engineFamily: "N20" }
 * "B48B20 2.0 L I4 turbo"             -> { code: "B48B20", engineFamily: "B48" }
 * "B58B30O0 3.0 L I6 turbo"           -> { code: "B58B30O0", engineFamily: "B58" }
 * "S55 3.0 L I6 twin turbo"           -> { code: "S55", engineFamily: "S55" }
 * "N63B44T3"                          -> { code: "N63B44T3", engineFamily: "N63" }
 * "M30B30"                            -> { code: "M30B30", engineFamily: "M30" }
 * "B57"                               -> { code: "B57", engineFamily: "B57" }
 */

// Helper function to validate BMW engine code format
export function isValidBMWEngineCode(code: string): boolean {
  if (!code || typeof code !== "string") return false;

  const validPatterns = [
    /^[NBMSW]\d{2}[A-Z]\d{2}[A-Z]\d$/, // Modern full (B38A15M0)
    /^[NBMSW]\d{2}[A-Z]\d{2}[A-Z0-9]$/, // Modern technical (B58B30TÜ1)
    /^[NBMSW]\d{2}[A-Z]\d{2}$/, // Legacy (M30B30)
    /^[NBMSW]\d{2}$/, // Basic (B48)
  ];

  const normalizedCode = code.toUpperCase().trim();
  return validPatterns.some((pattern) => pattern.test(normalizedCode));
}
