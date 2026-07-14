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
