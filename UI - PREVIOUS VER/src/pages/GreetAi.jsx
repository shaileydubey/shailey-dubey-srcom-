import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

// ══════════════════════════════════════════════════════════════════════════════
// CONSTANTS - All fixed values used throughout the app
// ══════════════════════════════════════════════════════════════════════════════

// Purple gradient used for buttons and highlights
const GRADIENT = "linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #a78bfa 100%)";

// Colors for the animated wave orb
const WAVE_COLORS = {
  gradient: ["#E879F9", "#C084FC", "#4338CA"], // Background gradient colors
  waves: [ // Individual wave layer colors
    "rgba(129,140,248,0.6)",
    "rgba(192,132,252,0.5)",
    "rgba(232,121,249,0.4)",
  ],
};

// Pre-defined conversation types users can choose
const PROMPTS = [
  { id: "FRIENDLY GREETING", icon: "👋", desc: "Warm intro call" },
  { id: "LEAD QUALIFICATION", icon: "🎯", desc: "Qualify prospects" },
  { id: "APPOINTMENT CONFIRMATION", icon: "📅", desc: "Confirm bookings" },
  { id: "BUSINESS SURVEY", icon: "📊", desc: "Collect feedback" },
];

// Available AI voices
const VOICES = [
  { name: "Priyamvada", desc: "Indian Female", color: "#F59E0B" },
  { name: "Angela", desc: "Soft-spoken American Female", color: "#EF4444" },
];

// Maps each voice + prompt combination to an audio file
const AUDIO_MAP = {
  Priyamvada: {
    "FRIENDLY GREETING": "Demo_Agent/Premveda_1.mp3",
    "LEAD QUALIFICATION": "Demo_Agent/Premveda_2.mp3",
    "APPOINTMENT CONFIRMATION": "https://cdn.freesound.org/previews/456/456966_8678204-lq.mp3",
    "BUSINESS SURVEY": "https://cdn.freesound.org/previews/389/389562_1474204-lq.mp3",
  },
  Angela: {
    "FRIENDLY GREETING": "https://cdn.freesound.org/previews/529/529366_11167132-lq.mp3",
    "LEAD QUALIFICATION": "https://cdn.freesound.org/previews/512/512932_10648170-lq.mp3",
    "APPOINTMENT CONFIRMATION": "Demo_Agent/Angela_3.mp3",
    "BUSINESS SURVEY": "Demo_Agent/Angela_4.mp3",
  },
};

// CSS animations - spinning, floating, blinking, scaling effects
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap');
* { box-sizing: border-box; margin: 0; padding: 0; }
@keyframes orb-spin { to { transform: rotate(360deg); } }
@keyframes float-orb { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
@keyframes blink-dot { 0%,100%{opacity:1} 50%{opacity:0.2} }
@keyframes pop-scale { 0%{transform:scale(0.7)} 60%{transform:scale(1.15)} 100%{transform:scale(1)} }
@keyframes slide-in { from{opacity:0;transform:translateX(-10px)} to{opacity:1;transform:none} }
@keyframes ripple-av { 0%{transform:scale(1);opacity:0.8} 100%{transform:scale(1.7);opacity:0} }
`;

// ══════════════════════════════════════════════════════════════════════════════
// WAVE ORB COMPONENT - Animated liquid circle that reacts to voice activity
// ══════════════════════════════════════════════════════════════════════════════
function WaveOrb({ isActive }) {
  const canvasRef = useRef(null); // Reference to canvas element
  const animRef = useRef(null); // Animation frame ID for cleanup
  const tRef = useRef(0); // Time counter for wave animation

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width, H = canvas.height, cx = W / 2, cy = H / 2, R = W / 2 - 2;

    // Wave settings change based on active/idle state
    const waveConfig = isActive
      ? { amps: [20, 15, 24], yOffsets: [8, 18, 26] } // Active = bigger waves
      : { amps: [9, 6, 11], yOffsets: [32, 42, 50] }; // Idle = calmer waves

    // Each wave layer has different speed and frequency
    const waveParams = [
      { speed: 2.2, freq: 3.5, offset: 0 },
      { speed: 3.1, freq: 4.5, offset: 1.5 },
      { speed: 1.6, freq: 2.8, offset: 3 },
    ];

    function draw() {
      ctx.clearRect(0, 0, W, H); // Clear previous frame
      const t = tRef.current;

      // Clip everything to a circle shape
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.clip();

      // Draw radial gradient background
      const bg = ctx.createRadialGradient(cx - R * 0.25, cy - R * 0.3, 0, cx, cy, R);
      WAVE_COLORS.gradient.forEach((color, i) =>
        bg.addColorStop(i === 0 ? 0 : i === 1 ? 0.45 : 1, color)
      );
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      // Draw three wave layers
      waveParams.forEach(({ speed, freq, offset }, idx) => {
        const amp = waveConfig.amps[idx], yBase = cy + waveConfig.yOffsets[idx];
        ctx.beginPath();
        
        // Create wavy line using sine functions
        for (let x = 0; x <= W; x += 2) {
          const y =
            yBase +
            Math.sin((x / W) * Math.PI * freq + t * 0.045 * speed + offset) * amp +
            Math.sin((x / W) * Math.PI * freq * 1.6 + t * 0.03 * speed + offset + 1) * amp * 0.35;
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        
        // Fill from wave to bottom
        ctx.lineTo(W, H);
        ctx.lineTo(0, H);
        ctx.closePath();
        ctx.fillStyle = WAVE_COLORS.waves[idx];
        ctx.fill();
      });

      // Add glossy highlight on top
      const gloss = ctx.createRadialGradient(
        cx - R * 0.3, cy - R * 0.38, 0, cx - R * 0.1, cy - R * 0.15, R * 0.58
      );
      gloss.addColorStop(0, "rgba(255,255,255,0.25)");
      gloss.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = gloss;
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Draw outer circle border
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.strokeStyle = isActive ? "rgba(192,132,252,0.8)" : "rgba(129,140,248,0.3)";
      ctx.lineWidth = 2;
      ctx.stroke();

      tRef.current += 1; // Increment time
      animRef.current = requestAnimationFrame(draw); // Loop animation
    }

    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current); // Cleanup on unmount
  }, [isActive]);

  return (
    <canvas
      ref={canvasRef}
      width={200}
      height={200}
      style={{
        borderRadius: "50%",
        boxShadow: isActive
          ? "0 0 70px rgba(129,140,248,0.75), 0 0 130px rgba(192,132,252,0.3)" // Glowing when active
          : "0 0 44px rgba(129,140,248,0.38)", // Subtle glow when idle
        transition: "box-shadow 0.7s ease",
      }}
    />
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MINI WAVEFORM - Small animated bars next to each voice option
// ══════════════════════════════════════════════════════════════════════════════
function VoiceMiniWave({ color, isSelected, isActive }) {
  const [heights, setHeights] = useState(Array(13).fill(3)); // 13 bars
  const intervalRef = useRef(null);

  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    if (isSelected && isActive) {
      // Active + selected = fast bouncing bars
      intervalRef.current = setInterval(
        () =>
          setHeights(
            Array(13).fill(0).map(
              (_, i) =>
                3 +
                (Math.sin(Date.now() * 0.005 + i * 0.9) * 0.5 + 0.5) * 20 +
                Math.random() * 5
            )
          ),
        75
      );
    } else if (isSelected) {
      // Selected but not active = gentle wave
      intervalRef.current = setInterval(
        () =>
          setHeights(
            Array(13).fill(0).map(
              (_, i) => 2 + (Math.sin(Date.now() * 0.002 + i * 0.7) * 0.5 + 0.5) * 7
            )
          ),
        110
      );
    } else {
      // Not selected = flat line
      setHeights(Array(13).fill(3));
    }

    return () => intervalRef.current && clearInterval(intervalRef.current);
  }, [isSelected, isActive]);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 2.5, height: 28, flexShrink: 0 }}>
      {heights.map((h, i) => (
        <div
          key={i}
          style={{
            width: 3,
            height: h,
            borderRadius: 2,
            background: isSelected ? color : "rgba(255,255,255,0.12)",
            opacity: isSelected ? 0.9 : 0.4,
            transition: isSelected ? "height 0.07s ease" : "height 0.5s ease",
          }}
        />
      ))}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ORBIT RINGS - Spinning circles around the main orb
// ══════════════════════════════════════════════════════════════════════════════
function OrbRings({ isActive }) {
  // Three rings with different sizes and spin speeds
  const rings = [
    { size: 236, duration: 9, reverse: false, width: 1, dashed: false },
    { size: 268, duration: 16, reverse: true, width: 0.8, dashed: true },
    { size: 300, duration: 24, reverse: false, width: 0.6, dashed: true },
  ];

  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      {rings.map((ring, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            width: ring.size,
            height: ring.size,
            top: "50%",
            left: "50%",
            marginTop: -ring.size / 2,
            marginLeft: -ring.size / 2,
            borderRadius: "50%",
            border: `${ring.width}px ${ring.dashed ? "dashed" : "solid"} rgba(99,102,241,${isActive ? 0.32 : 0.12})`,
            animation: `orb-spin ${ring.duration}s linear infinite ${ring.reverse ? "reverse" : "normal"}`,
            transition: "border-color 0.7s",
          }}
        />
      ))}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT - The entire AI call demo interface
// ══════════════════════════════════════════════════════════════════════════════
export default function GreetAi() {
  // ─── State Management ───────────────────────────────────────────────────────
  const [selectedPrompt, setSelectedPrompt] = useState("FRIENDLY GREETING"); // Current prompt type
  const [selectedVoice, setSelectedVoice] = useState("Priyamvada"); // Current voice
  const [isActive, setIsActive] = useState(false); // Is call running?
  const [callDuration, setCallDuration] = useState(0); // Call timer in seconds
  const [volume, setVolume] = useState(72); // Audio volume (0-100)
  const [waveHeights, setWaveHeights] = useState(Array(26).fill(4)); // Big waveform bars
  const [logs, setLogs] = useState([]); // Console log messages
  const [promptFlash, setPromptFlash] = useState(null); // Tracks click animation on prompts
  const [voicePop, setVoicePop] = useState(null); // Tracks click animation on voices
  const [audioError, setAudioError] = useState(false); // True if audio file fails to load

  // ─── Refs (for audio & animation) ───────────────────────────────────────────
  const audioRef = useRef(null); // HTML5 Audio element
  const audioContextRef = useRef(null); // Web Audio API context (for fallback)
  const oscillatorRef = useRef(null); // Tone generator (fallback)
  const animationFrameRef = useRef(null); // For stopping animations
  const navigate = useNavigate(); // React Router navigation

  // ─── Helper Functions ───────────────────────────────────────────────────────
  
  // Get the audio file path for current voice + prompt
  const getAudioFile = (voice, prompt) => AUDIO_MAP[voice]?.[prompt] || "/greet.m4a";
  
  // Format seconds as MM:SS
  const fmt = (s) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
  
  // Get color for currently selected voice
  const selectedColor = VOICES.find((v) => v.name === selectedVoice)?.color || "#6366F1";

  // Messages that appear in the console log during active calls
  const logMsgs = [
    "Initializing voice engine...",
    `Loading prompt: ${selectedPrompt}`,
    `Voice model ready: ${selectedVoice}`,
    "Connecting to outbound line...",
    "Call established ✓",
    `${selectedVoice} is speaking...`,
    "Customer response detected...",
    "Sentiment analysis: Positive 😊",
    "Confidence score: 94%",
  ];

  // ─── Effects ────────────────────────────────────────────────────────────────

  // When voice or prompt changes during active call, reload audio
  useEffect(() => {
    const newAudioFile = getAudioFile(selectedVoice, selectedPrompt);
    if (isActive && audioRef.current) {
      audioRef.current.src = newAudioFile;
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => setAudioError(true));
    }
  }, [selectedVoice, selectedPrompt]);

  // Initialize audio on component mount
  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.src = getAudioFile(selectedVoice, selectedPrompt);
    audioRef.current.preload = "auto";
    audioRef.current.onerror = () => setAudioError(true); // Handle broken audio files
    return () => stopAllAudio(); // Cleanup on unmount
  }, []);

  // Generate fallback tone if audio file doesn't work
  const startGeneratedAudio = () => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      audioContextRef.current = new AudioContext();
      oscillatorRef.current = audioContextRef.current.createOscillator();
      const gainNode = audioContextRef.current.createGain();
      oscillatorRef.current.connect(gainNode);
      gainNode.connect(audioContextRef.current.destination);
      oscillatorRef.current.type = "sine";
      // Different pitch for each voice
      oscillatorRef.current.frequency.setValueAtTime(
        { Priyamvada: 520, Angela: 440 }[selectedVoice] || 440,
        audioContextRef.current.currentTime
      );
      gainNode.gain.setValueAtTime(0.1, audioContextRef.current.currentTime);
      oscillatorRef.current.start();
      oscillatorRef.current.startTime = audioContextRef.current.currentTime;
    } catch (e) {}
  };

  // Stop fallback tone
  const stopGeneratedAudio = () => {
    try {
      oscillatorRef.current?.stop();
      oscillatorRef.current?.disconnect();
    } catch (e) {}
    try {
      audioContextRef.current?.close();
    } catch (e) {}
  };

  // Sync timer and waveform while call is active
  useEffect(() => {
    if (isActive) {
      const syncTimer = () => {
        let currentTime = 0;
        
        // Get time from audio or oscillator
        if (audioRef.current && !audioError && !audioRef.current.paused)
          currentTime = audioRef.current.currentTime;
        else if (audioContextRef.current && oscillatorRef.current)
          currentTime = audioContextRef.current.currentTime - (oscillatorRef.current.startTime || 0);

        setCallDuration(currentTime);
        
        // Randomize waveform bars for animation
        setWaveHeights(Array(26).fill(0).map(() => Math.random() * 40 + 4));
        
        animationFrameRef.current = requestAnimationFrame(syncTimer);
      };
      
      animationFrameRef.current = requestAnimationFrame(syncTimer);

      // Add console log messages one by one
      let i = 0;
      const li = setInterval(() => {
        if (i < logMsgs.length) {
          setLogs((p) => [...p.slice(-6), logMsgs[i]]); // Keep only last 7 messages
          i++;
        } else clearInterval(li);
      }, 620);

      return () => {
        cancelAnimationFrame(animationFrameRef.current);
        clearInterval(li);
      };
    } else {
      setWaveHeights(Array(26).fill(4)); // Reset to flat when idle
    }
  }, [isActive, audioError, selectedVoice, selectedPrompt]);

  // Stop all audio sources
  const stopAllAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    stopGeneratedAudio();
    cancelAnimationFrame(animationFrameRef.current);
  };

  // ─── Event Handlers ─────────────────────────────────────────────────────────

  // Select prompt with click animation
  const pickPrompt = (id) => {
    setPromptFlash(id);
    setSelectedPrompt(id);
    setTimeout(() => setPromptFlash(null), 350);
    if (isActive) setLogs((p) => [...p.slice(-6), `Switching prompt to: ${id}`]);
  };

  // Select voice with click animation
  const pickVoice = (n) => {
    setVoicePop(n);
    setSelectedVoice(n);
    setTimeout(() => setVoicePop(null), 380);
    if (isActive) setLogs((p) => [...p.slice(-6), `Switching voice to: ${n}`]);
  };

  // Start the call
  const handleStartCall = () => {
    setIsActive(true);
    setLogs([]);
    setCallDuration(0);
    setAudioError(false);
    
    if (audioRef.current) {
      audioRef.current.src = getAudioFile(selectedVoice, selectedPrompt);
      audioRef.current.currentTime = 0;
      audioRef.current.loop = true;
      audioRef.current.play().catch(() => {
        setAudioError(true);
        startGeneratedAudio(); // Use fallback if file fails
      });
    } else {
      setAudioError(true);
      startGeneratedAudio();
    }
  };

  // End the call
  const handleEndCall = () => {
    setIsActive(false);
    setLogs([]);
    stopAllAudio();
  };

  // Reusable hover effect for buttons/cards
  const hoverStyle = (base, hover) => ({
    onMouseEnter: (e) => Object.assign(e.currentTarget.style, hover),
    onMouseLeave: (e) => Object.assign(e.currentTarget.style, base),
  });

  // ══════════════════════════════════════════════════════════════════════════════
  // RENDER - Two-column layout (config on left, demo on right)
  // ══════════════════════════════════════════════════════════════════════════════
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#020617",
        color: "white",
        fontFamily: "'Inter',system-ui,sans-serif",
        padding: "44px 56px",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <style>{CSS}</style>
      <div style={{ display: "flex", maxWidth: 1200, width: "100%", gap: 54 }}>
        
        {/* ═══════════════════════════════════════════════════════════════════════
            LEFT PANEL - Configuration (Prompt, Voice, Stats)
            ═══════════════════════════════════════════════════════════════════════ */}
        <div style={{ flex: 1 }}>
          {/* Title */}
          <div
            style={{
              background: GRADIENT,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              fontSize: "2.15rem",
              fontWeight: 900,
              marginBottom: 6,
              letterSpacing: "-0.5px",
            }}
          >
            MEET SR Comsoft AI
          </div>

          {/* Subtitle */}
          <div style={{ color: "#64748b", fontSize: "0.95rem", marginBottom: 36 }}>
            Configure your AI call agent — then send your first call.
            {audioError && (
              <span style={{ color: "#f59e0b", display: "block", marginTop: 4 }}>
                ⚠️ Using generated tone (audio file not found)
              </span>
            )}
          </div>

          {/* Active Config Badge */}
          <div
            style={{
              background: "rgba(99,102,241,0.08)",
              border: "1px solid rgba(99,102,241,0.2)",
              borderRadius: 12,
              padding: "12px 16px",
              marginBottom: 20,
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <div style={{ fontSize: 11, color: "#818cf8", fontWeight: 700 }}>
              ACTIVE CONFIG:
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                background: "rgba(255,255,255,0.05)",
                padding: "6px 12px",
                borderRadius: 8,
              }}
            >
              <span style={{ color: selectedColor }}>{selectedVoice}</span>
              <span style={{ color: "#475569" }}>+</span>
              <span style={{ color: "#a5b4fc" }}>{selectedPrompt}</span>
            </div>
          </div>

          {/* Prompt Selection Grid */}
          <div
            style={{
              fontSize: 10,
              fontWeight: 800,
              color: "#334155",
              letterSpacing: "2.5px",
              marginBottom: 10,
            }}
          >
            PROMPT
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 10,
              marginBottom: 34,
            }}
          >
            {PROMPTS.map((p) => {
              const active = selectedPrompt === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => pickPrompt(p.id)}
                  style={{
                    background: active ? "rgba(99,102,241,0.13)" : "transparent",
                    border: `1px solid ${active ? "#6366f1" : "rgba(255,255,255,0.08)"}`,
                    color: active ? "#a5b4fc" : "#64748b",
                    padding: "14px 16px",
                    borderRadius: 16,
                    cursor: "pointer",
                    textAlign: "left",
                    display: "flex",
                    flexDirection: "column",
                    gap: 4,
                    boxShadow: active ? "0 0 18px rgba(99,102,241,0.2)" : "none",
                    transform: promptFlash === p.id ? "scale(0.97)" : "scale(1)",
                    transition: "all 0.25s",
                    position: "relative",
                    overflow: "hidden",
                  }}
                  {...hoverStyle(
                    {
                      borderColor: active ? "#6366f1" : "rgba(255,255,255,0.08)",
                      transform: "translateY(0)",
                    },
                    active
                      ? {}
                      : {
                          borderColor: "rgba(99,102,241,0.4)",
                          transform: "translateY(-2px)",
                        }
                  )}
                >
                  <span style={{ fontSize: 20 }}>{p.icon}</span>
                  <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.5px" }}>
                    {p.id}
                  </span>
                  <span style={{ fontSize: 11, color: active ? "#818cf8" : "#475569" }}>
                    {p.desc}
                  </span>
                  {/* Active indicator dot */}
                  {active && (
                    <div
                      style={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        background: "#6366f1",
                        boxShadow: "0 0 8px #6366f1",
                      }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Voice Selection List */}
          <div
            style={{
              fontSize: 10,
              fontWeight: 800,
              color: "#334155",
              letterSpacing: "2.5px",
              marginBottom: 10,
            }}
          >
            VOICE
          </div>
          {VOICES.map((v) => {
            const active = selectedVoice === v.name;
            return (
              <div
                key={v.name}
                onClick={() => pickVoice(v.name)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  padding: "13px 16px",
                  borderRadius: 16,
                  cursor: "pointer",
                  marginBottom: 8,
                  border: `1px solid ${active ? "rgba(99,102,241,0.38)" : "transparent"}`,
                  background: active ? "rgba(99,102,241,0.09)" : "transparent",
                  transform: voicePop === v.name ? "scale(1.02)" : "scale(1)",
                  transition: "all 0.3s cubic-bezier(0.34,1.56,0.64,1)",
                  position: "relative",
                  overflow: "hidden",
                }}
                {...hoverStyle(
                  {
                    background: active ? "rgba(99,102,241,0.09)" : "transparent",
                    transform: "translateX(0)",
                  },
                  active
                    ? {}
                    : {
                        background: "rgba(255,255,255,0.03)",
                        transform: "translateX(5px)",
                      }
                )}
              >
                {/* Voice Avatar */}
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 14,
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 900,
                    fontSize: 18,
                    background: `${v.color}18`,
                    border: `1.5px solid ${v.color}55`,
                    transition: "transform 0.3s",
                    transform: active ? "scale(1.05)" : "scale(1)",
                    position: "relative",
                  }}
                >
                  <span style={{ color: v.color }}>{v.name[0]}</span>
                  {/* Ripple effect when active */}
                  {active && isActive && (
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        borderRadius: 14,
                        border: `1.5px solid ${v.color}`,
                        animation: "ripple-av 1.6s infinite",
                      }}
                    />
                  )}
                </div>

                {/* Voice Info */}
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: "0.94rem" }}>{v.name}</div>
                  <div
                    style={{
                      fontSize: 12,
                      color: active ? "#818cf8" : "#475569",
                      transition: "color 0.3s",
                    }}
                  >
                    {v.desc}
                  </div>
                  {active && (
                    <div style={{ fontSize: 10, color: "#4ade80", marginTop: 2 }}>
                      Playing: {selectedPrompt.toLowerCase()}
                    </div>
                  )}
                </div>

                {/* Mini Waveform */}
                <VoiceMiniWave color={v.color} isSelected={active} isActive={isActive} />

                {/* Checkmark when selected */}
                {active && (
                  <div
                    style={{
                      width: 22,
                      height: 22,
                      background: "#6366f1",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 11,
                      marginLeft: 8,
                      flexShrink: 0,
                      boxShadow: "0 0 12px rgba(99,102,241,0.65)",
                      animation: "pop-scale 0.38s cubic-bezier(0.34,1.56,0.64,1)",
                    }}
                  >
                    ✓
                  </div>
                )}
              </div>
            );
          })}

          {/* Session Stats (Duration, Volume, Status) */}
          <div style={{ marginTop: 32 }}>
            <div
              style={{
                fontSize: 10,
                fontWeight: 800,
                color: "#334155",
                letterSpacing: "2.5px",
                marginBottom: 10,
              }}
            >
              SESSION STATS
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
              {[
                { val: isActive ? fmt(callDuration) : "—", lbl: "DURATION" },
                { val: isActive ? `${volume}%` : "—", lbl: "VOLUME" },
                {
                  val: isActive ? "LIVE" : "IDLE",
                  lbl: "STATUS",
                  col: isActive ? "#4ade80" : "#a5b4fc",
                },
              ].map((s) => (
                <div
                  key={s.lbl}
                  style={{
                    background: "rgba(255,255,255,0.02)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    borderRadius: 14,
                    padding: 14,
                    textAlign: "center",
                    transition: "border-color 0.3s, background 0.3s",
                  }}
                  {...hoverStyle(
                    {
                      borderColor: "rgba(255,255,255,0.06)",
                      background: "rgba(255,255,255,0.02)",
                    },
                    {
                      borderColor: "rgba(99,102,241,0.3)",
                      background: "rgba(99,102,241,0.05)",
                    }
                  )}
                >
                  <div
                    style={{
                      fontSize: "1.2rem",
                      fontWeight: 900,
                      color: s.col || "#a5b4fc",
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {s.val}
                  </div>
                  <div
                    style={{
                      fontSize: 10,
                      color: "#334155",
                      fontWeight: 700,
                      letterSpacing: 1,
                      marginTop: 2,
                    }}
                  >
                    {s.lbl}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════════
            RIGHT PANEL - Live Demo (Orb, Controls, Logs)
            ═══════════════════════════════════════════════════════════════════════ */}
        <div style={{ flex: 0.9, display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Main Demo Card */}
          <div
            style={{
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 26,
              padding: "26px 22px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 20,
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Background glow effect */}
            <div
              style={{
                position: "absolute",
                top: -80,
                left: "50%",
                transform: "translateX(-50%)",
                width: 340,
                height: 340,
                background: "radial-gradient(circle, rgba(99,102,241,0.11) 0%, transparent 70%)",
                pointerEvents: "none",
              }}
            />

            {/* Status Header */}
            <div
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                  fontSize: 10,
                  fontWeight: 800,
                  letterSpacing: 1.5,
                  color: isActive ? "#4ade80" : "#475569",
                }}
              >
                {/* Blinking indicator dot */}
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: isActive ? "#22c55e" : "#475569",
                    boxShadow: isActive ? "0 0 8px #22c55e" : "none",
                    animation: isActive ? "blink-dot 1.1s infinite" : "none",
                  }}
                />
                {isActive ? `${selectedVoice.toUpperCase()} ACTIVE` : "SYSTEM IDLE"}
              </div>
              
              {/* Timer */}
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: isActive ? "#a5b4fc" : "#475569",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {fmt(callDuration)}
                {isActive && (
                  <span style={{ fontSize: 9, color: "#4ade80", marginLeft: 6 }}>
                    ● SYNCED
                  </span>
                )}
              </div>
            </div>

            {/* Main Orb with Rings */}
            <div
              style={{
                position: "relative",
                width: 200,
                height: 200,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                animation: isActive ? "none" : "float-orb 4s ease-in-out infinite",
              }}
            >
              <OrbRings isActive={isActive} />
              <WaveOrb isActive={isActive} />
            </div>

            {/* Large Waveform Visualizer */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 3,
                height: 52,
                width: "100%",
                justifyContent: "center",
              }}
            >
              {waveHeights.map((h, i) => (
                <div
                  key={i}
                  style={{
                    width: 5,
                    height: h,
                    borderRadius: 3,
                    background: isActive
                      ? `linear-gradient(135deg, ${selectedColor} 0%, #8B5CF6 50%, #a78bfa 100%)`
                      : "rgba(99,102,241,0.22)",
                    transition: "height 0.22s ease",
                  }}
                />
              ))}
            </div>

            {/* Volume Slider */}
            <div style={{ width: "100%", display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ fontSize: 11, color: "#334155", fontWeight: 700, width: 56 }}>
                VOLUME
              </div>
              <div
                style={{
                  flex: 1,
                  height: 5,
                  background: "rgba(255,255,255,0.06)",
                  borderRadius: 3,
                  cursor: "pointer",
                  position: "relative",
                }}
                onClick={(e) => {
                  const r = e.currentTarget.getBoundingClientRect();
                  const v = Math.max(
                    0,
                    Math.min(100, Math.round(((e.clientX - r.left) / r.width) * 100))
                  );
                  setVolume(v);
                  if (audioRef.current) audioRef.current.volume = v / 100;
                }}
              >
                {/* Filled portion */}
                <div
                  style={{
                    height: "100%",
                    borderRadius: 3,
                    background: GRADIENT,
                    width: `${volume}%`,
                    transition: "width 0.1s",
                  }}
                />
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: "#475569",
                  fontWeight: 700,
                  width: 28,
                  textAlign: "right",
                }}
              >
                {volume}
              </div>
            </div>

            {/* Console Log */}
            <div
              style={{
                width: "100%",
                background: "rgba(0,0,0,0.4)",
                border: "1px solid rgba(255,255,255,0.05)",
                borderRadius: 14,
                padding: 14,
                fontFamily: "'Courier New',monospace",
                fontSize: 11,
                color: "#4ade80",
                minHeight: 90,
                display: "flex",
                flexDirection: "column",
                gap: 3,
                overflow: "hidden",
              }}
            >
              {logs.length === 0 ? (
                <div style={{ color: "#1e293b" }}>// Awaiting call start...</div>
              ) : (
                logs.map((l, i) => (
                  <div key={i} style={{ animation: "slide-in 0.3s ease" }}>
                    <span style={{ color: "#6366f1" }}>› </span>
                    {l}
                  </div>
                ))
              )}
            </div>

            {/* Start/End Call Button */}
            {!isActive ? (
              <button
                onClick={handleStartCall}
                style={{
                  width: "100%",
                  background: GRADIENT,
                  color: "white",
                  border: "none",
                  padding: 16,
                  borderRadius: 14,
                  fontWeight: 800,
                  fontSize: 14,
                  cursor: "pointer",
                  letterSpacing: "0.5px",
                  boxShadow: "0 4px 20px rgba(99,102,241,0.4)",
                  transition: "all 0.25s",
                }}
                {...hoverStyle(
                  {
                    transform: "translateY(0)",
                    boxShadow: "0 4px 20px rgba(99,102,241,0.4)",
                  },
                  {
                    transform: "translateY(-2px)",
                    boxShadow: "0 8px 32px rgba(99,102,241,0.65)",
                  }
                )}
              >
                ▶ START CALL WITH {selectedVoice.toUpperCase()}
              </button>
            ) : (
              <button
                onClick={handleEndCall}
                style={{
                  width: "100%",
                  background: "rgba(239,68,68,0.09)",
                  border: "1px solid rgba(239,68,68,0.3)",
                  color: "#ef4444",
                  padding: 14,
                  borderRadius: 14,
                  fontWeight: 800,
                  fontSize: 13,
                  cursor: "pointer",
                  letterSpacing: "0.5px",
                  transition: "all 0.2s",
                }}
                {...hoverStyle(
                  {
                    background: "rgba(239,68,68,0.09)",
                    transform: "translateY(0)",
                  },
                  {
                    background: "rgba(239,68,68,0.18)",
                    transform: "translateY(-1px)",
                  }
                )}
              >
                ■ END CONVERSATION ({fmt(callDuration)})
              </button>
            )}
          </div>

          {/* Launch Button (navigates to /user) */}
          <button
            onClick={() => navigate("/user")}
            style={{
              width: "100%",
              background: GRADIENT,
              color: "white",
              border: "none",
              padding: 18,
              borderRadius: 16,
              fontWeight: 800,
              fontSize: 15,
              cursor: "pointer",
              boxShadow: "0 4px 24px rgba(192,132,252,0.45)",
              letterSpacing: "0.5px",
              transition: "all 0.25s",
              position: "relative",
              overflow: "hidden",
              textTransform: "uppercase",
            }}
            {...hoverStyle(
              {
                transform: "translateY(0)",
                boxShadow: "0 4px 24px rgba(192,132,252,0.45)",
              },
              {
                transform: "translateY(-2px)",
                boxShadow: "0 8px 32px rgba(192,132,252,0.65)",
              }
            )}
          >
            LAUNCH YOUR FIRST CALL →
          </button>
        </div>
      </div>
    </div>
  );
}