import { createRef } from "react";

export interface HandPosition {
  x: number;
  y: number;
  z: number;
}
export interface HandTrackingRef {
  getHandPositions: () => {
    l?: HandPosition[];
    r?: HandPosition[];
  };
}

export const handTrackingRef = createRef<HandTrackingRef>();
