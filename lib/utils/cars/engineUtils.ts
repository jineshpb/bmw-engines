export function extractEngineCode(engineString: string): string | null {
  const modernPattern = /[BNS][0-9]{2}[A-Z][0-9]{2}/;
  const modernMatch = engineString.match(modernPattern);
  if (modernMatch) return modernMatch[0];

  const legacyPattern = /[BNS][0-9]{2}/;
  const legacyMatch = engineString.match(legacyPattern);
  if (legacyMatch) return legacyMatch[0];

  console.log(`No engine code found in: ${engineString}`);
  return null;
}
