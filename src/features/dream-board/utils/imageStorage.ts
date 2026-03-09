import { supabase } from '@/core/services/supabaseClient';
import { DreamBoardContent, DreamBoardContentType, DreamBoardData } from '../types';
import {
  MAX_DREAM_BOARD_UPLOAD_FILE_BYTES,
  isDreamBoardUploadFileSupported,
  isDreamBoardUploadMimeTypeSupported,
} from './imagePersistence';

export const DREAM_BOARD_STORAGE_BUCKET = 'dream-board-images';

export type DreamBoardStorageReference = {
  bucket: string;
  path: string;
};

export type DreamBoardImageUploadResult = DreamBoardStorageReference & {
  publicUrl: string;
  mimeType: string;
  fileSizeBytes: number;
};

export type DreamBoardPersistenceNormalizationResult = {
  data: DreamBoardData;
  uploadedRefs: DreamBoardStorageReference[];
};

const MIME_TYPE_TO_EXTENSION: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

const EXTENSION_TO_MIME_TYPE: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
};

const isDreamBoardImageDataUrl = (src?: string): src is string =>
  typeof src === 'string' && /^data:image\/(?!svg\+xml)/i.test(src);

const normalizeMimeType = (mimeType?: string | null): string =>
  mimeType?.trim().toLowerCase() || '';

const parseMimeTypeFromDataUrl = (dataUrl: string): string => {
  const match = dataUrl.match(/^data:([^;,]+)[;,]/i);
  return normalizeMimeType(match?.[1]);
};

const dataUrlToBlob = (dataUrl: string): Blob => {
  const [header, payload = ''] = dataUrl.split(',', 2);
  const mimeType = parseMimeTypeFromDataUrl(dataUrl) || 'application/octet-stream';
  const isBase64 = /;base64/i.test(header);

  if (!payload) {
    return new Blob([], { type: mimeType });
  }

  if (!isBase64) {
    return new Blob([decodeURIComponent(payload)], { type: mimeType });
  }

  const binary = atob(payload);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return new Blob([bytes], { type: mimeType });
};

const sanitizeFileName = (fileName: string): string =>
  fileName
    .trim()
    .toLowerCase()
    .replace(/\.[^.]+$/, '')
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') || 'dream-image';

const getStorageFileExtension = (fileName: string, mimeType: string): string => {
  const explicitExtension = fileName.split('.').pop()?.trim().toLowerCase();
  if (explicitExtension && EXTENSION_TO_MIME_TYPE[explicitExtension]) {
    return explicitExtension;
  }

  return MIME_TYPE_TO_EXTENSION[mimeType] || 'jpg';
};

const getUploadMimeType = (fileName: string, mimeType?: string | null): string => {
  const normalizedMimeType = normalizeMimeType(mimeType);
  if (normalizedMimeType) {
    return normalizedMimeType;
  }

  const extension = fileName.split('.').pop()?.trim().toLowerCase() || '';
  return EXTENSION_TO_MIME_TYPE[extension] || '';
};

const getCurrentUserId = async (): Promise<string> => {
  const { data } = await supabase.auth.getSession();
  const userId = data.session?.user?.id;

  if (!userId) {
    throw new Error('Not authenticated');
  }

  return userId;
};

const getDreamBoardImagePublicUrl = (bucket: string, path: string): string => {
  const {
    data: { publicUrl },
  } = supabase.storage.from(bucket).getPublicUrl(path);

  return publicUrl;
};

const uploadDreamBoardImageBlob = async ({
  blob,
  contentId,
  fileName,
  mimeType,
}: {
  blob: Blob;
  contentId: string;
  fileName: string;
  mimeType: string;
}): Promise<DreamBoardImageUploadResult> => {
  if (!isDreamBoardUploadMimeTypeSupported(mimeType)) {
    throw new Error('Unsupported dream board image format');
  }

  if (blob.size > MAX_DREAM_BOARD_UPLOAD_FILE_BYTES) {
    throw new Error('Dream board image exceeds the 5 MB upload limit');
  }

  const userId = await getCurrentUserId();
  const safeName = sanitizeFileName(fileName);
  const extension = getStorageFileExtension(fileName, mimeType);
  const path = `${userId}/${contentId}/${Date.now()}-${safeName}.${extension}`;

  const { error } = await supabase.storage.from(DREAM_BOARD_STORAGE_BUCKET).upload(path, blob, {
    upsert: false,
    contentType: mimeType,
    cacheControl: '31536000',
  });

  if (error) {
    throw new Error(error.message);
  }

  return {
    bucket: DREAM_BOARD_STORAGE_BUCKET,
    path,
    publicUrl: getDreamBoardImagePublicUrl(DREAM_BOARD_STORAGE_BUCKET, path),
    mimeType,
    fileSizeBytes: blob.size,
  };
};

export const uploadDreamBoardImageFile = async (
  file: File,
  contentId: string
): Promise<DreamBoardImageUploadResult> => {
  if (!isDreamBoardUploadFileSupported(file)) {
    throw new Error('Unsupported dream board image format');
  }

  const mimeType = getUploadMimeType(file.name, file.type);
  return uploadDreamBoardImageBlob({
    blob: file,
    contentId,
    fileName: file.name || `${contentId}.jpg`,
    mimeType,
  });
};

export const getDreamBoardContentStorageRef = (
  contentItem: DreamBoardContent
): DreamBoardStorageReference | null => {
  if (!contentItem.storageBucket || !contentItem.storagePath) {
    return null;
  }

  return {
    bucket: contentItem.storageBucket,
    path: contentItem.storagePath,
  };
};

const normalizeDreamBoardContentItemForPersistence = async (
  contentItem: DreamBoardContent
): Promise<{
  contentItem: DreamBoardContent;
  uploadedRef?: DreamBoardStorageReference;
}> => {
  if (contentItem.type !== DreamBoardContentType.IMAGE || !contentItem.src) {
    return { contentItem };
  }

  if (isDreamBoardImageDataUrl(contentItem.src)) {
    const blob = dataUrlToBlob(contentItem.src);
    const mimeType = normalizeMimeType(blob.type || parseMimeTypeFromDataUrl(contentItem.src));
    const fileName = contentItem.alt || contentItem.caption || contentItem.id;
    const uploadedImage = await uploadDreamBoardImageBlob({
      blob,
      contentId: contentItem.id,
      fileName,
      mimeType,
    });

    return {
      contentItem: {
        ...contentItem,
        src: uploadedImage.publicUrl,
        storageBucket: uploadedImage.bucket,
        storagePath: uploadedImage.path,
        mimeType: uploadedImage.mimeType,
        fileSizeBytes: uploadedImage.fileSizeBytes,
      },
      uploadedRef: {
        bucket: uploadedImage.bucket,
        path: uploadedImage.path,
      },
    };
  }

  if (contentItem.storageBucket && contentItem.storagePath) {
    return {
      contentItem: {
        ...contentItem,
        src: getDreamBoardImagePublicUrl(contentItem.storageBucket, contentItem.storagePath),
      },
    };
  }

  return { contentItem };
};

export const normalizeDreamBoardDataForPersistence = async (
  data: DreamBoardData
): Promise<DreamBoardPersistenceNormalizationResult> => {
  const normalizedContent: DreamBoardContent[] = [];
  const uploadedRefs: DreamBoardStorageReference[] = [];

  try {
    for (const contentItem of data.content) {
      const normalizedItem = await normalizeDreamBoardContentItemForPersistence(contentItem);
      normalizedContent.push(normalizedItem.contentItem);

      if (normalizedItem.uploadedRef) {
        uploadedRefs.push(normalizedItem.uploadedRef);
      }
    }
  } catch (error) {
    await deleteDreamBoardStorageFiles(uploadedRefs);
    throw error;
  }

  return {
    data: {
      ...data,
      content: normalizedContent,
    },
    uploadedRefs,
  };
};

export const deleteDreamBoardStorageFiles = async (
  refs: DreamBoardStorageReference[]
): Promise<void> => {
  if (refs.length === 0) {
    return;
  }

  const uniqueRefs = new Map<string, DreamBoardStorageReference>();
  refs.forEach(ref => {
    uniqueRefs.set(`${ref.bucket}:${ref.path}`, ref);
  });

  const refsByBucket = new Map<string, string[]>();
  uniqueRefs.forEach(ref => {
    const bucketPaths = refsByBucket.get(ref.bucket) || [];
    bucketPaths.push(ref.path);
    refsByBucket.set(ref.bucket, bucketPaths);
  });

  await Promise.all(
    Array.from(refsByBucket.entries()).map(async ([bucket, paths]) => {
      const { error } = await supabase.storage.from(bucket).remove(paths);
      if (error) {
        console.error(`Failed to delete dream board storage files from ${bucket}:`, error);
      }
    })
  );
};
