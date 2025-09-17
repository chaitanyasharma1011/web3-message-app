import React, { useState } from "react";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { toast } from "react-hot-toast";
import { Mail, Wallet, Shield, CheckCircle, ArrowRight } from "lucide-react";
import { LoadingSpinner } from "./ui/LoadingSpinner";

export const LoginScreen: React.FC = () => {
  const { setShowAuthFlow, authToken } = useDynamicContext();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    try {
      setIsLoading(true);
      setShowAuthFlow(true);
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Failed to initiate login");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        {/* Hero Section */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-600 rounded-2xl mb-8 shadow-2xl">
            <Wallet className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">
            Web3 Message Signer
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed">
            Authenticate with your wallet and sign custom messages securely
            using Dynamic.xyz embedded wallets
          </p>
        </div>

        {/* Features */}
        <div className="space-y-4">
          {[
            {
              icon: Shield,
              title: "Secure Authentication",
              desc: "Dynamic.xyz headless implementation",
            },
            {
              icon: Mail,
              title: "Email-Based Login",
              desc: "No need to remember seed phrases",
            },
            {
              icon: CheckCircle,
              title: "Message Verification",
              desc: "Backend signature validation",
            },
          ].map((feature, index) => (
            <div
              key={index}
              className="flex items-center space-x-4 p-4 bg-white/5 rounded-lg border border-white/10 backdrop-blur-sm"
            >
              <div className="flex-shrink-0">
                <feature.icon className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h3 className="text-white font-medium">{feature.title}</h3>
                <p className="text-slate-400 text-sm">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Login Button */}
        <div className="space-y-4">
          <button
            onClick={handleLogin}
            disabled={isLoading}
            className="w-full bg-blue-700  hover:bg-purple-600 disabled:bg-slate-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl disabled:cursor-not-allowed group"
          >
            {isLoading ? (
              <>
                <LoadingSpinner size="sm" />
                <span>Connecting...</span>
              </>
            ) : (
              <>
                <span>Connect Wallet</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>

          <p className="text-center text-slate-500 text-sm">
            By connecting, you agree to our terms of service
          </p>
        </div>

        {/* Debug Info (Development) */}
        {import.meta.env.DEV && (
          <div className="mt-8 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
            <h4 className="text-slate-300 font-medium mb-2">Debug Info</h4>
            <div className="text-xs text-slate-400 space-y-1">
              <div>Auth Token: {authToken ? "Present" : "Missing"}</div>
              <div>Environment: {import.meta.env.MODE}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
