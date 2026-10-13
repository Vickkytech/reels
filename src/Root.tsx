import { Composition } from "remotion";
import { TestReel, TEST_REEL_DURATION } from "./TestReel";

// Vertical reel format: 1080×1920 @ 30 fps (Instagram Reels / TikTok / Shorts).
export const REEL_WIDTH = 1080;
export const REEL_HEIGHT = 1920;
export const REEL_FPS = 30;

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="TestReel"
        component={TestReel}
        durationInFrames={TEST_REEL_DURATION}
        fps={REEL_FPS}
        width={REEL_WIDTH}
        height={REEL_HEIGHT}
      />
    </>
  );
};
