import { linearTiming, TransitionSeries } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

const SCENE_1 = 75;
const SCENE_2 = 75;
const FADE = 20;

// Transitions overlap the scenes, so the total is shorter than their sum.
export const TEST_REEL_DURATION = SCENE_1 + SCENE_2 - FADE;

const BACKGROUND =
  "linear-gradient(160deg, #3b0a45 0%, #8e2c6b 55%, #f2a65a 100%)";

const Headline: React.FC<{ text: string; delay?: number }> = ({
  text,
  delay = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const words = text.split(" ");

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: "0 28px",
        padding: "0 80px",
      }}
    >
      {words.map((word, i) => {
        const progress = spring({
          frame: frame - delay - i * 5,
          fps,
          config: { damping: 14 },
        });
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              color: "white",
              fontFamily: "Helvetica, Arial, sans-serif",
              fontWeight: 800,
              fontSize: 130,
              lineHeight: 1.1,
              opacity: progress,
              transform: `translateY(${interpolate(progress, [0, 1], [80, 0])}px)`,
            }}
          >
            {word}
          </span>
        );
      })}
    </div>
  );
};

const SparkIcon: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame: frame - 10, fps, config: { damping: 9 } });
  const rotate = interpolate(frame, [0, SCENE_2], [-20, 20]);

  return (
    <svg
      width={360}
      height={360}
      viewBox="0 0 24 24"
      style={{ transform: `scale(${pop}) rotate(${rotate}deg)` }}
    >
      <circle cx="12" cy="12" r="11" fill="rgba(255,255,255,0.15)" />
      <path
        d="M12 3l2.2 6.1L20 11l-5.8 1.9L12 19l-2.2-6.1L4 11l5.8-1.9z"
        fill="#ffd166"
        stroke="white"
        strokeWidth={0.6}
        strokeLinejoin="round"
      />
    </svg>
  );
};

const SceneIntro: React.FC = () => (
  <AbsoluteFill
    style={{
      background: BACKGROUND,
      justifyContent: "center",
      alignItems: "center",
    }}
  >
    <Headline text="She Earns Initiative" />
  </AbsoluteFill>
);

const SceneIcon: React.FC = () => (
  <AbsoluteFill
    style={{
      background: "#1d0b2b",
      justifyContent: "center",
      alignItems: "center",
      gap: 80,
      flexDirection: "column",
    }}
  >
    <SparkIcon />
    <Headline text="Remotion is ready" delay={15} />
  </AbsoluteFill>
);

export const TestReel: React.FC = () => {
  const { fps } = useVideoConfig();
  return (
    <TransitionSeries>
      <TransitionSeries.Sequence durationInFrames={SCENE_1} premountFor={fps}>
        <SceneIntro />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition
        presentation={fade()}
        timing={linearTiming({ durationInFrames: FADE })}
      />
      <TransitionSeries.Sequence durationInFrames={SCENE_2} premountFor={fps}>
        <SceneIcon />
      </TransitionSeries.Sequence>
    </TransitionSeries>
  );
};
