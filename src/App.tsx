import { Route, Routes } from "react-router-dom";
import { UndefinedScreen, BaseCanvasScreen, HomeScreen } from "./screens";

import * as Chapters from "./screens/chapters";
import * as Arts from "./screens/arts";

export function App() {
  return (
    <Routes>
      <Route path="/" element={<BaseCanvasScreen />}>
        <Route index element={<HomeScreen />} />
        <Route path="chapter/1" element={<Chapters.Chapter1Screen />} />
        <Route path="chapter/2" element={<Chapters.Chapter2Screen />} />
        <Route path="chapter/3" element={<Chapters.Chapter3Screen />} />

        <Route path="art/hand/flow" element={<Arts.Flow />} />
        <Route path="art/hand/pingpong" element={<Arts.PingPong />} />
        <Route path="art/touch" element={<Arts.Touch />} />

        <Route path="*" element={<UndefinedScreen />} />
      </Route>
    </Routes>
  );
}
