import type {
  VerificationResult,
  VerifySignatureRequest,
  ApiError,
} from "../types/message";

class ApiClient {
  private baseURL: string;

  constructor() {
    this.baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
  }

  async verifySignature(
    message: string,
    signature: string
  ): Promise<VerificationResult> {
    const payload: VerifySignatureRequest = {
      message,
      signature,
    };

    try {
      const response = await fetch(`${this.baseURL}/api/verify-signature`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        // Try to get error details from response
        let errorData: ApiError;
        try {
          errorData = await response.json();
        } catch {
          errorData = {
            error: "Network Error",
            message: `HTTP ${response.status}: ${response.statusText}`,
            timestamp: new Date().toISOString(),
          };
        }

        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      const result: VerificationResult = await response.json();
      return result;
    } catch (error) {
      console.error("API request failed:", error);

      if (error instanceof TypeError && error.message.includes("fetch")) {
        throw new Error(
          "Network error: Unable to connect to the server. Please check if the backend is running."
        );
      }

      throw error;
    }
  }

  async healthCheck(): Promise<{
    status: string;
    timestamp: string;
    environment: string;
  }> {
    try {
      const response = await fetch(`${this.baseURL}/health`);

      if (!response.ok) {
        throw new Error(`Health check failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Health check failed:", error);
      throw error;
    }
  }

  getBaseURL(): string {
    return this.baseURL;
  }
}

export const apiClient = new ApiClient();
