import React from "react";
import {
  AbsoluteFill,
  Audio,
  Img,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {dailyVideoData} from "./daily-data.js";

const clamp = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
};

const serif =
  '"Songti SC", "STSong", "Noto Serif CJK SC", "Source Han Serif SC", Georgia, serif';
const sans =
  '"Inter", "PingFang SC", "Microsoft YaHei", "Noto Sans CJK SC", Arial, sans-serif';
const mono =
  '"SFMono-Regular", "JetBrains Mono", "Cascadia Mono", Consolas, monospace';

const colors = {
  paper: "#efe6d6",
  paperDeep: "#dacbb4",
  ink: "#1f1d19",
  muted: "#776f63",
  line: "#29261f",
  red: "#a2322e",
  redDeep: "#78211f",
  gold: "#bf8436",
  green: "#3f6c55",
  blue: "#3c5d78",
  black: "#171614",
};

const formatNumber = (number) => new Intl.NumberFormat("en-US").format(number);

const sfxEvents = [
  {from: 5, src: "audio/paper-hit.wav", volume: 0.42},
  {from: 34, src: "audio/tick.wav", volume: 0.48},
  {from: 58, src: "audio/blip-mid.wav", volume: 0.34},
  {from: 142, src: "audio/whoosh.wav", volume: 0.38},
  {from: 165, src: "audio/blip-high.wav", volume: 0.44},
  {from: 180, src: "audio/blip-mid.wav", volume: 0.36},
  {from: 194, src: "audio/blip-mid.wav", volume: 0.34},
  {from: 300, src: "audio/whoosh.wav", volume: 0.34},
  {from: 322, src: "audio/tick.wav", volume: 0.4},
  {from: 334, src: "audio/tick.wav", volume: 0.36},
  {from: 420, src: "audio/whoosh.wav", volume: 0.42},
  {from: 438, src: "audio/paper-hit.wav", volume: 0.5},
];

const voiceEvents = [
  {from: 24, duration: 135, src: "audio/voice-01-intro.mp3"},
  {from: 150, duration: 164, src: "audio/voice-02-top3.mp3"},
  {from: 306, duration: 162, src: "audio/voice-03-watch.mp3"},
  {from: 425, duration: 106, src: "audio/voice-04-reveal.mp3"},
];

const voiceDuckAmount = (frame) =>
  Math.max(
    0,
    ...voiceEvents.map((event) => {
      const fadeInDuck = interpolate(frame, [event.from - 8, event.from + 6], [0, 1], clamp);
      const fadeOutDuck = interpolate(
        frame,
        [event.from + event.duration - 8, event.from + event.duration + 10],
        [1, 0],
        clamp,
      );
      return Math.min(fadeInDuck, fadeOutDuck);
    }),
  );

const AudioTimeline = () => (
  <>
    <Audio
      src={staticFile("audio/hotlist-bed.wav")}
      volume={(frame) => 0.34 - voiceDuckAmount(frame) * 0.22}
    />
    {sfxEvents.map((event, index) => (
      <Sequence key={`${event.src}-${event.from}-${index}`} from={event.from}>
        <Audio src={staticFile(event.src)} volume={event.volume} />
      </Sequence>
    ))}
    {voiceEvents.map((event) => (
      <Sequence key={event.src} from={event.from}>
        <Audio src={staticFile(event.src)} volume={1.05} />
      </Sequence>
    ))}
  </>
);

const fade = (frame, start, duration = 18) =>
  interpolate(frame, [start, start + duration], [0, 1], clamp);

const fadeOut = (frame, start, duration = 18) =>
  interpolate(frame, [start, start + duration], [1, 0], clamp);

const slide = (frame, start, from, to, duration = 24) =>
  interpolate(frame, [start, start + duration], [from, to], clamp);

const countUp = (frame, start, value, duration = 36) =>
  Math.round(interpolate(frame, [start, start + duration], [0, value], clamp));

const PaperBackdrop = () => (
  <AbsoluteFill
    style={{
      backgroundColor: colors.paper,
      backgroundImage: [
        "linear-gradient(180deg, rgba(255,255,255,0.62), rgba(218,203,180,0.36))",
        "repeating-linear-gradient(90deg, rgba(31,29,25,0.026) 0 1px, transparent 1px 8px)",
        "repeating-linear-gradient(0deg, rgba(31,29,25,0.018) 0 1px, transparent 1px 7px)",
      ].join(", "),
      overflow: "hidden",
    }}
  >
    <div
      style={{
        position: "absolute",
        inset: 44,
        borderTop: `7px solid ${colors.line}`,
        borderBottom: `3px solid rgba(31,29,25,0.65)`,
      }}
    />
    <div
      style={{
        position: "absolute",
        inset: "68px 56px",
        border: "1px solid rgba(31,29,25,0.08)",
      }}
    />
  </AbsoluteFill>
);

const Kicker = ({children, style}) => (
  <div
    style={{
      fontFamily: sans,
      fontSize: 24,
      fontWeight: 700,
      color: colors.muted,
      textTransform: "uppercase",
      letterSpacing: 0,
      ...style,
    }}
  >
    {children}
  </div>
);

const Masthead = ({compact = false}) => (
  <div
    style={{
      position: "absolute",
      top: compact ? 70 : 88,
      left: 74,
      right: 74,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      borderBottom: `3px solid ${colors.line}`,
      paddingBottom: compact ? 18 : 24,
      fontFamily: sans,
      color: colors.ink,
    }}
  >
    <div style={{width: 250, color: colors.muted, fontSize: compact ? 22 : 24, lineHeight: 1.32}}>
      开源趋势<br />一页读完
    </div>
    <div style={{textAlign: "center"}}>
      <div
        style={{
          fontFamily: serif,
          fontSize: compact ? 66 : 96,
          lineHeight: 0.9,
          fontWeight: 900,
        }}
      >
        GitHub Daily
      </div>
      <div style={{fontSize: 22, color: colors.muted, marginTop: 12}}>开源热榜早报</div>
    </div>
    <div style={{width: 250, textAlign: "right", fontSize: compact ? 22 : 24, lineHeight: 1.38}}>
      <strong>第 {dailyVideoData.issue} 期</strong>
      <br />
      {dailyVideoData.dateChinese}
      <br />
      {dailyVideoData.weekday}
    </div>
  </div>
);

const MiniCalendar = ({frame}) => {
  const days = Array.from({length: 35}, (_, index) => index + 1);
  const monthName = "2026 / 06";
  return (
    <div
      style={{
        width: 392,
        border: `3px solid ${colors.line}`,
        background: "rgba(255,252,244,0.44)",
        padding: 24,
        boxShadow: "12px 14px 0 rgba(31,29,25,0.08)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: `2px solid ${colors.line}`,
          paddingBottom: 14,
          marginBottom: 18,
        }}
      >
        <strong style={{fontFamily: serif, fontSize: 38, color: colors.ink}}>{monthName}</strong>
        <span style={{fontFamily: mono, fontSize: 20, color: colors.red}}>TODAY</span>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          gap: 8,
          fontFamily: sans,
          fontSize: 18,
          color: colors.muted,
          textAlign: "center",
          marginBottom: 8,
        }}
      >
        {["M", "T", "W", "T", "F", "S", "S"].map((day, index) => (
          <span key={`${day}-${index}`}>{day}</span>
        ))}
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          gap: 8,
        }}
      >
        {days.map((day) => {
          const actual = day <= 30 ? day : "";
          const active = actual === 2;
          const pulse = active
            ? interpolate(Math.sin((frame / 30) * Math.PI * 2), [-1, 1], [0.88, 1])
            : 1;
          return (
            <div
              key={day}
              style={{
                height: 42,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: active ? `2px solid ${colors.red}` : "1px solid rgba(31,29,25,0.12)",
                background: active ? colors.red : "rgba(255,255,255,0.26)",
                color: active ? "#fff8ed" : colors.ink,
                fontFamily: mono,
                fontSize: 21,
                fontWeight: active ? 800 : 500,
                transform: `scale(${pulse})`,
              }}
            >
              {actual}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const StatBlock = ({label, value, suffix = "", color, frame, start}) => (
  <div
    style={{
      borderTop: `3px solid ${colors.line}`,
      paddingTop: 16,
      minWidth: 180,
    }}
  >
    <div style={{fontFamily: serif, fontSize: 76, lineHeight: 0.95, color}}>
      {countUp(frame, start, value)}
      {suffix}
    </div>
    <div style={{fontFamily: sans, color: colors.muted, fontSize: 22, marginTop: 10}}>{label}</div>
  </div>
);

const IntroScene = ({frame}) => {
  const {fps} = useVideoConfig();
  const title = spring({
    frame: frame - 6,
    fps,
    config: {damping: 18, stiffness: 72, mass: 0.8},
  });
  return (
    <AbsoluteFill
      style={{
        opacity: fade(frame, -12, 20) * fadeOut(frame, 138, 26),
        transform: `translateY(${slide(frame, -12, 30, 0, 26)}px)`,
      }}
    >
      <Masthead />
      <div style={{position: "absolute", top: 330, left: 76}}>
        <MiniCalendar frame={frame} />
      </div>
      <div style={{position: "absolute", top: 334, left: 522, right: 74}}>
        <Kicker>Daily Hotlist Intro</Kicker>
        <div
          style={{
            fontFamily: serif,
            fontSize: 112,
            lineHeight: 0.96,
            fontWeight: 900,
            color: colors.ink,
            transform: `scale(${0.9 + title * 0.1})`,
            transformOrigin: "left top",
            marginTop: 24,
          }}
        >
          今日开源热榜
        </div>
        <p
          style={{
            fontFamily: sans,
            fontSize: 34,
            lineHeight: 1.42,
            color: colors.muted,
            margin: "30px 0 0",
          }}
        >
          从 GitHub Trending、AI、Trading 与整体星标榜中去重筛选，把最值得看的项目压缩成一份纸质日报。
        </p>
        <div
          style={{
            marginTop: 38,
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 18,
          }}
        >
          <StatBlock
            label="Trending"
            value={dailyVideoData.stats.trending}
            color={colors.red}
            frame={frame}
            start={30}
          />
          <StatBlock
            label="去重仓库"
            value={dailyVideoData.stats.deduped}
            color={colors.ink}
            frame={frame}
            start={38}
          />
          <StatBlock
            label="AI / Trading"
            value={dailyVideoData.stats.ai + dailyVideoData.stats.trading}
            color={colors.gold}
            frame={frame}
            start={46}
          />
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          left: 76,
          right: 76,
          bottom: 152,
          borderTop: `3px solid ${colors.line}`,
          borderBottom: `3px solid ${colors.line}`,
          padding: "22px 0",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontFamily: sans,
          fontSize: 27,
          color: colors.ink,
        }}
      >
        <span>Trending</span>
        <span>Overall Stars</span>
        <span>AI Topic</span>
        <span>Trading Topic</span>
      </div>
    </AbsoluteFill>
  );
};

const RepoCard = ({repo, index, frame}) => {
  const enter = fade(frame, 154 + index * 14, 18);
  const lift = slide(frame, 154 + index * 14, 46, 0, 22);
  const width = interpolate(
    frame,
    [180 + index * 10, 236 + index * 10],
    [26, 100],
    clamp,
  );
  return (
    <div
      style={{
        opacity: enter,
        transform: `translateY(${lift}px)`,
        height: 282,
        border: `3px solid ${colors.line}`,
        background: index === 0 ? "rgba(255,250,239,0.78)" : "rgba(255,250,239,0.44)",
        padding: 26,
        display: "grid",
        gridTemplateColumns: "124px 1fr",
        columnGap: 26,
        boxShadow: index === 0 ? "14px 16px 0 rgba(162,50,46,0.16)" : "none",
      }}
    >
      <div
        style={{
          background: index === 0 ? colors.red : colors.line,
          color: "#fff8ed",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: serif,
          height: 124,
        }}
      >
        <span style={{fontSize: 22, fontFamily: mono}}>NO.</span>
        <strong style={{fontSize: 64, lineHeight: 0.9}}>{repo.rank}</strong>
      </div>
      <div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
          }}
        >
          <div
            style={{
              fontFamily: serif,
              color: index === 0 ? colors.redDeep : colors.ink,
              fontSize: 44,
              fontWeight: 900,
              lineHeight: 1.05,
              maxWidth: 590,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {repo.fullName}
          </div>
          <div
            style={{
              fontFamily: mono,
              fontSize: 25,
              color: colors.red,
              border: `2px solid ${colors.red}`,
              padding: "8px 12px",
              minWidth: 128,
              textAlign: "center",
            }}
          >
            +{formatNumber(repo.starsToday)}
          </div>
        </div>
        <div
          style={{
            marginTop: 14,
            display: "flex",
            gap: 12,
            fontFamily: sans,
            fontSize: 22,
            color: colors.muted,
          }}
        >
          <span>{repo.label}</span>
          <span>·</span>
          <span>{repo.language}</span>
          <span>·</span>
          <span>{repo.totalStars} stars</span>
        </div>
        <p
          style={{
            margin: "18px 0 0",
            fontFamily: sans,
            fontSize: 27,
            lineHeight: 1.32,
            color: colors.ink,
            maxHeight: 72,
            overflow: "hidden",
          }}
        >
          {repo.summary}
        </p>
        <div
          style={{
            marginTop: 24,
            width: `${width}%`,
            height: 12,
            background: index === 0 ? colors.red : colors.gold,
          }}
        />
      </div>
    </div>
  );
};

const TopReposScene = ({frame}) => (
  <AbsoluteFill
    style={{
      opacity: fade(frame, 136, 26) * fadeOut(frame, 310, 28),
      transform: `translateY(${slide(frame, 136, 40, 0, 24)}px)`,
    }}
  >
    <Masthead compact />
    <div style={{position: "absolute", top: 246, left: 76, right: 76}}>
      <Kicker>GitHub Trending · Daily</Kicker>
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          borderBottom: `4px solid ${colors.line}`,
          paddingBottom: 20,
          marginTop: 18,
        }}
      >
        <h2
          style={{
            margin: 0,
            fontFamily: serif,
            fontSize: 94,
            lineHeight: 0.95,
            color: colors.ink,
          }}
        >
          今日 Top 3
        </h2>
        <div
          style={{
            fontFamily: mono,
            fontSize: 25,
            color: colors.muted,
            textAlign: "right",
            lineHeight: 1.4,
          }}
        >
          {dailyVideoData.dateLabel}
          <br />
          FULL_NAME DEDUPED
        </div>
      </div>
      <div style={{marginTop: 36, display: "grid", gap: 24}}>
        {dailyVideoData.topRepos.map((repo, index) => (
          <RepoCard key={repo.fullName} repo={repo} index={index} frame={frame} />
        ))}
      </div>
    </div>
  </AbsoluteFill>
);

const WatchList = ({title, accent, rows, frame, start}) => (
  <div
    style={{
      border: `3px solid ${colors.line}`,
      background: "rgba(255,250,239,0.58)",
      padding: 28,
      height: 530,
      boxShadow: "10px 12px 0 rgba(31,29,25,0.07)",
    }}
  >
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottom: `3px solid ${colors.line}`,
        paddingBottom: 16,
        marginBottom: 18,
      }}
    >
      <h3 style={{margin: 0, fontFamily: serif, fontSize: 47, color: accent}}>{title}</h3>
      <span style={{fontFamily: mono, fontSize: 21, color: colors.muted}}>TOP STARS</span>
    </div>
    <div style={{display: "grid", gap: 16}}>
      {rows.map(([name, stars], index) => (
        <div
          key={name}
          style={{
            opacity: fade(frame, start + index * 9, 14),
            transform: `translateX(${slide(frame, start + index * 9, -24, 0, 14)}px)`,
            display: "grid",
            gridTemplateColumns: "42px 1fr 96px",
            gap: 14,
            alignItems: "center",
            fontFamily: sans,
            fontSize: 27,
            color: colors.ink,
            borderBottom: "1px solid rgba(31,29,25,0.13)",
            paddingBottom: 14,
          }}
        >
          <strong style={{fontFamily: mono, color: accent}}>{index + 1}</strong>
          <span
            style={{
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {name}
          </span>
          <span style={{fontFamily: mono, color: colors.muted, textAlign: "right"}}>{stars}</span>
        </div>
      ))}
    </div>
  </div>
);

const InsightStrip = ({frame}) => {
  const active = Math.min(2, Math.max(0, Math.floor((frame - 344) / 34)));
  return (
    <div
      style={{
        position: "absolute",
        left: 76,
        right: 76,
        bottom: 150,
        background: colors.black,
        color: "#f3e9d9",
        padding: "30px 34px",
        minHeight: 246,
        display: "grid",
        gridTemplateColumns: "86px 1fr",
        gap: 26,
        alignItems: "start",
      }}
    >
      <div
        style={{
          width: 68,
          height: 68,
          border: "2px solid #f3e9d9",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: serif,
          fontSize: 44,
          color: colors.gold,
        }}
      >
        {active + 1}
      </div>
      <div>
        <Kicker style={{color: colors.gold, fontSize: 22}}>今日趋势洞察</Kicker>
        <p
          style={{
            margin: "16px 0 0",
            fontFamily: serif,
            fontSize: 41,
            lineHeight: 1.28,
            color: "#fff8ed",
          }}
        >
          {dailyVideoData.insights[active]}
        </p>
      </div>
    </div>
  );
};

const WatchScene = ({frame}) => (
  <AbsoluteFill
    style={{
      opacity: fade(frame, 292, 28) * fadeOut(frame, 438, 26),
      transform: `translateY(${slide(frame, 292, 44, 0, 24)}px)`,
    }}
  >
    <Masthead compact />
    <div style={{position: "absolute", top: 250, left: 76, right: 76}}>
      <Kicker>AI / Trading Watch</Kicker>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 24,
          marginTop: 28,
        }}
      >
        <WatchList
          title="AI 前沿"
          accent={colors.red}
          rows={dailyVideoData.aiWatch}
          frame={frame}
          start={320}
        />
        <WatchList
          title="交易雷达"
          accent={colors.green}
          rows={dailyVideoData.tradingWatch}
          frame={frame}
          start={328}
        />
      </div>
      <div
        style={{
          marginTop: 34,
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 20,
        }}
      >
        {[
          ["AI topic", dailyVideoData.stats.ai, colors.red],
          ["Trading topic", dailyVideoData.stats.trading, colors.green],
          ["Cross listed", dailyVideoData.stats.crossListed, colors.gold],
        ].map(([label, value, color], index) => (
          <div
            key={label}
            style={{
              borderTop: `4px solid ${color}`,
              paddingTop: 16,
              fontFamily: sans,
              color: colors.muted,
              fontSize: 23,
            }}
          >
            <strong
              style={{
                display: "block",
                fontFamily: serif,
                fontSize: 70,
                lineHeight: 0.95,
                color: colors.ink,
              }}
            >
              {countUp(frame, 326 + index * 8, value)}
            </strong>
            {label}
          </div>
        ))}
      </div>
    </div>
    <InsightStrip frame={frame} />
  </AbsoluteFill>
);

const ReportRevealScene = ({frame}) => {
  const {fps} = useVideoConfig();
  const paper = spring({
    frame: frame - 430,
    fps,
    config: {damping: 18, stiffness: 58, mass: 0.95},
  });
  const rotate = interpolate(paper, [0, 1], [4, 0], clamp);
  const scale = interpolate(paper, [0, 1], [0.82, 1], clamp);
  return (
    <AbsoluteFill
      style={{
        opacity: fade(frame, 420, 24),
      }}
    >
      <div style={{position: "absolute", top: 86, left: 76, right: 76}}>
        <Kicker>Final Daily Format</Kicker>
        <h2
          style={{
            margin: "16px 0 0",
            fontFamily: serif,
            fontSize: 86,
            lineHeight: 0.98,
            color: colors.ink,
          }}
        >
          日报就是最终展示页
        </h2>
      </div>
      <div
        style={{
          position: "absolute",
          top: 284,
          left: 208,
          width: 664,
          height: 1228,
          background: "#fbf4e6",
          border: `4px solid ${colors.line}`,
          boxShadow: "26px 30px 0 rgba(31,29,25,0.12)",
          overflow: "hidden",
          transform: `rotate(${rotate}deg) scale(${scale})`,
          transformOrigin: "center center",
        }}
      >
        <Img
          src={staticFile("github-tech-daily.png")}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "top center",
            filter: "saturate(0.94) contrast(1.04)",
          }}
        />
      </div>
      <div
        style={{
          position: "absolute",
          left: 76,
          right: 76,
          bottom: 126,
          display: "grid",
          gridTemplateColumns: "1.15fr 0.85fr",
          gap: 28,
          alignItems: "stretch",
        }}
      >
        <div
          style={{
            background: colors.black,
            color: "#fff8ed",
            padding: "32px 36px",
            fontFamily: serif,
            fontSize: 43,
            lineHeight: 1.24,
          }}
        >
          仓库名可点击直达 GitHub，日历可回看每一期。
        </div>
        <div
          style={{
            borderTop: `4px solid ${colors.red}`,
            borderBottom: `4px solid ${colors.red}`,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "18px 0",
            fontFamily: sans,
            color: colors.ink,
          }}
        >
          <strong
            style={{
              fontFamily: mono,
              fontSize: 26,
              whiteSpace: "nowrap",
              letterSpacing: 0,
            }}
          >
            {dailyVideoData.siteUrl}
          </strong>
          <span style={{fontSize: 23, color: colors.muted, marginTop: 10}}>
            GitHub Daily · {dailyVideoData.dateLabel}
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const ProgressRule = ({frame}) => {
  const width = interpolate(frame, [0, 539], [0, 100], clamp);
  return (
    <div
      style={{
        position: "absolute",
        left: 76,
        right: 76,
        bottom: 82,
        height: 7,
        background: "rgba(31,29,25,0.12)",
      }}
    >
      <div style={{width: `${width}%`, height: "100%", background: colors.red}} />
    </div>
  );
};

export const DailyHotlistIntro = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <AudioTimeline />
      <PaperBackdrop />
      <IntroScene frame={frame} />
      <TopReposScene frame={frame} />
      <WatchScene frame={frame} />
      <ReportRevealScene frame={frame} />
      <ProgressRule frame={frame} />
    </AbsoluteFill>
  );
};
