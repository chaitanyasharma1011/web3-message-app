export interface VerifySignatureRequest {
  message: string;
  signature: string;
}

export interface VerifySignatureResponse {
  isValid: boolean;
  signer: string | null;
  originalMessage: string;
  timestamp: string;
  error?: string;
}

export interface ApiError {
  error: string;
  message: string;
  timestamp: string;
  path?: string;
}
