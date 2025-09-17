import React, { useState } from "react";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { toast } from "react-hot-toast";
import {
  PenTool,
  Send,
  AlertCircle,
  CheckCircle,
  Sparkles,
} from "lucide-react";
import { useMessageSigning } from "../contexts/MessageSigningContext";
import { LoadingSpinner } from "./ui/LoadingSpinner";
// import { getSigner } from "@dynamic-labs/ethers-v6";

const EXAMPLE_MESSAGES = [
  "Hello, Web3 world! ",
  "This is my first signed message",
  "Proving ownership of this wallet",
  "Today is a great day for crypto! ",
  "Building the decentralized future",
];

export const MessageSigningForm: React.FC = () => {
  const { primaryWallet } = useDynamicContext();
  const { signMessage, isLoading, error, clearError } = useMessageSigning();
  const [message, setMessage] = useState("");
  const [isSigningLocal, setIsSigningLocal] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !primaryWallet) return;

    try {
      setIsSigningLocal(true);
      clearError();

      let signature: string | Uint8Array;
      let signerAddress = primaryWallet.address ?? "";

      if (
        primaryWallet.connector &&
        typeof (primaryWallet.connector as any).signMessage === "function"
      ) {
        signature = await (primaryWallet.connector as any).signMessage(message);
      } else {
        throw new Error(
          `This wallet connector does not support message signing (chain: ${primaryWallet.chain})`
        );
      }

      // Normalize Uint8Array signatures into hex string
      const signatureToSend =
        signature instanceof Uint8Array
          ? `0x${Buffer.from(signature).toString("hex")}`
          : signature;

      await signMessage(message, signatureToSend, signerAddress);

      // Clear form on success
      setMessage("");
      toast.success("Message signed successfully!");
    } catch (error) {
      console.error("Signing error:", error);
      const errorMsg =
        error instanceof Error ? error.message : "Failed to sign message";
      toast.error(errorMsg);
    } finally {
      setIsSigningLocal(false);
    }
  };

  const handleExampleMessage = (exampleMessage: string) => {
    setMessage(exampleMessage);
  };

  const isFormDisabled = isLoading || isSigningLocal || !primaryWallet;

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6 shadow-2xl">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-lg">
          <PenTool className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Sign Message</h2>
          <p className="text-slate-400 text-sm">
            Create and sign a custom message
          </p>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-red-400 font-medium">Error</p>
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Message Input */}
        <div>
          <label
            htmlFor="message"
            className="block text-white font-medium mb-2"
          >
            Your Message
          </label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Enter your message to sign..."
            rows={4}
            disabled={isFormDisabled}
            className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-colors resize-none disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <div className="flex justify-between items-center mt-2">
            <p className="text-slate-400 text-sm">
              {message.length} characters
            </p>
            {message.length > 1000 && (
              <p className="text-yellow-400 text-sm">⚠️ Very long message</p>
            )}
          </div>
        </div>

        {/* Example Messages */}
        <div>
          <label className="block text-white font-medium mb-3">
            <Sparkles className="w-4 h-4 inline mr-2" />
            Quick Examples
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {EXAMPLE_MESSAGES.map((example, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleExampleMessage(example)}
                disabled={isFormDisabled}
                className="text-left p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-slate-300 text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:text-white"
              >
                "{example}"
              </button>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!message.trim() || isFormDisabled}
          className="w-full bg-blue-700 disabled:bg-slate-700 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl disabled:cursor-not-allowed group"
        >
          {isSigningLocal || isLoading ? (
            <>
              <LoadingSpinner size="sm" />
              <span>{isSigningLocal ? "Signing..." : "Verifying..."}</span>
            </>
          ) : (
            <>
              <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              <span>Sign Message</span>
            </>
          )}
        </button>
      </form>

      {/* Wallet Status */}
      <div className="mt-6 pt-6 border-t border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-green-400" />
            <span className="text-slate-300 text-sm">
              Wallet connected and ready
            </span>
          </div>
          {primaryWallet && (
            <div className="text-slate-400 text-xs font-mono">
              {primaryWallet.address.slice(0, 8)}...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
