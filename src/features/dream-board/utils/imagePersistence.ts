export const MAX_DREAM_BOARD_UPLOAD_FILE_BYTES = 5 * 1024 * 1024;

export const DREAM_BOARD_UPLOAD_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;

const DREAM_BOARD_UPLOAD_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp'];

export type DreamBoardUploadValidationFailureReason = 'fileTooLarge' | 'unsupportedType' | null;

export type DreamBoardUploadValidationResult = {
  originalBytes: number;
  fitsLimit: boolean;
  mimeType: string;
  reason: DreamBoardUploadValidationFailureReason;
};

const normalizeMimeType = (mimeType?: string | null): string =>
  mimeType?.trim().toLowerCase() || '';

const getFileExtension = (fileName?: string | null): string =>
  fileName?.split('.').pop()?.trim().toLowerCase() || '';

export const formatBytes = (bytes: number): string => {
  if (bytes >= 1024 * 1024) {
    const megabytes = bytes / (1024 * 1024);
    const precision = megabytes >= 10 ? 0 : 1;
    return `${megabytes.toFixed(precision).replace(/\.0$/, '')} MB`;
  }

  if (bytes >= 1024) {
    return `${Math.round(bytes / 1024)} KB`;
  }

  return `${bytes} B`;
};

export const formatDreamBoardImageLimit = (bytes = MAX_DREAM_BOARD_UPLOAD_FILE_BYTES): string =>
  formatBytes(bytes);

export const isDreamBoardUploadMimeTypeSupported = (mimeType?: string | null): boolean =>
  DREAM_BOARD_UPLOAD_MIME_TYPES.includes(
    normalizeMimeType(mimeType) as (typeof DREAM_BOARD_UPLOAD_MIME_TYPES)[number]
  );

export const isDreamBoardUploadFileSupported = (file: Pick<File, 'name' | 'type'>): boolean =>
  isDreamBoardUploadMimeTypeSupported(file.type) ||
  DREAM_BOARD_UPLOAD_EXTENSIONS.includes(getFileExtension(file.name));

export const validateDreamBoardUploadFile = async (
  file: File
): Promise<DreamBoardUploadValidationResult> => {
  const mimeType = normalizeMimeType(file.type);
  const isSupported = isDreamBoardUploadFileSupported(file);

  if (!isSupported) {
    return {
      originalBytes: file.size,
      fitsLimit: false,
      mimeType,
      reason: 'unsupportedType',
    };
  }

  if (file.size > MAX_DREAM_BOARD_UPLOAD_FILE_BYTES) {
    return {
      originalBytes: file.size,
      fitsLimit: false,
      mimeType,
      reason: 'fileTooLarge',
    };
  }

  return {
    originalBytes: file.size,
    fitsLimit: true,
    mimeType,
    reason: null,
  };
};
