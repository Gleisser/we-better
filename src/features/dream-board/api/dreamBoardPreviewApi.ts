import { createAppApiUrl } from '@/core/config/appApi';
import { supabase } from '@/core/services/supabaseClient';

export type DreamBoardPreviewUrls = {
  imagePreviewCardUrl: string;
  imagePreviewWidgetUrl: string;
};

const inFlightPreviewRenewals = new Map<string, Promise<DreamBoardPreviewUrls>>();

export const renewDreamBoardPreviewUrls = async (
  bucket: string,
  path: string
): Promise<DreamBoardPreviewUrls> => {
  const renewalKey = `${bucket}:${path}`;
  const existingRenewal = inFlightPreviewRenewals.get(renewalKey);
  if (existingRenewal) {
    return existingRenewal;
  }

  const renewal = issueDreamBoardPreviewUrls(bucket, path);
  inFlightPreviewRenewals.set(renewalKey, renewal);

  try {
    return await renewal;
  } finally {
    inFlightPreviewRenewals.delete(renewalKey);
  }
};

const issueDreamBoardPreviewUrls = async (
  bucket: string,
  path: string
): Promise<DreamBoardPreviewUrls> => {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;

  if (!token) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(createAppApiUrl('/dream-board/previews'), {
    method: 'POST',
    credentials: 'include',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ bucket, path }),
  });

  if (!response.ok) {
    throw new Error(`Failed to renew Dream Board preview (${response.status})`);
  }

  return (await response.json()) as DreamBoardPreviewUrls;
};
