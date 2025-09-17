import React from "react";
import { DynamicContextProvider } from "@dynamic-labs/sdk-react-core";
import { EthereumWalletConnectors } from "@dynamic-labs/ethereum";
import { Toaster } from "react-hot-toast";
import { DashboardContainer } from "./components/DashboardContainer";
import { AuthGuard } from "./components/AuthGuard";

// Dynamic configuration
const dynamicEnvironmentId = import.meta.env.VITE_DYNAMIC_ENVIRONMENT_ID || "";

const App: React.FC = () => {
  if (!dynamicEnvironmentId) {
    return (
      <div className="min-h-screen bg-purple-900 flex items-center justify-center">
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6 max-w-md mx-4">
          <h1 className="text-red-400 text-xl font-bold mb-2">
            Configuration Error
          </h1>
          <p className="text-red-300">
            Please set VITE_DYNAMIC_ENVIRONMENT_ID in your .env file
          </p>
        </div>
      </div>
    );
  }

  return (
    <DynamicContextProvider
      settings={{
        environmentId: dynamicEnvironmentId,
        walletConnectors: [EthereumWalletConnectors],
        eventsCallbacks: {
          onAuthSuccess: ({ authToken }) => {
            console.log("Auth successful:", authToken);
          },
          onAuthFailure: (error) => {
            console.error("Auth failed:", error);
          },
        },
      }}
    >
      <div className="min-h-screen bg-purple-900">
        <AuthGuard>
          <DashboardContainer />
        </AuthGuard>
        <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "rgb(30 41 59)",
              color: "white",
              border: "1px solid rgb(71 85 105)",
            },
          }}
        />
      </div>
    </DynamicContextProvider>
  );
};

export default App;
