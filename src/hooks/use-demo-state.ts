"use client";

import { useCallback, useEffect, useState } from "react";
import { createDefaultDemoState, readDemoState, resetDemoState, writeDemoState } from "@/lib/storage";
import type { DemoState } from "@/types";

export function useDemoState() {
  const [state, setState] = useState<DemoState>(() => createDefaultDemoState());

  useEffect(() => {
    setState(readDemoState());
  }, []);

  const save = useCallback((nextState: DemoState) => {
    writeDemoState(nextState);
    setState(nextState);
  }, []);

  const reset = useCallback(() => {
    setState(resetDemoState());
  }, []);

  return { state, setState: save, reset };
}
