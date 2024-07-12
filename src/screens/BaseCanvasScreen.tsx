import { Outlet, useLocation } from "react-router-dom";
import { BaseCanvas } from "../components/canvas";
import { HandTracking } from "../components/doms";
import { handTrackingRef } from "../helpers/handTrackingRef";

export function BaseCanvasScreen() {
  const { pathname } = useLocation();

  return (
    <>
      <BaseCanvas>
        <Outlet />
      </BaseCanvas>
      {(pathname.includes("hand") || pathname === "/chapter/3") && (
        <HandTracking ref={handTrackingRef} />
      )}
    </>
  );
}
