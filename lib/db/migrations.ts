import { getDatabase } from './client';

const MIGRATIONS: Array<{ version: number; sql: string[] }> = [
  {
    version: 1,
    sql: [
      `CREATE TABLE IF NOT EXISTS expenses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        amount REAL NOT NULL CHECK(amount > 0),
        category TEXT NOT NULL,
        date TEXT NOT NULL,
        notes TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )`,
      `CREATE TABLE IF NOT EXISTS income (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        amount REAL NOT NULL CHECK(amount > 0),
        category TEXT NOT NULL,
        date TEXT NOT NULL,
        is_recurring INTEGER NOT NULL DEFAULT 0,
        recurrence_interval TEXT,
        notes TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )`,
      `CREATE TABLE IF NOT EXISTS subscriptions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        amount REAL NOT NULL CHECK(amount > 0),
        billing_cycle TEXT NOT NULL,
        next_due_date TEXT NOT NULL,
        reminder_days_before INTEGER NOT NULL DEFAULT 3,
        is_active INTEGER NOT NULL DEFAULT 1,
        category TEXT NOT NULL,
        notes TEXT,
        notification_id TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )`,
      `CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date)`,
      `CREATE INDEX IF NOT EXISTS idx_income_date ON income(date)`,
      `CREATE INDEX IF NOT EXISTS idx_subscriptions_due ON subscriptions(next_due_date, is_active)`,
    ],
  },
  {
    version: 2,
    sql: [
      `CREATE TABLE IF NOT EXISTS budgets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        category TEXT NOT NULL UNIQUE,
        monthly_limit REAL NOT NULL CHECK(monthly_limit > 0),
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )`,
    ],
  },
  {
    version: 3,
    sql: [
      // Add last_paid_date to track when a subscription was last paid
      `ALTER TABLE subscriptions ADD COLUMN last_paid_date TEXT`,
    ],
  },
  {
    version: 4,
    sql: [
      // Sync support: add remote_id and sync_status to all data tables
      `ALTER TABLE expenses ADD COLUMN remote_id TEXT`,
      `ALTER TABLE expenses ADD COLUMN sync_status TEXT DEFAULT 'pending'`,
      `ALTER TABLE expenses ADD COLUMN deleted_at TEXT`,
      `ALTER TABLE income ADD COLUMN remote_id TEXT`,
      `ALTER TABLE income ADD COLUMN sync_status TEXT DEFAULT 'pending'`,
      `ALTER TABLE income ADD COLUMN deleted_at TEXT`,
      `ALTER TABLE subscriptions ADD COLUMN remote_id TEXT`,
      `ALTER TABLE subscriptions ADD COLUMN sync_status TEXT DEFAULT 'pending'`,
      `ALTER TABLE subscriptions ADD COLUMN deleted_at TEXT`,
      `ALTER TABLE budgets ADD COLUMN remote_id TEXT`,
      `ALTER TABLE budgets ADD COLUMN sync_status TEXT DEFAULT 'pending'`,
      `ALTER TABLE budgets ADD COLUMN deleted_at TEXT`,
    ],
  },
  {
    version: 5,
    sql: [
      // Savings goals
      `CREATE TABLE IF NOT EXISTS savings_goals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        target_amount REAL NOT NULL CHECK(target_amount > 0),
        current_amount REAL NOT NULL DEFAULT 0,
        deadline TEXT,
        category TEXT,
        icon TEXT DEFAULT '🎯',
        is_completed INTEGER NOT NULL DEFAULT 0,
        remote_id TEXT,
        sync_status TEXT DEFAULT 'pending',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )`,
      // User streaks
      `CREATE TABLE IF NOT EXISTS user_streaks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        streak_type TEXT NOT NULL UNIQUE,
        current_count INTEGER NOT NULL DEFAULT 0,
        longest_count INTEGER NOT NULL DEFAULT 0,
        last_logged_date TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )`,
      // Achievements
      `CREATE TABLE IF NOT EXISTS achievements (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        achievement_type TEXT NOT NULL UNIQUE,
        unlocked_at TEXT NOT NULL,
        metadata TEXT
      )`,
    ],
  },
];

export function runMigrations(): void {
  const db = getDatabase();

  // Get current schema version
  const result = db.getFirstSync<{ user_version: number }>('PRAGMA user_version');
  const currentVersion = result?.user_version ?? 0;

  for (const migration of MIGRATIONS) {
    if (migration.version > currentVersion) {
      db.withTransactionSync(() => {
        for (const sql of migration.sql) {
          db.execSync(sql);
        }
        db.execSync(`PRAGMA user_version = ${migration.version}`);
      });
    }
  }
}
