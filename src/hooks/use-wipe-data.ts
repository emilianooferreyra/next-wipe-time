import { useEffect, useState } from 'react';

type WipeData = {
  nextWipe: string;
  lastWipe: string;
  frequency: string;
  source: string;
  scrapedAt: string;
  fromCache?: boolean;
  cacheAge?: number;
  backgroundImage?: string;
  confirmed?: boolean;
  announcement?: string;
  isRelease?: boolean;
};

export function useWipeData(gameId: string) {
  const [data, setData] = useState<WipeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const response = await fetch(`/api/wipes/${gameId}`);

        if (!response.ok) {
          throw new Error(`Failed to fetch data: ${response.statusText}`);
        }

        const result = await response.json();
        setData(result);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
        console.error('Error fetching wipe data:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [gameId]);

  return { data, loading, error };
}
