import React from "react";
import {Composition} from "remotion";
import {DailyHotlistIntro} from "./DailyHotlistIntro.jsx";

export const RemotionRoot = () => {
  return (
    <Composition
      id="DailyHotlistIntro"
      component={DailyHotlistIntro}
      durationInFrames={540}
      fps={30}
      width={1080}
      height={1920}
    />
  );
};
