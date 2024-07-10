import { Sphere } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

const temp = new THREE.Object3D();
const v2 = new THREE.Vector2(0, 0);

export function Chapter1Screen() {
  const count = 1000000;

  const instancedMeshRef = useRef<THREE.InstancedMesh>(null);
  const boxRef = useRef(
    [...new Array(count)].map(() => ({
      position: { x: Math.random() * 4 - 2, y: Math.random() * 4 - 2 },
      speed: { x: 0, y: 0 },
    }))
  );

  const sphereRef = useRef<THREE.Mesh>(null);

  useFrame(({ viewport, pointer }, delta) => {
    const width = viewport.width / 2;
    const height = viewport.height / 2;

    if (
      !boxRef.current ||
      !sphereRef.current?.position ||
      !instancedMeshRef.current
    )
      return;

    // init
    instancedMeshRef.current.instanceMatrix.needsUpdate = true;

    // set sphere
    const spherePosition = sphereRef.current?.position;
    spherePosition.x = pointer.x * width;
    spherePosition.y = pointer.y * height;

    // set box
    for (let i = 0; i < count; i++) {
      const box = boxRef.current[i];

      const speed = temp.position;

      const acceleration = v2
        .set(spherePosition.x, spherePosition.y)
        .sub(box.position)
        .normalize()
        .multiplyScalar(0.1);

      const limit = 6;
      speed
        .set(box.speed.x, box.speed.y, 0)
        .add({ x: acceleration.x, y: acceleration.y, z: 0 })
        .min({ x: limit, y: limit, z: limit })
        .max({ x: -limit, y: -limit, z: -limit });

      box.position.x += speed.x * delta;
      box.position.y += speed.y * delta;

      box.speed.x = speed.x;
      box.speed.y = speed.y;

      if (box.position.x > width || box.position.x < -width) {
        box.position.x *= -1;
      }
      if (box.position.y > height || box.position.y < -height) {
        box.position.y *= -1;
      }

      temp.position.set(box.position.x, box.position.y, 0);
      temp.updateMatrix();
      instancedMeshRef.current.setMatrixAt(i, temp.matrix);
    }
  });

  return (
    <>
      <instancedMesh
        ref={instancedMeshRef}
        args={[undefined, undefined, count]}
      >
        <boxGeometry args={[0.01, 0.01, 0.01]} />
        <meshPhongMaterial />
      </instancedMesh>
      <Sphere ref={sphereRef} position={[1, 1, 0]} scale={0.1} />
    </>
  );
}

// import { Box, Sphere } from "@react-three/drei";
// import { useFrame } from "@react-three/fiber";
// import { useRef } from "react";
// import * as THREE from "three";

// const v2 = new THREE.Vector2(0, 0);

// export function Chapter1Screen() {
//   const count = 100000;

//   const boxRef = useRef<
//     { mesh: THREE.Mesh; speed: { x: number; y: number } }[]
//   >([]);

//   const sphereRef = useRef<THREE.Mesh>(null);

//   useFrame(({ viewport, pointer }, delta) => {
//     const width = viewport.width / 2;
//     const height = viewport.height / 2;

//     if (!boxRef.current || !sphereRef.current?.position) return;

//     // set sphere
//     const spherePosition = sphereRef.current?.position;
//     spherePosition.x = pointer.x * width;
//     spherePosition.y = pointer.y * height;

//     // set box
//     for (let i = 0; i < count; i++) {
//       const box = boxRef.current[i];

//       const _acceleration = v2
//         .set(spherePosition.x, spherePosition.y)
//         .sub(box.mesh.position)
//         .normalize()
//         .multiplyScalar(0.1);
//       const acceleration = { x: _acceleration.x, y: _acceleration.y };

//       const limit = 6;
//       v2.set(box.speed.x, box.speed.y)
//         .add({ x: acceleration.x, y: acceleration.y })
//         .min({ x: limit, y: limit })
//         .max({ x: -limit, y: -limit });

//       box.mesh.position.x += v2.x * delta;
//       box.mesh.position.y += v2.y * delta;

//       box.speed.x = v2.x;
//       box.speed.y = v2.y;

//       if (box.mesh.position.x > width || box.mesh.position.x < -width) {
//         box.mesh.position.x *= -1;
//       }
//       if (box.mesh.position.y > height || box.mesh.position.y < -height) {
//         box.mesh.position.y *= -1;
//       }
//     }
//   });

//   return (
//     <>
//       {[...new Array(count)].map((_, index) => (
//         <Box
//           key={index}
//           ref={(r) => {
//             if (r) boxRef.current[index] = { mesh: r, speed: { x: 0, y: 0 } };
//           }}
//           position={[Math.random() * 4 - 2, Math.random() * 4 - 2, 0]}
//           args={[0.01, 0.01, 0.01]}
//         />
//       ))}

//       <Sphere ref={sphereRef} position={[1, 1, 0]} scale={0.1} />
//     </>
//   );
// }
