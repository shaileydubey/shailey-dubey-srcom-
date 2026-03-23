# ======================== NGROK TUNNEL SERVER ========================
# NGROK TUNNEL SERVER -> Hosts a local Pyannote diarization model via a secure public ngrok tunnel.
# ||
# ||
# ||
# Functions/Methods -> uvicorn.run() -> Start API server
# ||                 |
# ||                 |---> FastAPI() -> Initialize app instance
# ||                 |---> lifespan() -> Manage startup/shutdown
# ||                 |---> Pipeline.from_pretrained() -> Load Pyannote model
# ||                 |---> pipeline.to() -> Set device to CPU or GPU
# ||                 |---> ngrok.set_auth_token() -> Authenticate tunnel
# ||                 |---> ngrok.connect() -> Create public tunnel
# ||                 |---> health_check() -> API endpoint for health status
# ||                 |---> diarize_audio() -> Main processing endpoint
# ||                 |---> os.path.exists() -> Validate local file path
# ||                 |---> librosa.load() -> Load audio file (stereo-aware)
# ||                 |---> torch.from_numpy() -> Convert audio to tensor [C, T]
# ||                 |---> pipeline() -> Run diarization model
# ||                 |---> annotation.itertracks() -> Extract speaker segments
# ||                 |---> ngrok.kill() -> Close tunnel on shutdown
# ||                 |
# ||                 |---> Logic Flow -> API Server Execution Path:
# ||                                  |
# ||                                  |--- __main__ -> Trigger uvicorn.run()
# ||                                  |    └── FastAPI() starts -> Triggers lifespan()
# ||                                  |        ├── Pipeline.from_pretrained() -> Load Model
# ||                                  |        ├── ngrok.connect() -> Open Public Tunnel
# ||                                  |        ├── yield -> Server enters active listening state
# ||                                  |        │   ├── /health -> Returns system status
# ||                                  |        │   └── /diarize -> Triggers diarize_audio()
# ||                                  |        │       ├── Validate pipeline & file path
# ||                                  |        │       ├── librosa.load() stereo-aware & torch.from_numpy() -> Format audio as [C, T]
# ||                                  |        │       ├── Detect mono / fake stereo / true stereo
# ||                                  |        │       ├── pipeline() -> Execute model
# ||                                  |        │       ├── annotation.itertracks() -> Parse results
# ||                                  |        │       └── Return JSON -> Send speaker turns to client
# ||                                  |        └── Server shutdown -> ngrok.kill() -> Clean exit
# ||
# ======================================================================

# ---------------------------------------------------------------
# SECTION: IMPORTS
# ---------------------------------------------------------------
import os
import warnings

warnings.filterwarnings("ignore", message="torchcodec is not installed correctly")
warnings.filterwarnings("ignore", category=UserWarning, module="pyannote")

import uvicorn
import torch
import librosa
import numpy as np
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from pyannote.audio import Pipeline
from pyngrok import ngrok
from contextlib import asynccontextmanager
from dotenv import load_dotenv

# ---------------------------------------------------------------
# SECTION: CONSTANTS
# ---------------------------------------------------------------

load_dotenv()

HF_TOKEN    = os.getenv("HF_TOKEN")
NGROK_TOKEN = os.getenv("NGROK_TOKEN")
SERVER_PORT = int(os.getenv("SERVER_PORT", "8001"))

if not HF_TOKEN or not NGROK_TOKEN:
    raise RuntimeError(
        "❌ Missing .env values!\n"
        "   Make sure your .env file contains:\n"
        "     HF_TOKEN=hf_xxxxxxxxxxxxxxxxxxxx\n"
        "     NGROK_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxx"
    )


pipeline = None
# ---------------------------------------------------------------
# SECTION: FUNCTIONS
# ---------------------------------------------------------------
@asynccontextmanager
async def lifespan(app: FastAPI):
    global pipeline

    print("\n" + "="*55)
    print("🔹 Checkpoint 1: Starting Diarization Bridge...")

    try:
        # ── START: load pyannote pipeline ────────────────────────────────────
        print("🔹 Checkpoint 2: Loading Pyannote 3.1...")
        pipeline = Pipeline.from_pretrained(
            "pyannote/speaker-diarization-3.1",
            token=HF_TOKEN,   # pyannote 3.x uses 'token', not 'use_auth_token'
        )
        device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        pipeline.to(device)
        print(f"✅ Checkpoint 3: Model loaded on {device}!")
        # ── END: load pyannote pipeline ───────────────────────────────────────

        # ── START: connect ngrok tunnel ───────────────────────────────────────
        print("🔹 Checkpoint 4: Connecting Ngrok Tunnel...")
        ngrok.set_auth_token(NGROK_TOKEN)
        tunnel = ngrok.connect(addr=str(SERVER_PORT), proto="http")

        public_url = tunnel.public_url

        if public_url.startswith("http://"):
            public_url = public_url.replace("http://", "https://", 1)

        print("="*55)
        print(f"\n🚀 PUBLIC URL (copy this into Colab CONFIG):")
        print(f"   {public_url}/diarize")
        print(f"\n📋 Paste this exact URL into your Colab notebook:")
        print(f'   "diarizer_url": "{public_url}/diarize"')
        print("\n⚠️  Keep this terminal open while Colab is running!")
        print("="*55 + "\n")
        # ── END: connect ngrok tunnel ─────────────────────────────────────────

    except Exception as e:
        print(f"❌ Startup Error: {type(e).__name__}: {e}")
        import traceback
        traceback.print_exc()

    yield  # server runs while inside this block

    # ── START: clean shutdown ─────────────────────────────────────────────────
    print("\n🔹 Shutting down ngrok tunnel...")
    ngrok.kill()
    print("✅ Server shut down cleanly.")
    # ── END: clean shutdown ───────────────────────────────────────────────────


app = FastAPI(title="Diarization Bridge", lifespan=lifespan)

# ---------------------------------------------------------------
# SECTION: CLASSES
# ---------------------------------------------------------------

class AudioRequest(BaseModel):
    file_path: str


@app.get("/health")
async def health_check():
    """Health check — Colab can ping this to verify the tunnel is alive."""
    return {
        "status": "ok",
        "pipeline_loaded": pipeline is not None,
        "device": str(torch.device("cuda" if torch.cuda.is_available() else "cpu")),
    }


@app.post("/diarize")
async def diarize_audio(request: AudioRequest):
    """
    Receives a Windows file path from Colab via the ngrok tunnel,
    runs pyannote speaker diarization, returns speaker-turn segments as JSON.
    """

    # ── START: validate pipeline loaded ──────────────────────────────────────
    if pipeline is None:
        raise HTTPException(
            status_code=503,
            detail="Diarization pipeline not loaded yet. Wait for startup to finish.",
        )
    # ── END: validate pipeline loaded ─────────────────────────────────────────

    # ── START: validate file exists locally ──────────────────────────────────
    if not os.path.exists(request.file_path):
        raise HTTPException(
            status_code=404,
            detail=(
                f"File not found on the local machine: {request.file_path}\n"
                "Make sure the audio file is in the correct Windows folder\n"
                "and the path in your Colab notebook matches exactly."
            ),
        )
    # ── END: validate file exists locally ────────────────────────────────────

    try:
        print(f"\n📂 Processing: {request.file_path}")

        # ── START: load audio with librosa ────────────────────────────────────
        # librosa handles mp3/wav/m4a/ogg/flac via ffmpeg backend
        # sr=16000: pyannote requires 16kHz sample rate
        # mono=False: preserve all channels — stereo kept for better diarization
        # pyannote performs better with stereo as speakers stay in separate channels
        y, sr = librosa.load(request.file_path, sr=16000, mono=False)

        # ── START: detect channel count → build correct tensor shape ──────────
        # case 1: already mono → wrap to [1, T]
        # case 2: fake stereo (channels identical) → collapse to mono [1, T]
        # case 3: true stereo / multi-channel → keep as [C, T] for pyannote
        if y.ndim == 1:
            # file was already mono — wrap to [1, T] for pyannote
            num_channels = 1
            waveform     = torch.from_numpy(y).unsqueeze(0)
            print(f"   Loaded: {len(y)/sr:.1f}s | {sr}Hz | mono (1 channel)")
        else:
            # stereo or multi-channel — shape is [C, T]
            num_channels = y.shape[0]
            duration     = y.shape[1] / sr
            diff         = float(np.mean(np.abs(y[0] - y[1]))) if num_channels == 2 else 1.0
            print(f"   Loaded: {duration:.1f}s | {sr}Hz | {num_channels} channels")

            if num_channels == 2 and diff < 0.001:
                # fake stereo — both channels identical — collapse to mono [1, T]
                print(f"   ⚠️  Fake stereo detected (diff={diff:.4f}) — collapsing to mono")
                waveform     = torch.from_numpy(y[0]).unsqueeze(0)
                num_channels = 1
            else:
                # true multi-channel — pass [C, T] directly to pyannote
                # pyannote uses all channels for better speaker separation
                print(f"   ✅ True stereo (diff={diff:.4f}) — keeping {num_channels} channels")
                waveform = torch.from_numpy(y)   # shape: [C, T]
        # ── END: detect channel count ─────────────────────────────────────────
        # ── END: load audio with librosa ──────────────────────────────────────

        # ── START: build pyannote audio payload ───────────────────────────────
        # pyannote accepts waveform as [C, T] tensor — works for:
        
        audio_payload = {"waveform": waveform, "sample_rate": sr}
        # ── END: build pyannote audio payload ─────────────────────────────────

        # ── START: run diarization pipeline ──────────────────────────────────
        diarization_result = pipeline(audio_payload, min_speakers=2, max_speakers=4)
        # ── END: run diarization pipeline ────────────────────────────────────

        # ── START: extract annotation object ─────────────────────────────────
        print(f"   Result type: {type(diarization_result).__name__}")
        print(f"   Result attrs: {[a for a in dir(diarization_result) if not a.startswith('_')]}")

        if hasattr(diarization_result, "speaker_diarization"):
            annotation = diarization_result.speaker_diarization
        elif hasattr(diarization_result, "annotation"):
            annotation = diarization_result.annotation
        elif hasattr(diarization_result, "diarization"):
            annotation = diarization_result.diarization
        else:
            annotation = diarization_result
        print(f"   Annotation type: {type(annotation).__name__}")
        # ── END: extract annotation object ───────────────────────────────────

        # ── START: build segments list ────────────────────────────────────────
        # itertracks(yield_label=True) → (Segment, track_name, speaker_label)
        # Segment has .start and .end in seconds (float)
        segments = []
        for t, _, s in annotation.itertracks(yield_label=True):
            segments.append({
                "start"  : round(t.start, 3),
                "end"    : round(t.end,   3),
                "speaker": s,
            })
        # ── END: build segments list ──────────────────────────────────────────

        print(f"✅ Success! Found {len(segments)} speaker turns.")
        return {"segments": segments, "num_speakers": len(set(s["speaker"] for s in segments))}

    except HTTPException:
        raise   # re-raise HTTP errors unchanged

    except Exception as e:
        print(f"❌ Diarization error: {type(e).__name__}: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"{type(e).__name__}: {e}")


if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=SERVER_PORT)