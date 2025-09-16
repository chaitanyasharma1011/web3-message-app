import { Router } from "express";
import { verifySignature } from "../controllers/signatureController";
import { validateSignatureRequest } from "../middleware/validation";

const router = Router();

router.post("/verify-signature", validateSignatureRequest, verifySignature);

export { router as signatureRoutes };
