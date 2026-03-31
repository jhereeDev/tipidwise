export type SplitType = 'equal' | 'unequal' | 'percentage' | 'shares';

export interface SplitResult {
  userId: string;
  amount: number;
}

/**
 * Split equally among members
 */
export function splitEqual(totalAmount: number, memberIds: string[]): SplitResult[] {
  const count = memberIds.length;
  if (count === 0) return [];

  const perPerson = Math.floor((totalAmount * 100) / count) / 100;
  const remainder = Math.round((totalAmount - perPerson * count) * 100) / 100;

  return memberIds.map((userId, i) => ({
    userId,
    amount: i === 0 ? perPerson + remainder : perPerson,
  }));
}

/**
 * Split by exact amounts (user specifies each person's share)
 */
export function splitUnequal(amounts: { userId: string; amount: number }[]): SplitResult[] {
  return amounts.map(({ userId, amount }) => ({
    userId,
    amount: Math.round(amount * 100) / 100,
  }));
}

/**
 * Split by percentage
 */
export function splitByPercentage(
  totalAmount: number,
  percentages: { userId: string; percentage: number }[]
): SplitResult[] {
  return percentages.map(({ userId, percentage }) => ({
    userId,
    amount: Math.round((totalAmount * percentage) / 100 * 100) / 100,
  }));
}

/**
 * Split by shares (e.g., user A gets 2 shares, user B gets 1 share)
 */
export function splitByShares(
  totalAmount: number,
  shares: { userId: string; shares: number }[]
): SplitResult[] {
  const totalShares = shares.reduce((sum, s) => sum + s.shares, 0);
  if (totalShares === 0) return [];

  const perShare = totalAmount / totalShares;

  return shares.map(({ userId, shares: userShares }) => ({
    userId,
    amount: Math.round(perShare * userShares * 100) / 100,
  }));
}

/**
 * Calculate split based on type
 */
export function calculateSplit(
  type: SplitType,
  totalAmount: number,
  memberIds: string[],
  customData?: { userId: string; value: number }[]
): SplitResult[] {
  switch (type) {
    case 'equal':
      return splitEqual(totalAmount, memberIds);
    case 'unequal':
      return splitUnequal((customData ?? []).map((d) => ({ userId: d.userId, amount: d.value })));
    case 'percentage':
      return splitByPercentage(totalAmount, (customData ?? []).map((d) => ({ userId: d.userId, percentage: d.value })));
    case 'shares':
      return splitByShares(totalAmount, (customData ?? []).map((d) => ({ userId: d.userId, shares: d.value })));
  }
}
