import { Canvas } from "@react-three/fiber";
import { ReactNode } from "react";

interface BaseCanvasProps {
  children: ReactNode | ReactNode[];
}
export function BaseCanvas({ children }: BaseCanvasProps) {
  return (
    <Canvas
      style={{ display: "flex", width: "100%", backgroundColor: "white" }}
    >
      <ambientLight intensity={Math.PI / 2} />
      <spotLight
        position={[10, 10, 10]}
        angle={0.15}
        penumbra={1}
        decay={0}
        intensity={Math.PI}
      />
      <pointLight position={[-10, -10, -10]} decay={0} intensity={Math.PI} />
      {children}
    </Canvas>
  );
}
