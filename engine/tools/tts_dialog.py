"""Two-character dialogue voice track (edge-tts) + per-speaker mouth curves.

usage: python tts_dialog.py <reel_dir>
script.json: {"cast": {"dev": {"voice": "...", "rate": "+5%"}, ...}, "lines": [{"who": "dev", "text": "...", "pause": 0.4, ...}]}
writes voice.wav and timings.json {duration, lines[{who,text,start,end,...}], mouth: {who: [per-frame 0..1]}}
"""
import asyncio, json, os, re, subprocess, sys, shutil
import numpy as np
import soundfile as sf
import edge_tts

FF = os.environ.get("FFMPEG") or shutil.which("ffmpeg") or "C:/Users/User/AppData/Local/CapCut/Apps/9.6.0.4097/ffmpeg.exe"  # FFMPEG env var > PATH > CapCut's bundled copy
SR, FPS = 24000, 30
reel = sys.argv[1]
script = json.load(open(os.path.join(reel, "script.json"), encoding="utf-8"))
CAST = script["cast"]
LEAD, TAIL, GAP = script.get("lead", 0.6), script.get("tail", 1.6), script.get("gap", 0.32)
tmp = os.path.join(reel, "_tts"); os.makedirs(tmp, exist_ok=True)


async def speak(i, who, text):
    v = CAST[who]
    c = edge_tts.Communicate(text, v["voice"], rate=v.get("rate", "+0%"), pitch=v.get("pitch", "+0Hz"), boundary="WordBoundary")
    mp3 = os.path.join(tmp, f"l{i:02d}.mp3")
    with open(mp3, "wb") as f:
        async for ch in c.stream():
            if ch["type"] == "audio":
                f.write(ch["data"])
    wav = mp3[:-4] + ".wav"
    subprocess.run([FF, "-hide_banner", "-y", "-i", mp3, "-ac", "1", "-ar", str(SR), wav], capture_output=True, check=True)
    a, _ = sf.read(wav, dtype="float32")
    nz = np.where(np.abs(a) > 0.008)[0]
    if len(nz):
        a = a[max(0, nz[0] - int(0.02 * SR)): min(len(a), nz[-1] + int(0.06 * SR))]
    return a


def mouth_curve(a):
    hop = SR // FPS
    rms = np.array([np.sqrt(np.mean(a[k:k + hop] ** 2) + 1e-12) for k in range(0, len(a), hop)])
    m = np.clip((20 * np.log10(rms + 1e-9) + 42) / 26, 0, 1)
    return np.convolve(m, [0.25, 0.5, 0.25], mode="same")


async def main():
    parts, t, lines = [np.zeros(int(LEAD * SR), np.float32)], LEAD, []
    tracks = {who: [] for who in CAST}
    for i, ln in enumerate(script["lines"]):
        if i > 0:
            gap = ln.get("pause", GAP)
            parts.append(np.zeros(int(gap * SR), np.float32)); t += gap
        a = await speak(i, ln["who"], ln["text"])
        dur = len(a) / SR
        lines.append({**ln, "i": i, "start": round(t, 3), "end": round(t + dur, 3)})
        tracks[ln["who"]].append((t, a))
        parts.append(a); t += dur
    parts.append(np.zeros(int(TAIL * SR), np.float32))
    full = np.concatenate(parts); total = len(full) / SR
    sf.write(os.path.join(reel, "voice.wav"), full, SR)
    nfr = int(np.ceil(total * FPS)) + 2
    mouth = {}
    for who, segs in tracks.items():
        arr = np.zeros(nfr)
        for st, a in segs:
            m = mouth_curve(a); f0 = int(round(st * FPS))
            arr[f0:f0 + len(m)] = m[: max(0, nfr - f0)]
        mouth[who] = [round(float(x), 3) for x in arr]
    json.dump({"duration": round(total, 3), "lines": lines, "mouth": mouth}, open(os.path.join(reel, "timings.json"), "w", encoding="utf-8"), indent=1)
    print(f"dialogue {total:.2f}s, {len(lines)} lines")
    for l in lines:
        print(f"  {l['start']:6.2f}-{l['end']:6.2f}  [{l['who']}] {l['text']}")


asyncio.run(main())
