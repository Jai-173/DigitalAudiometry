import React, { createContext, useContext, useState } from "react";

type Threshold = { freq: number; volume: number };

type TestContextType = {
  leftEarData: Threshold[];
  rightEarData: Threshold[];
  setLeftEarData: (data: Threshold[]) => void;
  setRightEarData: (data: Threshold[]) => void;
  resetTestData: () => void;
};

const TestContext = createContext<TestContextType | null>(null);

export const TestProvider = ({ children }: { children: React.ReactNode }) => {
  const [leftEarData, setLeftEarData] = useState<Threshold[]>([]);
  const [rightEarData, setRightEarData] = useState<Threshold[]>([]);

  const resetTestData = () => {
    setLeftEarData([]);
    setRightEarData([]);
  };

  return (
    <TestContext.Provider
      value={{ leftEarData, rightEarData, setLeftEarData, setRightEarData, resetTestData }}
    >
      {children}
    </TestContext.Provider>
  );
};

export const useTestData = () => {
  const ctx = useContext(TestContext);
  if (!ctx) throw new Error("useTestData must be used within TestProvider");
  return ctx;
};
