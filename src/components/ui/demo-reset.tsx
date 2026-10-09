"use client";

import { RotateCcw } from "lucide-react";
import { Button } from "./button";
import { resetDemoState } from "@/lib/storage";

export function DemoReset() {
  return (
    <Button
      variant="ghost"
      className="text-xs"
      onClick={() => {
        resetDemoState();
        window.location.reload();
      }}
    >
      <RotateCcw className="h-4 w-4" />
      Reset Demo
    </Button>
  );
}
