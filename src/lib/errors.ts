import axios, { AxiosError } from "axios";

/**
 * Every failure from the NexaChat API comes back in the same envelope — verified
 * against the live deployment:
 *
 *   { "error": { "message": "Validation failed",
 *                "code": "VALIDATION_ERROR",
 *                "details": [{ "path": "name", "message": "Required" }] } }
 *
 * Note the nesting: there is no top-level `message` key, so reading
 * `response.data.message` always yields `undefined` and the user only ever sees
 * a generic fallback. Read errors through the helpers below instead.
 */
export interface ApiErrorDetail {
  path: string;
  message: string;
}

export interface ApiErrorEnvelope {
  error?: {
    message?: string;
    code?: string;
    details?: ApiErrorDetail[];
  };
}

const GENERIC_MESSAGE = "Something went wrong. Please try again.";

function asApiError(error: unknown): AxiosError<ApiErrorEnvelope> | null {
  return axios.isAxiosError(error)
    ? (error as AxiosError<ApiErrorEnvelope>)
    : null;
}

/** True when the request was aborted by us (navigation, new keystroke, unmount). */
export function isAbortError(error: unknown): boolean {
  const axiosError = asApiError(error);
  return (
    axiosError?.code === "ERR_CANCELED" ||
    (error as Error)?.name === "CanceledError" ||
    (error as Error)?.name === "AbortError"
  );
}

/** The message worth showing a person, with sensible fallbacks per failure mode. */
export function getApiErrorMessage(
  error: unknown,
  fallback: string = GENERIC_MESSAGE,
): string {
  const axiosError = asApiError(error);

  if (!axiosError) {
    return error instanceof Error ? error.message || fallback : fallback;
  }

  const envelope = axiosError.response?.data?.error;

  if (envelope?.message) {
    return envelope.message;
  }

  // No response at all — the request never made it out or the server is asleep.
  if (!axiosError.response) {
    return "Can't reach the server. Check your connection and try again.";
  }

  if (axiosError.response.status === 401) {
    return "Your session has expired. Please sign in again.";
  }

  return fallback;
}

/** Machine-readable code, e.g. NO_TOKEN or VALIDATION_ERROR. */
export function getApiErrorCode(error: unknown): string | undefined {
  return asApiError(error)?.response?.data?.error?.code;
}

/** Per-field validation errors, ready to hand to react-hook-form's setError. */
export function getApiFieldErrors(error: unknown): ApiErrorDetail[] {
  return asApiError(error)?.response?.data?.error?.details ?? [];
}
