import React, { createContext, useContext, useReducer, useEffect } from "react";
import { toast } from "react-hot-toast";
import { apiClient } from "../services/apiClient";
import type { SignedMessage, VerificationResult } from "../types/message";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";

interface MessageSigningState {
  messages: SignedMessage[];
  isLoading: boolean;
  error: string | null;
}

interface MessageSigningContextValue extends MessageSigningState {
  signMessage: (
    message: string,
    signature: string,
    signer: string
  ) => Promise<void>;
  verifySignature: (
    message: string,
    signature: string
  ) => Promise<VerificationResult>;
  clearMessages: () => void;
  clearError: () => void;
}

type MessageSigningAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "ADD_MESSAGE"; payload: SignedMessage }
  | { type: "CLEAR_MESSAGES" }
  | { type: "LOAD_MESSAGES"; payload: SignedMessage[] };

const initialState: MessageSigningState = {
  messages: [],
  isLoading: false,
  error: null,
};

const messageSigningReducer = (
  state: MessageSigningState,
  action: MessageSigningAction
): MessageSigningState => {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload };
    case "ADD_MESSAGE":
      return {
        ...state,
        messages: [action.payload, ...state.messages],
      };
    case "CLEAR_MESSAGES":
      return { ...state, messages: [] };
    case "LOAD_MESSAGES":
      return { ...state, messages: action.payload };
    default:
      return state;
  }
};

const MessageSigningContext = createContext<
  MessageSigningContextValue | undefined
>(undefined);

const STORAGE_KEY = "web3-signed-messages";

export const MessageSigningProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [state, dispatch] = useReducer(messageSigningReducer, initialState);
  const { primaryWallet } = useDynamicContext();

  // Load messages from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const messages = JSON.parse(stored) as SignedMessage[];
        dispatch({ type: "LOAD_MESSAGES", payload: messages });
      }
    } catch (error) {
      console.warn("Failed to load messages from localStorage:", error);
    }
  }, []);

  // Save messages to localStorage when messages change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.messages));
    } catch (error) {
      console.warn("Failed to save messages to localStorage:", error);
    }
  }, [state.messages]);

  const signMessage = async (
    message: string,
    signature: string
    // signer: string
  ) => {
    dispatch({ type: "SET_LOADING", payload: true });
    dispatch({ type: "SET_ERROR", payload: null });

    try {
      // Verify signature with backend
      const verification = await verifySignature(message, signature);

      const signedMessage: SignedMessage = {
        id: crypto.randomUUID(),
        message,
        signature,
        signer: verification?.signer,
        timestamp: new Date().toISOString(),
        verified: verification.signer === primaryWallet?.address,
        verificationResult: verification,
      };

      dispatch({ type: "ADD_MESSAGE", payload: signedMessage });

      if (verification.isValid) {
        toast.success("Message signed and verified successfully!");
      } else {
        toast.error("Message signed but verification failed");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      dispatch({ type: "SET_ERROR", payload: errorMessage });
      toast.error(`Failed to process signature: ${errorMessage}`);
      throw error;
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  const verifySignature = async (
    message: string,
    signature: string
  ): Promise<VerificationResult> => {
    try {
      return await apiClient.verifySignature(message, signature);
    } catch (error) {
      console.error("Signature verification failed:", error);
      throw error;
    }
  };

  const clearMessages = () => {
    dispatch({ type: "CLEAR_MESSAGES" });
    toast.success("Message history cleared");
  };

  const clearError = () => {
    dispatch({ type: "SET_ERROR", payload: null });
  };

  const value: MessageSigningContextValue = {
    ...state,
    signMessage,
    verifySignature,
    clearMessages,
    clearError,
  };

  return (
    <MessageSigningContext.Provider value={value}>
      {children}
    </MessageSigningContext.Provider>
  );
};

export const useMessageSigning = (): MessageSigningContextValue => {
  const context = useContext(MessageSigningContext);
  if (!context) {
    throw new Error(
      "useMessageSigning must be used within a MessageSigningProvider"
    );
  }
  return context;
};
