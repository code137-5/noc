import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

const temp = new THREE.Object3D();
const v2 = new THREE.Vector2(0, 0);
const color = new THREE.Color(0, 0, 0);

export function Chapter2Screen() {
  const count = 10;

  const instancedMeshRef = useRef<THREE.InstancedMesh>(null);
  const moverRef = useRef(
    [...new Array(count)].map(() => new Mover(Math.random() * 4 + 1, -4, 0))
  );

  useFrame(({ viewport }, delta) => {
    const width = viewport.width / 2;
    const height = viewport.height / 2;

    if (!moverRef.current || !instancedMeshRef.current) return;

    // init
    instancedMeshRef.current.instanceMatrix.needsUpdate = true;

    // set mover
    for (let i = 0; i < count; i++) {
      const mover = moverRef.current[i];

      const wind = { x: 0.01, y: 0 };
      const gravity = { x: 0, y: -0.1 * mover.mass };
      v2.set(mover.velocity.x, mover.velocity.y)
        .multiplyScalar(-1)
        .normalize()
        .multiplyScalar(0.0001);
      const friction = { x: v2.x, y: v2.y };

      mover.applyForce(friction);
      mover.applyForce(wind);
      mover.applyForce(gravity);
      mover.update(delta);
      mover.checkEdges(width, height);

      temp.scale.set(mover.mass / 16, mover.mass / 16, mover.mass / 16);
      temp.position.set(mover.position.x, mover.position.y, 0);
      temp.updateMatrix();
      instancedMeshRef.current.setColorAt(
        i,
        color.set(mover.mass, mover.mass, mover.mass)
      );
      instancedMeshRef.current.setMatrixAt(i, temp.matrix);
    }
  });

  return (
    <>
      <instancedMesh
        ref={instancedMeshRef}
        args={[undefined, undefined, count]}
      >
        <sphereGeometry args={[1]} />
        <meshPhongMaterial />
      </instancedMesh>
    </>
  );
}

class Mover {
  mass: number;
  position: THREE.Vector2;
  velocity: THREE.Vector2;
  acceleration: THREE.Vector2;

  constructor(m: number, x: number, y: number) {
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

  checkEdges(width: number, height: number) {
    if (this.position.x > width) {
      this.position.x = width;
      this.velocity.x *= -1;
    } else if (this.position.x < -width) {
      this.position.x = -width;
      this.velocity.x *= -1;
    }

    if (this.position.y < -height) {
      this.position.y = -height;
      this.velocity.y *= -1;
    }
  }
}
