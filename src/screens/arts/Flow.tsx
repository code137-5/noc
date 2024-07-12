import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { noise } from "../../helpers";
import { OrbitControls } from "@react-three/drei";
import { Slerp } from "../../components/canvas";

const temp = new THREE.Object3D();
const v2 = new THREE.Vector2(0, 0);
const color = new THREE.Color(0, 0, 0);

export function Flow() {
  const count = 10000;

  const isFirstRef = useRef(true);
  const instancedMeshRef = useRef<THREE.InstancedMesh>(null);
  const moverRef = useRef([...new Array(count)].map(() => new Mover()));

  useFrame(({ viewport, clock }, delta) => {
    const width = viewport.width / 2;
    const height = viewport.height / 2;

    if (isFirstRef.current) {
      isFirstRef.current = false;
      for (let i = 0; i < count; i++) {
        const mover = moverRef.current[i];
        mover.init(
          Math.random() * 20 + 1,
          Math.random() * (viewport.width + 4) - (width + 2),
          Math.random() * (viewport.height + 4) - (height + 2)
        );
      }
    }

    if (!moverRef.current || !instancedMeshRef.current) return;

    // init
    instancedMeshRef.current.instanceMatrix.needsUpdate = true;

    // set mover
    for (let i = 0; i < count; i++) {
      const mover = moverRef.current[i];

      const noiseScale = 0.14;
      const angle =
        noise(
          mover.position.x * noiseScale,
          mover.position.y * noiseScale,
          clock.oldTime * 0.0001
        ) *
        Math.PI *
        2;

      v2.set(Math.sin(angle), Math.cos(angle)).normalize().multiplyScalar(0.1);
      const wind = { x: v2.x, y: v2.y };
      mover.applyForce(wind);

      v2.set(mover.velocity.x, mover.velocity.y)
        .multiplyScalar(-1)
        .normalize()
        .multiplyScalar(0.096);
      const friction = { x: v2.x, y: v2.y };
      mover.applyForce(friction);

      mover.update(delta);
      mover.checkEdges(width, height);

      temp.scale.set(mover.mass / 50, mover.mass / 50, mover.mass / 50);
      temp.position.set(mover.position.x, mover.position.y, -mover.mass * 0.2);
      temp.updateMatrix();
      instancedMeshRef.current.setColorAt(
        i,
        color.set(0, mover.mass / 4 + 0.4, mover.mass / 4 + 0.4)
      );
      instancedMeshRef.current.setMatrixAt(i, temp.matrix);
    }
  });

  return (
    <Slerp inputType="handTracking">
      <instancedMesh
        ref={instancedMeshRef}
        args={[undefined, undefined, count]}
      >
        <sphereGeometry args={[1]} />
        <meshPhongMaterial />
      </instancedMesh>
      <OrbitControls />
    </Slerp>
  );
}

class Mover {
  mass: number;
  position: THREE.Vector2;
  velocity: THREE.Vector2;
  acceleration: THREE.Vector2;

  constructor() {
    this.mass = 0;
    this.position = new THREE.Vector2(0, 0);
    this.velocity = new THREE.Vector2(0, 0);
    this.acceleration = new THREE.Vector2(0, 0);
  }

  init(m: number, x: number, y: number) {
    this.mass = m;
    this.position = new THREE.Vector2(x, y);
    this.velocity = new THREE.Vector2(0, 0);
    this.acceleration = new THREE.Vector2(0, 0);
  }

  applyForce(force: THREE.Vec2) {
    this.acceleration.add(v2.set(force.x, force.y).divideScalar(this.mass));
  }

  update(delta: number) {
    this.velocity.add(this.acceleration);
    this.position.add({
      x: this.velocity.x * delta,
      y: this.velocity.y * delta,
    });
    this.acceleration.set(0, 0);
  }

  checkEdges(w: number, h: number) {
    const padding = 4;
    const width = w + padding;
    const height = h + padding;

    if (this.position.x > width) {
      this.position.x = -width;
    } else if (this.position.x < -width) {
      this.position.x = width;
    }

    if (this.position.y > height) {
      this.position.y = -height;
    } else if (this.position.y < -height) {
      this.position.y = height;
    }
  }
}
