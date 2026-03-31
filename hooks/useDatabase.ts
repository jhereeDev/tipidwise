import { useEffect, useState } from 'react';
import { runMigrations } from '../lib/db/migrations';

export function useDatabase(): { ready: boolean; error: string | null } {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      runMigrations();
      setReady(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to initialize database');
    }
  }, []);

  return { ready, error };
}
