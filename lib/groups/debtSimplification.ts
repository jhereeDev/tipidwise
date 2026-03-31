export interface Balance {
  userId: string;
  displayName: string;
  amount: number; // positive = is owed, negative = owes
}

export interface Settlement {
  from: { userId: string; displayName: string };
  to: { userId: string; displayName: string };
  amount: number;
}

/**
 * Simplifies debts by minimizing the number of transactions.
 * Uses a greedy algorithm: match largest creditor with largest debtor.
 */
export function simplifyDebts(balances: Balance[]): Settlement[] {
  const settlements: Settlement[] = [];

  // Separate into creditors (positive) and debtors (negative)
  const creditors = balances
    .filter((b) => b.amount > 0.01)
    .map((b) => ({ ...b }))
    .sort((a, b) => b.amount - a.amount);

  const debtors = balances
    .filter((b) => b.amount < -0.01)
    .map((b) => ({ ...b, amount: Math.abs(b.amount) }))
    .sort((a, b) => b.amount - a.amount);

  let ci = 0;
  let di = 0;

  while (ci < creditors.length && di < debtors.length) {
    const creditor = creditors[ci];
    const debtor = debtors[di];
    const amount = Math.min(creditor.amount, debtor.amount);

    if (amount > 0.01) {
      settlements.push({
        from: { userId: debtor.userId, displayName: debtor.displayName },
        to: { userId: creditor.userId, displayName: creditor.displayName },
        amount: Math.round(amount * 100) / 100,
      });
    }

    creditor.amount -= amount;
    debtor.amount -= amount;

    if (creditor.amount < 0.01) ci++;
    if (debtor.amount < 0.01) di++;
  }

  return settlements;
}

/**
 * Calculate net balances for each member in a group.
 * Positive = is owed money, Negative = owes money.
 */
export function calculateBalances(
  members: { userId: string; displayName: string }[],
  expenses: { paidBy: string; splits: { userId: string; amount: number; is_settled?: boolean }[] }[],
  existingSettlements: { fromUser: string; toUser: string; amount: number }[]
): Balance[] {
  const balanceMap = new Map<string, number>();

  // Initialize all members
  for (const m of members) {
    balanceMap.set(m.userId, 0);
  }

  // Process expenses
  for (const expense of expenses) {
    for (const split of expense.splits) {
      if (!split.is_settled) {
        // The payer is owed this amount
        balanceMap.set(expense.paidBy, (balanceMap.get(expense.paidBy) ?? 0) + split.amount);
        // The split person owes this amount
        balanceMap.set(split.userId, (balanceMap.get(split.userId) ?? 0) - split.amount);
      }
    }
  }

  // Process settlements
  for (const s of existingSettlements) {
    balanceMap.set(s.fromUser, (balanceMap.get(s.fromUser) ?? 0) + s.amount);
    balanceMap.set(s.toUser, (balanceMap.get(s.toUser) ?? 0) - s.amount);
  }

  return members.map((m) => ({
    userId: m.userId,
    displayName: m.displayName,
    amount: Math.round((balanceMap.get(m.userId) ?? 0) * 100) / 100,
  }));
}
