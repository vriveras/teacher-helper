import { useState, useEffect } from 'react';
import type { ApiResponse } from '@teacher-helper/shared';
import type { AsyncState } from '../types/index.js';

export function useApi<T>(
  apiCall: () => Promise<ApiResponse<T>>,
  deps: React.DependencyList = []
): AsyncState<T> {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      setState({ data: null, loading: true, error: null });

      try {
        const response = await apiCall();

        if (!isMounted) return;

        if (response.success && response.data) {
          setState({ data: response.data, loading: false, error: null });
        } else {
          setState({
            data: null,
            loading: false,
            error: response.error?.message || 'Unknown error occurred',
          });
        }
      } catch (error) {
        if (!isMounted) return;

        setState({
          data: null,
          loading: false,
          error: error instanceof Error ? error.message : 'Failed to fetch data',
        });
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, deps);

  return state;
}
