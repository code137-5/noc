import type { GroupProps } from "@react-three/fiber";
import { useMemo } from "react";

import fontJson from "./assets/firasans_regular.json";
import {
  FontLoader,
  TextGeometry,
  FontData,
} from "three/examples/jsm/Addons.js";

const font = new FontLoader().parse(fontJson as any as FontData);
const geom = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"].map(
  (number) => new TextGeometry(number, { font, height: 0.1, size: 5 })
);

type TextProps = GroupProps & {
  color?: string;
  count: string;
};

export function Text({
  color = "white",
  count,
  ...props
}: TextProps): JSX.Element {
  const array = useMemo(() => [...count], [count]);
  return (
    <group {...props} dispose={null}>
      {array.map((char, index) => (
        <mesh
          position={[-(array.length / 2) * 3.5 + index * 3.5, 0, 0]}
          key={index}
          geometry={geom[parseInt(char)]}
        >
          <meshBasicMaterial color={color} transparent opacity={0.5} />
        </mesh>
      ))}
    </group>
  );
}
