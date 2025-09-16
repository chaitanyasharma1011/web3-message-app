import { Request, Response, NextFunction } from "express";
import { SignatureService } from "../services/signatureService";
import {
  VerifySignatureRequest,
  VerifySignatureResponse,
} from "../types/signature";

const signatureService = new SignatureService();

export const verifySignature = async (
  req: Request<{}, VerifySignatureResponse, VerifySignatureRequest>,
  res: Response<VerifySignatureResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    const { message, signature } = req.body;

    console.log(`Verifying signaturen ${signature} for message: "${message}"`);

    const result = await signatureService.verifyMessageSignature(
      message,
      signature
    );

    res.json(result);
  } catch (error) {
    console.error("Signature verification error:", error);
    next(error);
  }
};
