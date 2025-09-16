import request from "supertest";
import { ethers } from "ethers";
import app from "../index";
import { SignatureService } from "../services/signatureService";

describe("Signature Verification API", () => {
  let wallet: ethers.HDNodeWallet;
  let signatureService: SignatureService;

  beforeAll(() => {
    // Create a test wallet
    wallet = ethers.Wallet.createRandom();
    signatureService = new SignatureService();
  });

  describe("POST /api/verify-signature", () => {
    it("should verify a valid signature", async () => {
      const message = "Hello, Web3 world!";
      const signature = await wallet.signMessage(message);

      const response = await request(app)
        .post("/api/verify-signature")
        .send({ message, signature })
        .expect(200);

      expect(response.body).toMatchObject({
        isValid: true,
        signer: wallet.address,
        originalMessage: message,
      });
      expect(response.body.timestamp).toBeDefined();
    });

    it("should reject invalid signature", async () => {
      const message = "Hello, Web3 world!";
      const invalidSignature = "0x" + "0".repeat(130); // Invalid signature

      const response = await request(app)
        .post("/api/verify-signature")
        .send({ message, signature: invalidSignature })
        .expect(200);

      expect(response.body).toMatchObject({
        isValid: false,
        signer: null,
        originalMessage: message,
      });
      expect(response.body.error).toBeDefined();
    });

    it("should reject malformed signature", async () => {
      const message = "Hello, Web3 world!";
      const malformedSignature = "not-a-signature";

      const response = await request(app)
        .post("/api/verify-signature")
        .send({ message, signature: malformedSignature })
        .expect(400);

      expect(response.body.error).toBe("Validation Error");
    });

    it("should reject empty message", async () => {
      const signature = "0x" + "0".repeat(130);

      const response = await request(app)
        .post("/api/verify-signature")
        .send({ message: "", signature })
        .expect(400);

      expect(response.body.error).toBe("Validation Error");
    });

    it("should reject missing fields", async () => {
      const response = await request(app)
        .post("/api/verify-signature")
        .send({})
        .expect(400);

      expect(response.body.error).toBe("Validation Error");
    });

    it("should handle signature without 0x prefix", async () => {
      const message = "Test message";
      const signature = await wallet.signMessage(message);
      const signatureWithoutPrefix = signature.slice(2); // Remove 0x

      const response = await request(app)
        .post("/api/verify-signature")
        .send({ message, signature: signatureWithoutPrefix })
        .expect(200);

      expect(response.body).toMatchObject({
        isValid: true,
        signer: wallet.address,
        originalMessage: message,
      });
    });
  });

  describe("SignatureService", () => {
    it("should validate Ethereum addresses correctly", () => {
      expect(signatureService.isValidAddress(wallet.address)).toBe(true);
      expect(signatureService.isValidAddress("invalid-address")).toBe(false);
      expect(signatureService.isValidAddress("0x")).toBe(false);
    });

    it("should format addresses to checksum format", () => {
      const lowerCaseAddress = wallet.address.toLowerCase();
      const checksummed = signatureService.checksumAddress(lowerCaseAddress);
      expect(checksummed).toBe(wallet.address);
    });

    it("should generate correct message hash", () => {
      const message = "Test message";
      const hash = signatureService.getMessageHash(message);
      const expectedHash = ethers.hashMessage(message);
      expect(hash).toBe(expectedHash);
    });
  });

  describe("Health endpoint", () => {
    it("should return health status", async () => {
      const response = await request(app).get("/health").expect(200);

      expect(response.body).toMatchObject({
        status: "ok",
        environment: expect.any(String),
      });
      expect(response.body.timestamp).toBeDefined();
    });
  });

  describe("404 handler", () => {
    it("should return 404 for unknown routes", async () => {
      const response = await request(app).get("/nonexistent-route").expect(404);

      expect(response.body).toMatchObject({
        error: "Not Found",
        message: "Route /nonexistent-route not found",
      });
    });
  });
});
