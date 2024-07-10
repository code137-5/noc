import { Outlet } from "react-router-dom";
import { BaseCanvas } from "../components/canvas";

export function BaseCanvasScreen() {
  return (
    <BaseCanvas>
      <Outlet />
    </BaseCanvas>
  );
}
