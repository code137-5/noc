import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Mesh } from "three";
import { Box } from "@react-three/drei";

export function UndefinedScreen() {
  return (
    <group>
      <ClickableBox position={[-1.2, 0, 0]} />
      <ClickableBox position={[1.2, 0, 0]} />
    </group>
  );
}

interface ClickableBoxProps {
  position: [number, number, number];
}
function ClickableBox({ ...props }: ClickableBoxProps) {
  // This reference will give us direct access to the mesh
  const meshRef = useRef<Mesh>(null);

  // Set up state for the hovered and active state
  const [hovered, setHover] = useState(false);
  const [active, setActive] = useState(false);

  // Subscribe this component to the render-loop, rotate the mesh every frame
  useFrame((_, delta) => {
    if (meshRef.current) meshRef.current.rotation.x += delta;
  });

  // Return view, these are regular three.js elements expressed in JSX
  return (
    <Box
      {...props}
      ref={meshRef}
      scale={active ? 1.5 : 1}
      onClick={() => setActive(!active)}
      onPointerOver={() => setHover(true)}
      onPointerOut={() => setHover(false)}
      args={[1, 1, 1]}
      material-color={hovered ? "hotpink" : "orange"}
    />
  );
}
