import { Outlet } from "react-router-dom";
import { BaseCanvas } from "../components/canvas";
import { HandTracking } from "../components/doms";
import { handTrackingRef } from "../helpers/handTrackingRef";

export function BaseCanvasScreen() {
  return (
    <>
      <BaseCanvas>
        <Outlet />
      </BaseCanvas>
      <HandTracking ref={handTrackingRef} />
    </>
  );
}
