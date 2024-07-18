import { Physics } from "@react-three/cannon";
import { PhyPlane, PhyString } from "../../components/canvas/phy";
import { useEffect, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";

import colors from "nice-color-palettes";

function shuffle(array: string[]) {
  let currentIndex = array.length;

  // While there remain elements to shuffle...
  while (currentIndex != 0) {
    // Pick a remaining element...
    const randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }

  return array;
}

const getList = () => {
  const creativeCodingLabWords = [
    "공유",
    "성장",
    "연구",
    "커뮤니티",
    "교육",
    "가치",
    "함께",
    "지식",
    "전파",

    "예술",
    "창조적",
    "실험",
    "네트워킹",
    "유통",
    "지원",
    "플랫폼",
    "예술가",
    "예술기업",

    "융합",
    "비주얼테크",
    "사운드테크",
    "경험",
    "연구",
    "결과",
    "비즈니스",
    "고민",
    "멘토",
    "교류",

    "전시",
    "인터랙티브",
    "결과물",
    "강연",
    "발표",
    "프로젝트",
    "워터마크",
    "기술",
    "알고리즘",
    "디지털",
    "피지컬굿즈",
    "수익화",
    "음악제작",
    "인공지능",
    "네트워킹",
    "패널톡",
    "Q&A",

    "생성형AI",
    "최신연구",
    "융합비즈니스",
    "비주얼테크",
    "사운드테크",
    "개발자",
    "연구소모임",
  ];

  return [
    "CREATE",
    "CODING",
    "LAB",
    "137.5",
    ...shuffle([
      "Share",
      "Value",
      "Grow",
      "Together",
      "아트코리아랩",
      "Art×Tech",
      "LAB",
      "중간공유회",
    ]),
    ...shuffle(creativeCodingLabWords),
  ];
};
export function Touch() {
  const colorSeed = useRef(Math.floor(Math.random() * 98));
  const [res, setRes] = useState(
    getList().map((item, index) => ({
      string: item,
      color: colors[colorSeed.current][index % 5],
    }))
  );
  const stringListRes = useRef(res);
  const [list, setList] = useState<{ string: string; color: string }[]>([]);

  const reset = () => {
    colorSeed.current = Math.floor(Math.random() * 90);
    const newRes = getList().map((item, index) => ({
      string: item,
      color: colors[colorSeed.current][index % 5],
    }));
    setRes(newRes);
    stringListRes.current = newRes;
    setList([]);
  };

  useEffect(() => {
    const handle: NodeJS.Timeout = setInterval(() => {
      const string = stringListRes.current[0];
      if (!string) return;

      setList((prev) => [...(prev.length > 8 ? prev.slice(1) : prev), string]);
      stringListRes.current = stringListRes.current.filter(
        (_, index) => index !== 0
      );
    }, 800);

    return () => clearInterval(handle);
  }, [res]);

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
        <PhyPlane position={[0, 0, -15]} meshProps={{ visible: false }} />
        <PhyPlane
          position={[15, 0, 0]}
          rotation={[0, -Math.PI / 2, 0]}
          meshProps={{ visible: false }}
        />

        <PhyString
          color={colors[colorSeed.current + 1][0]}
          position={[-3, 4, 3]}
          string="다시하기"
          size={0.5}
          height={0.3}
          wordSpacing={0.1}
          meshProps={{ receiveShadow: true, castShadow: true, onClick: reset }}
          force={10}
        />

        {list.map(({ string, color }, index) => (
          <PhyString
            key={string}
            color={color}
            position={[0, Math.min((index + 1) * 4, 20), 0]}
            string={string}
            size={2}
            height={1.5}
            wordSpacing={0.001}
            meshProps={{ receiveShadow: true, castShadow: true }}
            force={100}
          />
        ))}

        <PhyString
          color={colors[colorSeed.current + 2][0]}
          position={[-4.5, 2, 0]}
          string="모두의"
          size={3}
          height={0.5}
          wordSpacing={0.001}
          meshProps={{ receiveShadow: true, castShadow: true }}
          force={100}
        />
        <PhyString
          color={colors[colorSeed.current + 2][0]}
          position={[4.5, 2, 0]}
          string="연구소"
          size={3}
          height={0.5}
          wordSpacing={0.001}
          meshProps={{ receiveShadow: true, castShadow: true }}
          force={100}
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

      {/* <OrbitControls /> */}
      {/* <gridHelper /> */}
    </>
  );
}
