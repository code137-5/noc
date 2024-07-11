import { Route, Routes } from "react-router-dom";
import {
  UndefinedScreen,
  Chapter1Screen,
  Chapter2Screen,
  Chapter3Screen,
  Chapter4Screen,
  BaseCanvasScreen,
  HomeScreen,
} from "./screens";

export function App() {
  return (
    <Routes>
      <Route path="/" element={<BaseCanvasScreen />}>
        <Route index element={<HomeScreen />} />
        <Route path="chapter/1" element={<Chapter1Screen />} />
        <Route path="chapter/2" element={<Chapter2Screen />} />
        <Route path="chapter/3" element={<Chapter3Screen />} />
        <Route path="chapter/4" element={<Chapter4Screen />} />

        <Route path="*" element={<UndefinedScreen />} />
      </Route>
    </Routes>
  );
}
