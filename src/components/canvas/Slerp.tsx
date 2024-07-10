import { useFrame } from "@react-three/fiber";
import React, { useMemo, useRef } from "react";
import * as THREE from "three";
import { handTrackingRef } from "../../helpers/handTrackingRef";

interface SlerpProps {
  children: React.ReactNode;
  inputType?: "mouse" | "handTracking";
}
export function Slerp({ children, inputType = "mouse", ...args }: SlerpProps) {
  const group = useRef({} as THREE.Group);

  const [rotationEuler, rotationQuaternion] = useMemo(
    () => [new THREE.Euler(0, 0, 0), new THREE.Quaternion(0, 0, 0, 0)],
    []
  );

  useFrame(({ viewport, pointer }) => {
    if (!group.current) return;

    let x = 0;
    let y = 0;
    if (inputType === "handTracking") {
      const hands = handTrackingRef.current?.getHandPositions();
      const hand = hands?.l || hands?.r;
      if (hand) {
        x = (hand[0].x * 2 - 1) / 2;
        y = (hand[0].y * 2 - 1) / 2;
      }
    } else {
      x = (pointer.x * viewport.width) / 50;
      y = -(pointer.y * viewport.height) / 50;
    }

    rotationEuler.set(y, x, 0);
    rotationQuaternion.setFromEuler(rotationEuler);
    group.current.quaternion.slerp(
      rotationQuaternion,
      y === 0 && x === 0 ? 0.03 : 0.05
    );
  });

  return (
    <group {...args} ref={group}>
      {children}
    </group>
  );
}
