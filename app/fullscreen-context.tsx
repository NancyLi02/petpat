"use client";

import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";

interface FullScreenCtx {
  isFullScreen: boolean;
  setIsFullScreen: (v: boolean) => void;
}

const Ctx = createContext<FullScreenCtx>({
  isFullScreen: false,
  setIsFullScreen: () => {},
});

export function FullScreenProvider({ children }: { children: ReactNode }) {
  const [isFullScreen, setIsFullScreen] = useState(false);
  return (
    <Ctx.Provider value={{ isFullScreen, setIsFullScreen }}>
      {children}
    </Ctx.Provider>
  );
}

export function useFullScreen() {
  return useContext(Ctx);
}
