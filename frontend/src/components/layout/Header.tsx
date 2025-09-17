import React from "react";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { Wallet, LogOut, User, Copy, Check } from "lucide-react";
import { toast } from "react-hot-toast";
import { useState } from "react";

export const Header: React.FC = () => {
  const { user, handleLogOut, primaryWallet } = useDynamicContext();
  const [copied, setCopied] = useState(false);

  const walletAddress = primaryWallet?.address;
  const truncatedAddress = walletAddress
    ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
    : "No wallet";

  const handleCopyAddress = async () => {
    if (!walletAddress) return;

    try {
      await navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      toast.success("Address copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Failed to copy address");
    }
  };

  const handleLogout = () => {
    toast.success("Logged out successfully");
    handleLogOut();
  };

  return (
    <header className="bg-white/5 backdrop-blur-sm border-b border-white/10">
      <div className="container mx-auto px-4 py-4 max-w-6xl">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-lg">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Web3 Signer</h1>
              <p className="text-slate-400 text-sm">
                Message signing made easy
              </p>
            </div>
          </div>

          {/* User Info */}
          <div className="flex items-center space-x-4">
            {/* Wallet Address */}
            <div className="flex items-center space-x-2 bg-white/5 rounded-lg px-3 py-2 border border-white/10">
              <User className="w-4 h-4 text-slate-400" />
              <span className="text-white font-mono text-sm">
                {truncatedAddress}
              </span>
              <button
                onClick={handleCopyAddress}
                className="text-slate-400 hover:text-white transition-colors"
                title="Copy full address"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-400" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* User Email */}
            {user?.email && (
              <div className="hidden sm:flex items-center space-x-2 text-slate-300">
                <span className="text-sm">{user.email}</span>
              </div>
            )}

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 px-3 py-2 rounded-lg transition-colors border border-red-500/20"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>

        {/* Connection Status */}
        <div className="mt-4 flex items-center justify-center">
          <div className="flex items-center space-x-2 bg-green-500/10 text-green-400 px-3 py-1 rounded-full text-sm border border-green-500/20">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span>Wallet Connected</span>
          </div>
        </div>
      </div>
    </header>
  );
};
