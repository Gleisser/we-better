import { useQuery } from '@tanstack/react-query';
import { partnerService } from '@/services/partner.service';

export const PARTNER_QUERY_KEY = ['partner'] as const;

export function usePartner() {
  return useQuery({
    queryKey: PARTNER_QUERY_KEY,
    queryFn: () => partnerService.getPartners(),
    staleTime: 1000 * 60 * 15, // 15 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  });
} 