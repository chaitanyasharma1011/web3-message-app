import { ethers } from "ethers";
import { VerifySignatureResponse } from "../types/signature";

export class SignatureService {
  async verifyMessageSignature(
    message: string,
    signature: string
  ): Promise<VerifySignatureResponse> {
    try {
      if (!message || typeof message !== "string") {
        throw new Error("Invalid message: must be a non-empty string");
      }

      if (!signature || typeof signature !== "string") {
        throw new Error("Invalid signature: must be a non-empty string");
      }

      const normalizedSignature = signature.startsWith("0x")
        ? signature
        : `0x${signature}`;

      if (!/^0x[0-9a-fA-F]{130}$/.test(normalizedSignature)) {
        throw new Error("Invalid signature format: must be a valid hex string");
      }

      const signerAddress = ethers.verifyMessage(message, normalizedSignature);

      if (!ethers.isAddress(signerAddress)) {
        throw new Error("Failed to recover valid address from signature");
      }
      console.log("Signer address is", signerAddress);
      return {
        isValid: true,
        signer: signerAddress,
        originalMessage: message,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown verification error";

      return {
        isValid: false,
        signer: null,
        originalMessage: message,
        timestamp: new Date().toISOString(),
        error: errorMessage,
      };
    }
  }

  isValidAddress(address: string): boolean {
    try {
      return ethers.isAddress(address);
    } catch {
      return false;
    }
  }

  checksumAddress(address: string): string {
    try {
      return ethers.getAddress(address);
    } catch (error) {
      throw new Error(`Invalid address format: ${address}`);
    }
  }

  /**
   * Utility method to create a prefixed message (EIP-191)
   * This matches how MetaMask and other wallets format messages
   */
  getMessageHash(message: string): string {
    return ethers.hashMessage(message);
  }
}
