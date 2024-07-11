import { Physics, useBox, usePlane, useSphere } from "@react-three/cannon";
import type { GLTF } from "three/examples/jsm/loaders/GLTFLoader.js";
import { useGLTF } from "@react-three/drei";
import { useFrame, useLoader } from "@react-three/fiber";
import lerp from "lerp";
import { clamp } from "es-toolkit";
import {
  forwardRef,
  Suspense,
  useCallback,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import type { Group, Material, Mesh, Object3D, Skeleton } from "three";
import { TextureLoader } from "three";
import { Text } from "./Text";

import earthImg from "./assets/cross.jpg";
import pingSound from "./assets/ping.mp3";
import { handTrackingRef } from "../../../helpers/handTrackingRef";

interface PingPongProps {
  inputType?: "mouse" | "handTracking";
}
export function PingPong({ inputType = "mouse" }: PingPongProps) {
  const ref = useRef<PaddleRef>(null);
  const [welcome, setWelcome] = useState(true);

  return (
    <>
      <color attach="background" args={["#171720"]} />
      {/* <ambientLight intensity={0.5 * Math.PI} /> */}
      {/* <pointLight decay={0} intensity={Math.PI} position={[-10, -10, -10]} /> */}
      {/* <spotLight
      angle={0.3}
      castShadow
      decay={0}
      intensity={Math.PI}
      penumbra={1}
      position={[10, 10, 10]}
      shadow-mapSize-width={2048}
      shadow-mapSize-height={2048}
      shadow-bias={-0.0001}
    /> */}
      <Physics
        iterations={20}
        tolerance={0.0001}
        defaultContactMaterial={{
          contactEquationRelaxation: 1,
          contactEquationStiffness: 1e7,
          friction: 0.9,
          frictionEquationRelaxation: 2,
          frictionEquationStiffness: 1e7,
          restitution: 0.7,
        }}
        gravity={[0, -40, 0]}
        allowSleep={false}
      >
        <mesh position={[0, 0, -10]} receiveShadow>
          <planeGeometry args={[1000, 1000]} />
          <meshPhongMaterial color="#172017" />
        </mesh>
        <ContactGround onDrop={() => ref.current?.reset()} />
        {!welcome && <Ball />}
        <Suspense fallback={null}>
          <Paddle
            welcome={welcome}
            setWelcome={setWelcome}
            ref={ref}
            inputType={inputType}
          />
        </Suspense>
      </Physics>
    </>
  );
}

const ping = new Audio(pingSound);

type PingPongGLTF = GLTF & {
  materials: Record<
    "foam" | "glove" | "lower" | "side" | "upper" | "wood",
    Material
  >;
  nodes: Record<"Bone" | "Bone003" | "Bone006" | "Bone010", Object3D> &
    Record<"mesh" | "mesh_1" | "mesh_2" | "mesh_3" | "mesh_4", Mesh> & {
      arm: Mesh & { skeleton: Skeleton };
    };
};

interface PaddleProps {
  inputType?: "mouse" | "handTracking";
  welcome: boolean;
  setWelcome: (welcome: boolean) => void;
}
interface PaddleRef {
  reset: () => void;
}
const Paddle = forwardRef<PaddleRef, PaddleProps>(
  ({ inputType, welcome, setWelcome }, ref) => {
    const [count, setCount] = useState(0);
    const pong = (velocity: number) => {
      ping.currentTime = 0;
      ping.volume = clamp(velocity / 20, 0, 1);
      ping.play();
      if (velocity > 4) setCount((prev) => prev + 1);
    };
    const reset = useCallback(() => {
      setCount(0);
      setWelcome(true);
    }, []);
    const start = () => {
      setWelcome(false);
    };

    useImperativeHandle(ref, () => ({ reset }), [reset]);

    const { nodes, materials } = useGLTF(
      "/pingpong.glb",
      "/draco-gltf/"
    ) as any as PingPongGLTF;

    const model = useRef<Group>(null);
    const [meshRef, api] = useBox(
      () => ({
        args: [3.4, 1, 3],
        onCollide: (e) => {
          pong(e.contact.impactVelocity);
        },
        type: "Kinematic",
      }),
      useRef<Mesh>(null)
    );
    const values = useRef([0, 0]);
    useFrame(({ pointer }) => {
      let x = 0;
      let y = 0;

      if (inputType === "handTracking") {
        const hands = handTrackingRef.current?.getHandPositions();
        const hand = hands?.l || hands?.r;
        if (hand) {
          start();
          x = hand[0].x * 2 - 1;
          y = -(hand[0].y * 2 - 1);
        } else {
          !welcome && reset();
        }
      } else {
        x = pointer.x;
        y = pointer.y;
      }
      console.log(x, y);
      console.log(pointer.x, pointer.y);

      values.current[0] = lerp(values.current[0], (x * Math.PI) / 5, 0.2);
      values.current[1] = lerp(values.current[1], (x * Math.PI) / 5, 0.2);
      api.position.set(x * 10, y * 5, 0);
      api.rotation.set(0, 0, values.current[1]);
      if (!model.current) return;
      model.current.rotation.x = lerp(
        model.current.rotation.x,
        welcome ? Math.PI / 2 : 0,
        0.2
      );
      model.current.rotation.y = values.current[0];
    });

    return (
      <mesh ref={meshRef} dispose={null}>
        <group
          ref={model}
          position={[-0.05, 0.37, 0.3]}
          scale={[0.15, 0.15, 0.15]}
        >
          <Text
            rotation={[-Math.PI / 2, 0, 0]}
            position={[0, 1, 2]}
            count={count.toString()}
          />
          <group rotation={[1.88, -0.35, 2.32]} scale={[2.97, 2.97, 2.97]}>
            <primitive object={nodes.Bone} />
            <primitive object={nodes.Bone003} />
            <primitive object={nodes.Bone006} />
            <primitive object={nodes.Bone010} />
            <skinnedMesh
              castShadow
              receiveShadow
              material={materials.glove}
              material-roughness={1}
              geometry={nodes.arm.geometry}
              skeleton={nodes.arm.skeleton}
            />
          </group>
          <group rotation={[0, -0.04, 0]} scale={[141.94, 141.94, 141.94]}>
            <mesh
              castShadow
              receiveShadow
              material={materials.wood}
              geometry={nodes.mesh.geometry}
            />
            <mesh
              castShadow
              receiveShadow
              material={materials.side}
              geometry={nodes.mesh_1.geometry}
            />
            <mesh
              castShadow
              receiveShadow
              material={materials.foam}
              geometry={nodes.mesh_2.geometry}
            />
            <mesh
              castShadow
              receiveShadow
              material={materials.lower}
              geometry={nodes.mesh_3.geometry}
            />
            <mesh
              castShadow
              receiveShadow
              material={materials.upper}
              geometry={nodes.mesh_4.geometry}
            />
          </group>
        </group>
      </mesh>
    );
  }
);

function Ball() {
  const map = useLoader(TextureLoader, earthImg);
  const [ref] = useSphere(
    () => ({ args: [0.5], mass: 1, position: [0, 5, 0] }),
    useRef<Mesh>(null)
  );

  return (
    <mesh castShadow ref={ref}>
      <sphereGeometry args={[0.5, 64, 64]} />
      <meshStandardMaterial map={map} />
    </mesh>
  );
}

interface ContactGroundProps {
  onDrop: () => void;
}

function ContactGround({ onDrop }: ContactGroundProps) {
  const [ref] = usePlane(
    () => ({
      onCollide: onDrop,
      position: [0, -10, 0],
      rotation: [-Math.PI / 2, 0, 0],
      type: "Static",
    }),
    useRef<Mesh>(null)
  );
  return <mesh ref={ref} />;
}

{
  /* <div style={style(welcome)}>* click anywhere to start</div>; */
}
// const style = (welcome: boolean) =>
//   ({
//     color: "white",
//     display: welcome ? "block" : "none",
//     fontSize: "1.2em",
//     left: 50,
//     position: "absolute",
//     top: 50,
//   } as const);

// export default function () {
//   const welcome = useStore((state) => state.welcome);
//   const { reset } = useStore((state) => state.api);

//   return (

//   );
// }
