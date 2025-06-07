import { getDetailedErrorMessage } from './error-handling';

export async function handleServiceError(error: unknown, serviceName: string): Promise<never> {
  const message = getDetailedErrorMessage(error);
  console.error(`${serviceName} service error:`, message);
  throw error;
} 