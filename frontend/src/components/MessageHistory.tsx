import React, { useState } from "react";
import {
  History,
  Trash2,
  CheckCircle,
  XCircle,
  Copy,
  Eye,
  EyeOff,
  Filter,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { useMessageSigning } from "../contexts/MessageSigningContext";
import { formatDistanceToNow } from "../utils/dateUtils";

export const MessageHistory: React.FC = () => {
  const { messages, clearMessages } = useMessageSigning();
  const [filter, setFilter] = useState<"all" | "verified" | "failed">("all");
  const [expandedMessages, setExpandedMessages] = useState<Set<string>>(
    new Set()
  );

  const filteredMessages = messages.filter((msg) => {
    if (filter === "verified") return msg.verified;
    if (filter === "failed") return !msg.verified;
    return true;
  });

  const toggleMessageExpansion = (id: string) => {
    const newExpanded = new Set(expandedMessages);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedMessages(newExpanded);
  };

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${type} copied to clipboard!`);
    } catch (error) {
      toast.error(`Failed to copy ${type.toLowerCase()}`);
    }
  };

  const handleClearHistory = () => {
    if (messages.length === 0) return;

    if (window.confirm("Are you sure you want to clear all message history?")) {
      clearMessages();
    }
  };

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6 shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-10 h-10 bg-teal-600 rounded-lg">
            <History className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Message History</h2>
            <p className="text-slate-400 text-sm">
              {messages.length} message{messages.length !== 1 ? "s" : ""} signed
            </p>
          </div>
        </div>

        {messages.length > 0 && (
          <button
            onClick={handleClearHistory}
            className="flex items-center space-x-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 px-3 py-2 rounded-lg transition-colors border border-red-500/20"
            title="Clear all messages"
          >
            <Trash2 className="w-4 h-4" />
            <span className="hidden sm:inline">Clear</span>
          </button>
        )}
      </div>

      {/* Filters */}
      {messages.length > 0 && (
        <div className="flex items-center space-x-2 mb-6">
          <Filter className="w-4 h-4 text-slate-400" />
          <div className="flex space-x-2">
            {[
              { key: "all", label: "All", count: messages.length },
              {
                key: "verified",
                label: "Verified",
                count: messages.filter((m) => m.verified).length,
              },
              {
                key: "failed",
                label: "Failed",
                count: messages.filter((m) => !m.verified).length,
              },
            ].map(({ key, label, count }) => (
              <button
                key={key}
                onClick={() => setFilter(key as typeof filter)}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  filter === key
                    ? "bg-blue-500/20 text-purple-300 border border-blue-500/30"
                    : "bg-white/5 text-slate-400 hover:text-slate-300 border border-white/10"
                }`}
              >
                {label} ({count})
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Message List */}
      <div className="space-y-4">
        {filteredMessages.length === 0 ? (
          <div className="text-center py-12">
            <History className="w-12 h-12 text-slate-500 mx-auto mb-4" />
            <h3 className="text-slate-300 font-medium mb-2">
              {messages.length === 0
                ? "No messages yet"
                : "No messages match filter"}
            </h3>
            <p className="text-slate-400 text-sm">
              {messages.length === 0
                ? "Sign your first message to see it appear here"
                : "Try adjusting your filter settings"}
            </p>
          </div>
        ) : (
          filteredMessages.map((msg) => {
            const isExpanded = expandedMessages.has(msg.id);
            const truncatedMessage =
              msg.message.length > 100
                ? msg.message.substring(0, 100) + "..."
                : msg.message;

            return (
              <div
                key={msg.id}
                className={`bg-white/5 border rounded-lg p-4 transition-colors ${
                  msg.verified
                    ? "border-green-500/20 bg-green-500/5"
                    : "border-red-500/20 bg-red-500/5"
                }`}
              >
                {/* Message Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    {msg.verified ? (
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-400" />
                    )}
                    <span
                      className={`text-sm font-medium ${
                        msg.verified ? "text-green-400" : "text-red-400"
                      }`}
                    >
                      {msg.verified ? "Verified" : "Failed"}
                    </span>
                  </div>
                  <span className="text-slate-400 text-xs">
                    {formatDistanceToNow(new Date(msg.timestamp))}
                  </span>
                </div>

                {/* Message Content */}
                <div className="mb-3">
                  <p className="text-white text-sm mb-2">
                    {isExpanded ? msg.message : truncatedMessage}
                  </p>

                  {msg.message.length > 100 && (
                    <button
                      onClick={() => toggleMessageExpansion(msg.id)}
                      className="flex items-center space-x-1 text-purple-400 hover:text-purple-300 text-xs"
                    >
                      {isExpanded ? (
                        <>
                          <EyeOff className="w-3 h-3" />
                          <span>Show less</span>
                        </>
                      ) : (
                        <>
                          <Eye className="w-3 h-3" />
                          <span>Show more</span>
                        </>
                      )}
                    </button>
                  )}
                </div>

                {/* Signature & Signer Info */}
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Signer:</span>
                    <div className="flex items-center space-x-2">
                      {msg.signer ? (
                        <span className="text-slate-300 font-mono">
                          {msg.signer.slice(0, 6)}...{msg.signer.slice(-4)}
                        </span>
                      ) : null}
                      <button
                        onClick={() =>
                          copyToClipboard(msg.signer || "", "Address")
                        }
                        className="text-slate-400 hover:text-white"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Signature:</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-slate-300 font-mono">
                        {msg.signature.slice(0, 10)}...{msg.signature.slice(-6)}
                      </span>
                      <button
                        onClick={() =>
                          copyToClipboard(msg.signature, "Signature")
                        }
                        className="text-slate-400 hover:text-white"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Verification Details */}
                  {msg.verificationResult && (
                    <div className="mt-3 pt-3 border-t border-white/10">
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-slate-400">
                            Backend Status:
                          </span>
                          <div
                            className={`font-medium ${
                              msg.verificationResult.isValid
                                ? "text-green-400"
                                : "text-red-400"
                            }`}
                          >
                            {msg.verificationResult.isValid
                              ? "✓ Valid"
                              : "✗ Invalid"}
                          </div>
                        </div>
                        <div>
                          <span className="text-slate-400">Verified At:</span>
                          <div className="text-slate-300">
                            {new Date(
                              msg.verificationResult.timestamp
                            ).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>

                      {!msg.verificationResult.isValid &&
                        msg.verificationResult.error && (
                          <div className="mt-2 p-2 bg-red-500/10 rounded border border-red-500/20">
                            <span className="text-red-400 text-xs">
                              Error: {msg.verificationResult.error}
                            </span>
                          </div>
                        )}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer Stats */}
      {messages.length > 0 && (
        <div className="mt-6 pt-6 border-t border-white/10">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-white">
                {messages.length}
              </div>
              <div className="text-slate-400 text-xs">Total</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-400">
                {messages.filter((m) => m.verified).length}
              </div>
              <div className="text-slate-400 text-xs">Verified</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-400">
                {messages.filter((m) => !m.verified).length}
              </div>
              <div className="text-slate-400 text-xs">Failed</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
