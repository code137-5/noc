import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "@react-three/drei";
import { noise } from "../helpers";

const temp = new THREE.Object3D();

interface PerlinHelperProps {
  size: number;
  div: number;
}
export function PerlinHelper({ size, div }: PerlinHelperProps) {
  const count = Math.floor((size / div) * (size / div));
  const lineInstancedMeshRef = useRef<THREE.InstancedMesh>(null);

  useFrame(({ clock }) => {
    if (!lineInstancedMeshRef.current) return;

    // Set positions
    for (let i = 0; i < count; i++) {
      const rows = size / div;
      const x = (i % rows) * div - size / 2;
      const y = Math.floor(i / rows) * div - size / 2;

      temp.position.set(x, y, 0);
      const noiseScale = 0.14;
      const angle =
        noise(x * noiseScale, y * noiseScale, clock.oldTime * 0.0001) *
        Math.PI *
        2;
      temp.lookAt(Math.sin(angle) + x, Math.cos(angle) + y, 0);
      temp.rotateX(Math.PI / 2);
      temp.updateMatrix();
      lineInstancedMeshRef.current.setMatrixAt(i, temp.matrix);
    }

    // Update the instance
    lineInstancedMeshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <>
      <OrbitControls />
      {/* <gridHelper /> */}
      <instancedMesh
        ref={lineInstancedMeshRef}
        args={[undefined, undefined, count]}
      >
        <cylinderGeometry args={[0.002, 0.001, 0.1, 8]} />
        <meshBasicMaterial color={"red"} />
      </instancedMesh>
    </>
  );
}
