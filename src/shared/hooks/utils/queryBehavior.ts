export interface QueryBehaviorOptions {
  staleTime?: number;
  gcTime?: number;
  refetchOnWindowFocus?: boolean;
  retry?: boolean | number;
}
