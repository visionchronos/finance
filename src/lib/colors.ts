// ── General chart palette (used by pie charts, line charts, etc.) ────────────
export const COLORS = [
  '#4f46e5', // indigo-600
  '#10b981', // emerald-500
  '#f59e0b', // amber-500
  '#ef4444', // red-500
  '#8b5cf6', // violet-500
  '#ec4899', // pink-500
  '#14b8a6', // teal-500
  '#f97316', // orange-500
  '#06b6d4', // cyan-500
  '#84cc16', // lime-500
];

export function getCategoryColor(categoryName: string): string {
  // If it's explicitly an "income" string, use a cool/green color
  if (categoryName.toLowerCase().includes('income') || categoryName.toLowerCase().includes('salary')) {
    return '#10b981'; 
  }
  
  // If it's an account, use indigo/blue
  if (categoryName.toLowerCase().includes('account') || categoryName.toLowerCase().includes('checking') || categoryName.toLowerCase().includes('savings')) {
    return '#4f46e5';
  }

  // Otherwise deterministically pick a color based on string hash
  let hash = 0;
  for (let i = 0; i < categoryName.length; i++) {
    hash = categoryName.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Abs to prevent negative indices
  const index = Math.abs(hash) % COLORS.length;
  return COLORS[index];
}

// ── Sankey-specific palette (Abyssal Finance art direction) ─────────────────
//
// Two hue families only:
//   • Mint (#00FFA3)      — income & savings nodes
//   • Lavender shades     — expense category nodes, one shade per category
//   • White/neutral       — account (Checking) node
//
// The lavender shades are ordered by lightness so each expense category
// gets a visually distinct shade without introducing a new hue.

const LAVENDER_SHADES = [
  '#C4B5FD', // lavender-300
  '#A78BFA', // lavender-400
  '#8B7CF6', // lavender-450
  '#7C6AEF', // lavender-500
  '#6D5DE6', // lavender-550
  '#5E4FDD', // lavender-600
  '#B196FA', // lavender-350
  '#9470F5', // lavender-425
];

const MINT = '#00FFA3';
const NEUTRAL = '#FAFAFA';

/**
 * Deterministic color for a Sankey node based on its type and name.
 * - income / savings → mint
 * - account          → white/neutral
 * - expense          → one of 8 lavender shades, picked by string hash
 */
export function getSankeyNodeColor(
  name: string,
  type: 'income' | 'account' | 'expense'
): string {
  // Income sources and Savings both get mint
  if (type === 'income') return MINT;
  if (name.toLowerCase().includes('savings')) return MINT;

  // The central account node is neutral
  if (type === 'account') return NEUTRAL;

  // Expense categories: deterministic lavender shade from string hash
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return LAVENDER_SHADES[Math.abs(hash) % LAVENDER_SHADES.length];
}
