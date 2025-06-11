import React from "react";
import { ErrorContextContext, useErrorContextProvider } from "@/hooks/useErrorContext";

interface ErrorContextProviderProps {
  children: React.ReactNode;
}

export default function ErrorContextProvider({ children }: ErrorContextProviderProps) {
  const errorContextValue = useErrorContextProvider();

  return (
    <ErrorContextContext.Provider value={errorContextValue}>
      {children}
    </ErrorContextContext.Provider>
  );
}