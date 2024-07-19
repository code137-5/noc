import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { noise } from "../../helpers";
import { OrbitControls } from "@react-three/drei";
import { Slerp } from "../../components/canvas";
import { handTrackingRef } from "../../helpers/handTrackingRef";
import { easings, useSprings } from "@react-spring/web";
// import BezierEasing from "bezier-easing";

const temp = new THREE.Object3D();
const v2 = new THREE.Vector2(0, 0);
const color = new THREE.Color(0, 0, 0);

export function Flow() {
  const count = 18000;

  const [animation, api] = useSprings(count, () => ({ scale: 1 }), []);

  const isFirstRef = useRef(true);
  const instancedMesh1Ref = useRef<THREE.InstancedMesh>(null);
  // const instancedMesh2Ref = useRef<THREE.InstancedMesh>(null);
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

    if (
      !moverRef.current ||
      !instancedMesh1Ref.current
      // || !instancedMesh2Ref.current
    )
      return;

    // init
    instancedMesh1Ref.current.instanceMatrix.needsUpdate = true;
    // instancedMesh2Ref.current.instanceMatrix.needsUpdate = true;

    // set mover
    for (let i = 0; i < count; i++) {
      const mover = moverRef.current[i];

      const isActive = mover.checkHand();

      if (api.current[i].idle && isActive) {
        api.start((index) => {
          if (index !== i) return;

          return {
            from: { scale: 1 },
            to: [{ scale: 0 }, { scale: 1 }],
            config: {
              mass: mover.mass / 10,
              easing: easings.easeOutQuint,
            },
          };
        });
      }

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

      const animationScale = animation[i].scale.get();
      temp.scale.set(
        (mover.mass / (mover.isActive ? 25 : 50)) * animationScale,
        (mover.mass / (mover.isActive ? 25 : 50)) * animationScale,
        (mover.mass / (mover.isActive ? 25 : 50)) * animationScale
      );
      temp.position.set(mover.position.x, mover.position.y, -mover.mass * 0.2);
      temp.updateMatrix();
      instancedMesh1Ref.current.setColorAt(
        i,
        color.set(0, mover.mass / 4 + 0.4, mover.mass / 4 + 0.4)
      );

      instancedMesh1Ref.current.setMatrixAt(i, temp.matrix);
      // if (!mover.isActive) {
      //   instancedMesh1Ref.current.setMatrixAt(i, temp.matrix);
      //   temp.scale.set(0, 0, 0);
      //   temp.updateMatrix();
      //   instancedMesh2Ref.current.setMatrixAt(i, temp.matrix);
      // } else {
      //   instancedMesh2Ref.current.setMatrixAt(i, temp.matrix);
      //   temp.scale.set(0, 0, 0);
      //   temp.updateMatrix();
      //   instancedMesh1Ref.current.setMatrixAt(i, temp.matrix);
      // }
    }
  });

  return (
    <Slerp inputType="handTracking">
      <instancedMesh
        ref={instancedMesh1Ref}
        args={[undefined, undefined, count]}
      >
        <sphereGeometry args={[1]} />
        <meshPhongMaterial />
      </instancedMesh>
      {/* <InstancedStar
        ref={instancedMesh2Ref}
        args={[undefined, undefined, count]}
      /> */}
      <OrbitControls />
    </Slerp>
  );
}

class Mover {
  mass: number;
  position: THREE.Vector2;
  velocity: THREE.Vector2;
  acceleration: THREE.Vector2;

  isActive: boolean;

  constructor() {
    this.mass = 0;
    this.position = new THREE.Vector2(0, 0);
    this.velocity = new THREE.Vector2(0, 0);
    this.acceleration = new THREE.Vector2(0, 0);
    this.isActive = false;
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

  checkHand() {
    const hands = handTrackingRef.current?.getHandPositions();

    const hand = [...(hands?.l || []), ...(hands?.r || [])];

    let isActive = false;
    v2.set(this.position.x, this.position.y);

    const w = { x: 14, y: -10, z: -10 * 1.8 };
    const b = { x: -6.5, y: 3.5, z: 0 };

    for (let i = 0; i < hand.length; i = i + 1) {
      const { x, y } = hand[i];
      const handX = x * w.x + b.x;
      const handY = y * w.y + b.y;

      if (v2.distanceTo({ x: handX, y: handY }) < 0.2) {
        isActive = true;
      }
    }

    return isActive;
  }
}
