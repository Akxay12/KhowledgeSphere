/**
 * Helper to convert ENUM values (e.g., "RESEARCH_PAPER", "ARTIFICIAL_INTELLIGENCE")
 * to human-readable strings (e.g., "Research Paper", "Artificial Intelligence").
 * Returns "General" if null/undefined.
 */
export function formatEnumToLabel(enumVal) {
  if (!enumVal || typeof enumVal !== 'string') return "General";
  return enumVal
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Helper to convert human-readable strings (e.g., "Research Paper", "Artificial Intelligence")
 * to uppercase backend ENUM values (e.g., "RESEARCH_PAPER", "ARTIFICIAL_INTELLIGENCE").
 */
export function formatLabelToEnum(label) {
  if (!label || typeof label !== 'string') return "";
  return label.toUpperCase().trim().replace(/\s+/g, '_');
}
