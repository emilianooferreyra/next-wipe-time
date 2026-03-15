/**
 * Generic AsyncData hook with type-safe state management
 *
 * Provides a discriminated union for async operations,
 * enabling proper type narrowing and eliminating impossible states.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import type { AsyncData } from "@/lib/type-guards";

/**
 * Configuration for useAsyncData hook
 */
export type AsyncDataConfig<T> = {
  /** Initial data (makes state start as success) */
  initialData?: T;
  /** Whether to fetch on mount */
  enabled?: boolean;
  /** Refetch interval in ms */
  refetchInterval?: number;
  /** Callback on success */
  onSuccess?: (data: T) => void;
  /** Callback on error */
  onError?: (error: Error) => void;
};

/**
 * Generic hook for managing async data with proper type safety
 *
 * @example
 * ```typescript
 * const result = useAsyncData(async () => {
 *   const res = await fetch('/api/data');
 *   return res.json();
 * });
 *
 * if (isSuccess(result)) {
 *   console.log(result.data); // Type: T
 * }
 * ```
 */
export function useAsyncData<T>(
  fetchFn: () => Promise<T>,
  config: AsyncDataConfig<T> = {}
): AsyncData<T> & {
  refetch: () => void;
  reset: () => void;
} {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useAsyncDataWithDeps(fetchFn, [], config);
}

/**
 * Hook for fetching data with dependencies
 *
 * Re-fetches when dependencies change
 */
export function useAsyncDataWithDeps<T>(
  fetchFn: () => Promise<T>,
  deps: React.DependencyList,
  config: AsyncDataConfig<T> = {}
): AsyncData<T> & {
  refetch: () => void;
  reset: () => void;
} {
  const {
    initialData,
    enabled = true,
    refetchInterval,
    onSuccess,
    onError,
  } = config;

  const [state, setState] = useState<AsyncData<T>>(() =>
    initialData
      ? { status: "success", data: initialData }
      : { status: "idle" }
  );

  // Refs hold latest callbacks so fetchData never goes stale
  const fetchFnRef = useRef(fetchFn);
  const onSuccessRef = useRef(onSuccess);
  const onErrorRef = useRef(onError);
  fetchFnRef.current = fetchFn;
  onSuccessRef.current = onSuccess;
  onErrorRef.current = onError;

  const fetchData = useCallback(async () => {
    setState({ status: "loading" });
    try {
      const data = await fetchFnRef.current();
      setState({ status: "success", data });
      onSuccessRef.current?.(data);
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      setState({ status: "error", error: err });
      onErrorRef.current?.(err);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps); // re-creates when deps change (intentional)

  useEffect(() => {
    if (!enabled) return;

    fetchData();

    if (refetchInterval) {
      const interval = setInterval(fetchData, refetchInterval);
      return () => clearInterval(interval);
    }
  }, [enabled, refetchInterval, fetchData]);

  return {
    ...state,
    refetch: fetchData,
    reset: () => setState({ status: "idle" }),
  };
}
