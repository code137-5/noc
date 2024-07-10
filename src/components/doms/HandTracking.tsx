import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { useCheckSupportedDevices } from "../../hooks";
import { HandPosition, HandTrackingRef } from "../../helpers/handTrackingRef";

declare const window: { Hands: any; Camera: any; VERSION: any };

export const HandTracking = forwardRef<HandTrackingRef>((_, ref) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [handPositions, setHandPositions] = useState<
    ReturnType<HandTrackingRef["getHandPositions"]>
  >({ l: undefined, r: undefined });

  useCheckSupportedDevices();

  useImperativeHandle(ref, () => ({ getHandPositions: () => handPositions }), [
    handPositions,
  ]);

  const onResults = (props: {
    multiHandedness: [{ label: string }, { label: string }];
    multiHandLandmarks: [HandPosition[], HandPosition[]];
  }) => {
    let r, l;

    if (props.multiHandedness[0]) {
      if (props.multiHandedness[0].label === "Right")
        r = props.multiHandLandmarks[0];
      else l = props.multiHandLandmarks[0];
    }

    if (props.multiHandedness[1]) {
      if (props.multiHandedness[1].label === "Right")
        r = props.multiHandLandmarks[1];
      else l = props.multiHandLandmarks[1];
    }

    setHandPositions({ l, r });
  };

  const handInit = useCallback(() => {
    const hands = new window.Hands({
      locateFile: (file: string) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/hands@${window.VERSION}/${file}`;
      },
    });
    hands.setOptions({
      maxNumHands: 2,
      modelComplexity: 1,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
      selfieMode: true,
    });
    hands.onResults(onResults);

    const camera = new window.Camera(videoRef.current, {
      onFrame: async () => {
        await hands.send({ image: videoRef.current });
      },
      width: 1280,
      height: 720,
    });
    camera.start();
  }, []);

  const [handLoaded, setHandLoaded] = useState(false);

  useEffect(() => {
    const handCheck = () => {
      console.log("check", window.Hands);
      if (window.Hands) {
        setHandLoaded(true);
        handInit();
      }
    };

    let close: number;

    if (!handLoaded) {
      console.log("handLoaded : ", handLoaded);
      close = setInterval(handCheck, 300);
    }

    return () => {
      close && clearInterval(close);
    };
  }, [handLoaded, handInit]);

  const isHandUndefined = useMemo(
    () => handPositions.l === undefined && handPositions.r === undefined,
    [handPositions]
  );

  return (
    <>
      <video style={{ display: "none" }} ref={videoRef} />

      {(!handLoaded || isHandUndefined) && (
        <div
          style={{
            position: "absolute",
            display: "flex",
            top: "2rem",
            width: "100%",
            justifyContent: "center",
            pointerEvents: "none",
            userSelect: "none",
          }}
        >
          <div
            style={{
              color: "#F9FAFB",
              padding: "0.5rem 1rem",
              fontSize: "0.875rem",
              lineHeight: "1.25rem",
              boxShadow:
                "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
              backgroundColor: "rgb(27, 30, 40)",
              maxWidth: "calc(100% - 28px)",
            }}
          >
            {handLoaded ? "카메라에게 손을 보여주세요." : "로딩중입니다."}
          </div>
        </div>
      )}
    </>
  );
});

export default HandTracking;
