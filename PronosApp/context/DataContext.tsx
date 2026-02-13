import { bettors } from "@/mock/bettors";
import { competitions } from "@/mock/competitions";
import { Bettor, Competition } from "@/types";
import React, {
    PropsWithChildren,
    createContext,
    useContext,
    useMemo,
} from "react";

export type DataContextValue = {
  competitions: Competition[];
  bettors: Bettor[];
};

const DataContext = createContext<DataContextValue | undefined>(undefined);

export function DataProvider({ children }: PropsWithChildren) {
  return <DataContext.Provider value={{ competitions, bettors }}>{children}</DataContext.Provider>;
}

export function useData(): DataContextValue {
  const ctx = useContext(DataContext);
  if (!ctx) {
    throw new Error("useData must be used within a DataProvider");
  }
  return ctx;
}
