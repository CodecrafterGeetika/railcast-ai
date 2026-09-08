import { ProviderError } from "./types";

export interface MLPredictionRequest {
  train_number: string;
  current_station: string;
  departure_delay: number;
}

export interface MLPredictionResponse {
  train: string;
  current_station: string;
  next_station: string;
  scheduled_arrival: string;
  predicted_arrival: string;
  predicted_delay_min: number;
  status: string;
  model: string;
}

const ML_API_BASE_URL = (process.env.ML_API_BASE_URL ?? "").replace(/\/$/, "");

const REQUEST_TIMEOUT_MS = 10000;

export async function predictWithML(
  payload: MLPredictionRequest
): Promise<MLPredictionResponse> {
  if (!ML_API_BASE_URL) {
    throw new ProviderError(
      "NETWORK",
      "ML_API_BASE_URL is not configured"
    );
  }

  const controller = new AbortController();

  const timeout = setTimeout(() => {
    controller.abort();
  }, REQUEST_TIMEOUT_MS);

  let response: Response;

  try {
    response = await fetch(`${ML_API_BASE_URL}/predict`, {
      method: "POST",

      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },

      body: JSON.stringify(payload),

      signal: controller.signal,

      cache: "no-store",
    });
  } catch (error) {
    if (
      error instanceof DOMException &&
      error.name === "AbortError"
    ) {
      throw new ProviderError(
        "TIMEOUT",
        "ML prediction request timed out"
      );
    }

    throw new ProviderError(
      "NETWORK",
      "Network error calling ML prediction backend"
    );
  } finally {
    clearTimeout(timeout);
  }

  /*
   * Handle specific HTTP errors returned by FastAPI.
   */

  if (response.status === 404) {
    throw new ProviderError(
      "NOT_FOUND",
      "Train or prediction endpoint not found"
    );
  }

  if (response.status === 429) {
    throw new ProviderError(
      "RATE_LIMITED",
      "ML prediction backend is rate limited"
    );
  }

  if (response.status >= 500) {
    throw new ProviderError(
      "SERVER_ERROR",
      "ML prediction backend returned a server error"
    );
  }

  /*
   * Handle any other non-2xx response.
   */

  if (!response.ok) {
    let detail = `ML prediction failed with HTTP ${response.status}`;

    try {
      const body = (await response.json()) as {
        detail?: string;
      };

      if (body.detail) {
        detail = body.detail;
      }
    } catch {
      // Keep the HTTP error message when the backend
      // does not return JSON.
    }

    throw new ProviderError(
      "SERVER_ERROR",
      detail
    );
  }

  /*
   * Parse the successful JSON response.
   */

  let data: unknown;

  try {
    data = await response.json();
  } catch {
    throw new ProviderError(
      "MALFORMED",
      "ML prediction backend returned malformed JSON"
    );
  }

  /*
   * Validate that the response matches the expected
   * RailCast AI FastAPI response structure.
   */

  if (!isMLPredictionResponse(data)) {
    throw new ProviderError(
      "MALFORMED",
      "ML prediction backend returned an unexpected response"
    );
  }

  return data;
}

/**
 * Runtime validation for the FastAPI /predict response.
 */
function isMLPredictionResponse(
  value: unknown
): value is MLPredictionResponse {
  if (!value || typeof value !== "object") {
    return false;
  }

  const data = value as Record<string, unknown>;

  return (
    typeof data.train === "string" &&
    typeof data.current_station === "string" &&
    typeof data.next_station === "string" &&
    typeof data.scheduled_arrival === "string" &&
    typeof data.predicted_arrival === "string" &&
    typeof data.predicted_delay_min === "number" &&
    typeof data.status === "string" &&
    typeof data.model === "string"
  );
}
