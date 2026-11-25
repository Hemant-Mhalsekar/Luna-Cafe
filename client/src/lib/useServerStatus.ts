import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api, retryWhileWaking, wakeRetryDelay } from './api';

export type ServerStatus = 'ok' | 'waking' | 'down';

/** How long a health check may take before we tell the visitor the server is starting. */
const SLOW_AFTER_MS = 2500;

/**
 * Pings /api/health once per visit. The free API server sleeps when nobody uses it,
 * so the first request can be slow. Pages can use this to explain the wait instead of looking broken.
 */
export function useServerStatus(): ServerStatus {
  const query = useQuery({
    queryKey: ['health'],
    queryFn: ({ signal }) => api<{ status: string; db: string }>('/health', { signal }),
    retry: retryWhileWaking,
    retryDelay: wakeRetryDelay,
    staleTime: Infinity,
  });

  const [slow, setSlow] = useState(false);
  useEffect(() => {
    if (!query.isPending) return;
    const timer = window.setTimeout(() => setSlow(true), SLOW_AFTER_MS);
    return () => window.clearTimeout(timer);
  }, [query.isPending]);

  if (query.isSuccess) return 'ok';
  if (query.isError) return 'down';
  return slow ? 'waking' : 'ok';
}
