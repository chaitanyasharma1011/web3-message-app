import React from "react";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { LoginScreen } from "./LoginScreen";
import { LoadingSpinner } from "./ui/LoadingSpinner";

interface AuthGuardProps {
  children: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { user, isAuthenticated, sdkHasLoaded } = useDynamicContext();

  // Show loading spinner while SDK is loading
  if (!sdkHasLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Show login screen if not authenticated
  if (!isAuthenticated || !user) {
    return <LoginScreen />;
  }

  // Render children if authenticated
  return <>{children}</>;
};
