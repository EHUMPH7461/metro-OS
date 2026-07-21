import type { IpcResult, MetroError, MetroErrorCode } from '../shared/inventory.js';

export class MetroDomainError extends Error {
  constructor(
    public readonly code: MetroErrorCode,
    message: string,
    public readonly options: { field?: string; retryable?: boolean } = {}
  ) {
    super(message);
    this.name = 'MetroDomainError';
  }
}

export function toMetroError(error: unknown): MetroError {
  if (error instanceof MetroDomainError) {
    return { code: error.code, message: error.message, retryable: error.options.retryable ?? false, field: error.options.field };
  }
  console.error('Unexpected Metro OS error', error);
  return { code: 'UNEXPECTED', message: 'Metro OS could not complete the request.', retryable: true };
}

export async function asIpcResult<T>(operation: () => T | Promise<T>): Promise<IpcResult<T>> {
  try {
    return { ok: true, data: await operation() };
  } catch (error) {
    return { ok: false, error: toMetroError(error) };
  }
}
