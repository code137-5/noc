import { useMemo, useRef, Fragment } from "react";
import * as THREE from "three";
import { extend, MeshProps, Object3DNode } from "@react-three/fiber";

import {
  useBox,
  usePlane,
  PlaneProps,
  BoxProps,
  useConeTwistConstraint,
} from "@react-three/cannon";

import {
  FontLoader,
  TextGeometry,
  FontData,
} from "three/examples/jsm/Addons.js";

import fontJson from "./assets/Do Hyeon_Regular.json";

extend({ TextGeometry });

declare global {
  namespace JSX {
    interface IntrinsicElements {
      readonly textGeometry: Object3DNode<TextGeometry, typeof TextGeometry>;
    }
  }
}

/* Plane */
interface phyPlaneProps extends PlaneProps {
  meshProps?: MeshProps;
}
export function PhyPlane({ meshProps, ...props }: phyPlaneProps) {
  const [ref] = usePlane(() => ({ ...props }));

  return (
    <mesh {...meshProps} ref={ref as any}>
      <planeGeometry args={[100, 100]} />
      <meshStandardMaterial />
    </mesh>
  );
}
PhyPlane.defaultProps = { meshProps: undefined };

/* Box */
interface phyBoxProps extends BoxProps {
  color: string;
  meshProps?: MeshProps;
}
export function PhyBox({ color, meshProps, ...props }: phyBoxProps) {
  const [ref, api] = useBox(() => ({
    mass: 1,
    ...props,
  }));

  return (
    <mesh
      {...meshProps}
      ref={ref as any}
      onClick={() => api.applyImpulse([5, 0, -5], [0, 0, 0])}
    >
      <boxGeometry />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}
PhyBox.defaultProps = { meshProps: undefined };

/* Char */
interface phyCharProps extends BoxProps {
  char: string;
  size: number;
  height: number;
  color: string;
  meshProps?: MeshProps;
  bodyCallback?: (
    body: React.MutableRefObject<THREE.Object3D | undefined>
  ) => void;
  boxCallback?: (
    box: React.MutableRefObject<THREE.Vector3 | undefined>
  ) => void;
  force: number;
}

export function PhyChar({
  char,
  size,
  height,
  color,
  meshProps,
  bodyCallback,
  boxCallback,
  force,
  ...props
}: phyCharProps) {
  const font = useMemo(() => {
    const loader = new FontLoader();
    const f = loader.parse(fontJson as any as FontData);
    return f;
  }, []);

  const box = useRef<THREE.Vector3>();

  // console.log(box);

  const [ref, api] = useBox(() => ({
    mass: 1,
    ...props,
    args: box.current
      ? [box.current.x, box.current.y, box.current.z]
      : [size, size, height],
  }));

  if (bodyCallback) bodyCallback(ref as any);
  if (boxCallback) boxCallback(box);

  return (
    <mesh
      {...meshProps}
      ref={ref as any}
      onClick={(event) => {
        meshProps?.onClick && meshProps.onClick(event);
        api.applyImpulse([0, 0, -force], [0, 0, 0]);
      }}
    >
      <textGeometry
        onUpdate={(self) => {
          self.center();
          self.computeBoundingBox();
          box.current = self.boundingBox?.getSize(new THREE.Vector3());
        }}
        args={[char[0], { font, size, height }]}
      />
      <meshStandardMaterial roughness={0.6} color={color} />
    </mesh>
  );
}
PhyChar.defaultProps = {
  meshProps: undefined,
  bodyCallback: undefined,
  boxCallback: undefined,
};

function ConeTwistConstraint({
  bodyA,
  bodyB,
  boxA,
  boxB,
  wordSpacing,
  size,
}: {
  bodyA: React.MutableRefObject<THREE.Object3D | undefined>;
  bodyB: React.MutableRefObject<THREE.Object3D | undefined>;
  boxA: React.MutableRefObject<THREE.Vector3 | undefined>;
  boxB: React.MutableRefObject<THREE.Vector3 | undefined>;
  size: number;
  wordSpacing: number;
}) {
  // console.log("bodyA", JSON.stringify(bodyA));
  // console.log("bodyB", JSON.stringify(bodyB));
  // console.log("boxA", JSON.stringify(boxA));
  // console.log("boxB", JSON.stringify(boxB));

  const optns = {
    pivotA: [
      (boxA.current?.x || size + wordSpacing) / 2,
      -((boxA.current?.y || size + wordSpacing) / 2),
      0,
    ],
    pivotB: [
      -((boxB.current?.x || size + wordSpacing) / 2),
      -((boxB.current?.y || size + wordSpacing) / 2),
      0,
    ],
    collideConnected: true,
  };

  useConeTwistConstraint(bodyA as any, bodyB as any, optns as any);

  return <></>;
}

/* String */
interface phyStringProps extends BoxProps {
  string: string;
  size: number;
  height: number;
  color: string;
  wordSpacing: number;
  force: number;
  meshProps?: MeshProps;
}
export function PhyString({
  string,
  size,
  height,
  color,
  meshProps,
  wordSpacing,
  force,
  ...props
}: phyStringProps) {
  const bodys: React.MutableRefObject<THREE.Object3D | undefined>[] = [];
  const boxs: React.MutableRefObject<THREE.Vector3 | undefined>[] = [];

  const getBody = (
    body: React.MutableRefObject<THREE.Object3D | undefined>
  ) => {
    bodys.push(body);
  };
  const getBox = (box: React.MutableRefObject<THREE.Vector3 | undefined>) => {
    boxs.push(box);
  };

  const { position } = props;
  const standardPosition = position || [0, 0, 0];

  const groupCenterX =
    (size * string.length + wordSpacing * (string.length - 1)) / 2;

  // console.log("standardPosition", standardPosition);
  // console.log("groupCenterX", groupCenterX);

  const components = Array.from(string).map((char, i) => {
    const charCenterX = i * size + i * wordSpacing + size / 2;
    // console.log(i, "charCenterX", charCenterX);

    return PhyChar({
      ...props,
      position: [
        standardPosition[0] + charCenterX - groupCenterX,
        standardPosition[1],
        standardPosition[2],
      ],
      color,
      char,
      size,
      height,
      meshProps,
      bodyCallback: getBody,
      boxCallback: getBox,
      force,
    });
  });

  return (
    <group>
      {components.map((c, i) => (
        <Fragment key={i}>{c}</Fragment>
      ))}

      {Array.from(string).map((char, i) => (
        <Fragment key={`${char}${i}`}>
          {i !== 0 ? (
            <ConeTwistConstraint
              bodyA={bodys[i - 1]}
              bodyB={bodys[i]}
              boxA={boxs[i - 1]}
              boxB={boxs[i]}
              wordSpacing={wordSpacing}
              size={size}
            />
          ) : (
            <></>
          )}
        </Fragment>
      ))}
    </group>
  );
}
PhyString.defaultProps = { meshProps: undefined };
