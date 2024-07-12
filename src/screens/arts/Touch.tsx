import { Physics } from "@react-three/cannon";
import {
  PhyBox,
  PhyChar,
  PhyPlane,
  PhyString,
} from "../../components/canvas/phy";
import { OrbitControls } from "@react-three/drei";
import { useEffect, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";

export function Touch() {
  const stringListRes = useRef([
    "모두연",
    "모두의☆연구소",
    "7월★19일",
    "전시☆화이팅",
  ]);
  const [list, setList] = useState<string[]>([]);

  useEffect(() => {
    const handle: NodeJS.Timeout = setInterval(() => {
      const string = stringListRes.current[0];
      if (!string) return;

      setList((prev) => [...prev, string]);
      stringListRes.current = stringListRes.current.filter(
        (_, index) => index !== 0
      );
    }, 1000);

    return () => clearInterval(handle);
  }, []);

  useFrame(({ camera }) => {
    camera.position.set(0, 5, 12);
    camera.lookAt(0, 5, 0);
  });

  return (
    <>
      <fog attach="fog" args={["white", 0, 40]} />

      {/* 조명 */}
      <ambientLight intensity={0.4} />
      <directionalLight
        castShadow
        position={[2.5, 8, 5]}
        intensity={1.5}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />
      <pointLight position={[-10, 0, -20]} color="#A6586D" intensity={2.5} />
      <pointLight position={[0, -10, 0]} intensity={1.5} />

      {/* cannon */}
      <Physics gravity={[0, -10, 0]}>
        <PhyPlane
          position={[0, -0.1, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          meshProps={{ visible: false }}
        />
        <PhyPlane position={[0, 0, -5]} meshProps={{ visible: false }} />
        <PhyPlane
          position={[8, 0, 0]}
          rotation={[0, -Math.PI / 2, 0]}
          meshProps={{ visible: false }}
        />

        <PhyBox
          color="#a3a3e9"
          position={[-3, 4, 3]}
          args={[1, 1, 1]}
          meshProps={{
            scale: [1, 1, 1],
            castShadow: true,
            receiveShadow: true,
          }}
        />
        <PhyBox
          color="#fff"
          position={[2, 4, 2]}
          args={[0.5, 0.5, 0.5]}
          meshProps={{
            scale: [0.5, 0.5, 0.5],
            castShadow: true,
            receiveShadow: true,
          }}
        />

        {list.map((item, index) => (
          <PhyString
            key={index}
            color="#F28B66"
            position={[0, (index + 1) * 4, 0]}
            string={item}
            size={2}
            height={1.5}
            wordSpacing={0.001}
            meshProps={{ receiveShadow: true, castShadow: true }}
          />
        ))}

        <PhyChar
          color="#F28B66"
          position={[-1.5, 2, 0]}
          char="와"
          size={3}
          height={0.5}
          meshProps={{ receiveShadow: true, castShadow: true }}
        />
        <PhyChar
          color="#F28B66"
          position={[1.5, 2, 0]}
          char="우"
          size={3}
          height={0.5}
          meshProps={{ receiveShadow: true, castShadow: true }}
        />
      </Physics>

      {/* plane */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.1, 0]}
        receiveShadow
      >
        <planeGeometry attach="geometry" args={[100, 100]} />
        <shadowMaterial attach="material" transparent opacity={0.4} />
      </mesh>

      <OrbitControls />
      {/* <gridHelper /> */}
    </>
  );
}
