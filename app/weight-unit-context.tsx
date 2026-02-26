"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";

export type WeightUnit = "lb" | "kg";

export const LBS_TO_KG = 0.453592;
export const KG_TO_LBS = 1 / LBS_TO_KG;

interface WeightUnitCtx {
  unit: WeightUnit;
  setUnit: (u: WeightUnit) => void;
  /** Convert lbs to display value in current unit */
  display: (lbs: number) => number;
  /** Parse user input (in current unit) to lbs */
  parseToLbs: (value: string) => number;
  /** Unit label for display */
  suffix: string;
}

const Ctx = createContext<WeightUnitCtx>({
  unit: "lb",
  setUnit: () => {},
  display: (lbs) => lbs,
  parseToLbs: (v) => parseFloat(v) || 0,
  suffix: "lbs",
});

export function WeightUnitProvider({ children }: { children: ReactNode }) {
  const [unit, setUnit] = useState<WeightUnit>("lb");

  useEffect(() => {
    const saved = localStorage.getItem("petpat-weight-unit");
    if (saved === "kg" || saved === "lb") setUnit(saved);
  }, []);

  useEffect(() => {
    localStorage.setItem("petpat-weight-unit", unit);
  }, [unit]);

  const display = (lbs: number) =>
    unit === "lb" ? lbs : lbs * LBS_TO_KG;
  const parseToLbs = (value: string) => {
    const n = parseFloat(value);
    if (isNaN(n)) return 0;
    return unit === "lb" ? n : n * KG_TO_LBS;
  };

  return (
    <Ctx.Provider
      value={{
        unit,
        setUnit,
        display,
        parseToLbs,
        suffix: unit === "lb" ? "lbs" : "kg",
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useWeightUnit() {
  return useContext(Ctx);
}
