import { bettors } from "@/mock/bettors";
import { competitions } from "@/mock/competitions";
import { Bettor, Competition } from "@/types";
import React, {
    PropsWithChildren,
    createContext,
    useContext,
    useMemo,
    useState,
} from "react";

export type DataContextValue = {
  competitions: Competition[];
  bettors: Bettor[];
  addBettor: (bettor: Bettor) => void;
};

const DataContext = createContext<DataContextValue | undefined>(undefined);

export function DataProvider({ children }: PropsWithChildren) {
  const [bettorsList, setBettors] = useState<Bettor[]>(bettors);
  
  const addBettor = (bettor: Bettor) => {
    setBettors(prev => [...prev, bettor]);
  };
  
  const value = useMemo(() => ({
    competitions,
    bettors: bettorsList,
    addBettor
  }), [competitions, bettorsList]);
  
  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData(): DataContextValue {
  const ctx = useContext(DataContext);
  if (!ctx) {
    throw new Error("useData must be used within a DataProvider");
  }
  return ctx;
}
