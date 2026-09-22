/** Commands that can change shared operational data require explicit confirmation. */
export function isMutatingCommand(text: string): boolean {
  const normalized = text.trim().toLowerCase();
  if (/^(?:help|status|summary|progress|dashboard|who\s+is|who's|how\s+many|attendance|roll\s+call|headcount)\b/i.test(normalized)) return false;
  return /^(?:mark|set|update|change|increase|raise|decrease|reduce|add|remove|delete|deactivate|everyone|all\b)/i.test(normalized)
    || /\b(?:present|absent|leave|off)\b.*\b(?:today|yesterday|tomorrow|20\d{2}-\d{2}-\d{2})\b/i.test(normalized)
    || /\b(?:progress|manpower|weather|focus)\b.*(?:to|at|by|=|:)/i.test(normalized);
}
