export interface PageProps {
  params: Record<string, string>;
  searchParams?: Record<string, string | string[] | undefined>;
}

export interface LayoutProps {
  children: React.ReactNode;
}

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}
