import React from "react";
import { MessageSigningProvider } from "../contexts/MessageSigningContext";
import { Header } from "./layout/Header";
import { MessageSigningForm } from "./MessageSigningForm";
import { MessageHistory } from "./MessageHistory";

export const DashboardContainer: React.FC = () => {
  return (
    <MessageSigningProvider>
      <div className="min-h-screen">
        <Header />
        <main className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Message Signing Form */}
            <div className="space-y-6">
              <MessageSigningForm />
            </div>

            {/* Message History */}
            <div className="space-y-6">
              <MessageHistory />
            </div>
          </div>
        </main>
      </div>
    </MessageSigningProvider>
  );
};
