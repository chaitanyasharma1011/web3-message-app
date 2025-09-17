export interface SignedMessage {
  id: string;
  message: string;
  signature: string;
  signer: string | null;
  timestamp: string;
  verified: boolean;
  verificationResult?: VerificationResult;
}

export interface VerificationResult {
  isValid: boolean;
  signer: string | null;
  originalMessage: string;
  timestamp: string;
  error?: string;
}

export interface VerifySignatureRequest {
  message: string;
  signature: string;
}

export interface ApiError {
  error: string;
  message: string;
  timestamp: string;
  path?: string;
  details?: Array<{
    path: string;
    message: string;
  }>;
}
