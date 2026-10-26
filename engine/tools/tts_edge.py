"""Voice a script with Microsoft neural voices (edge-tts) + word timings + lip-sync curve.

usage: python tts_edge.py <reel_dir>
reads  <reel_dir>/script.json   (voice, rate, lines[{text, hl, caps?, ...}])
writes <reel_dir>/voice.wav, <reel_dir>/timings.json
"""
import asyncio, json, os, re, subprocess, sys, shutil
import numpy as np
import soundfile as sf
import edge_tts

FF = os.environ.get("FFMPEG") or shutil.which("ffmpeg") or "C:/Users/User/AppData/Local/CapCut/Apps/9.6.0.4097/ffmpeg.exe"  # FFMPEG env var > PATH > CapCut's bundled copy
SR, FPS = 24000, 30
reel = sys.argv[1]
script = json.load(open(os.path.join(reel, "script.json"), encoding="utf-8"))
VOICE = script.get("voice", "en-US-BrianMultilingualNeural")
RATE = script.get("rate", "+6%")
GAP, LEAD, TAIL = script.get("gap", 0.22), 0.12, 0.9
tmp = os.path.join(reel, "_tts")
os.makedirs(tmp, exist_ok=True)


def norm(w):
    return re.sub(r"[^a-z0-9']", "", w.lower())


async def speak(i, text):
    c = edge_tts.Communicate(text, VOICE, rate=RATE, boundary="WordBoundary")
    words, mp3 = [], os.path.join(tmp, f"l{i:02d}.mp3")
    with open(mp3, "wb") as f:
        async for ch in c.stream():
            if ch["type"] == "audio":
                f.write(ch["data"])
            elif ch["type"] == "WordBoundary":
                words.append({"w": ch["text"], "start": ch["offset"] / 1e7, "end": (ch["offset"] + ch["duration"]) / 1e7})
    wav = mp3[:-4] + ".wav"
    subprocess.run([FF, "-hide_banner", "-y", "-i", mp3, "-ac", "1", "-ar", str(SR), wav], capture_output=True, check=True)
    a, _ = sf.read(wav, dtype="float32")
    return a, words


async def main():
    audio, t, lines = [np.zeros(int(LEAD * SR), np.float32)], LEAD, []
    for i, ln in enumerate(script["lines"]):
        a, words = await speak(i, ln["text"])
        nz = np.where(np.abs(a) > 0.008)[0]
        if len(nz):  # trim leading/trailing silence, keep a hair of air
            s0 = max(0, nz[0] - int(0.02 * SR)); s1 = min(len(a), nz[-1] + int(0.06 * SR))
            shift = s0 / SR
            a = a[s0:s1]
            for w in words:
                w["start"] -= shift; w["end"] -= shift
        # restore punctuation/casing from the script text (word boundaries come without it)
        toks, ti = re.findall(r"\S+", ln["text"]), 0
        for w in words:
            n = max(1, len(w["w"].split()))  # a boundary can span several script words ("In 1971")
            for j in range(ti, min(ti + 4, len(toks))):
                cand = " ".join(toks[j:j + n])
                if norm(cand).startswith(norm(w["w"])) or norm(w["w"]).startswith(norm(toks[j])):
                    w["w"] = cand; ti = j + n; break
        hl = {norm(h) for h in ln.get("hl", [])}
        ws = [{"w": w["w"], "start": round(t + max(0, w["start"]), 3), "end": round(t + max(0, w["end"]), 3),
               "hl": norm(w["w"]) in hl} for w in words]
        dur = len(a) / SR
        lines.append({**{k: v for k, v in ln.items() if k not in ("text",)}, "i": i, "text": ln["text"],
                      "start": round(t, 3), "end": round(t + dur, 3), "words": ws})
        audio.append(a)
        gap = ln.get("pause", GAP)
        audio.append(np.zeros(int(gap * SR), np.float32))
        t += dur + gap
    audio.append(np.zeros(int(TAIL * SR), np.float32))
    full = np.concatenate(audio)
    total = len(full) / SR
    sf.write(os.path.join(reel, "voice.wav"), full, SR)
    # lip-sync: RMS per video frame -> 0..1 mouth openness
    hop = SR // FPS
    rms = np.array([np.sqrt(np.mean(full[k:k + hop] ** 2) + 1e-12) for k in range(0, len(full), hop)])
    db = 20 * np.log10(rms + 1e-9)
    mouth = np.clip((db + 42) / 26, 0, 1)
    mouth = np.convolve(mouth, [0.25, 0.5, 0.25], mode="same")
    json.dump({"duration": round(total, 3), "lines": lines, "mouth": [round(float(x), 3) for x in mouth]},
              open(os.path.join(reel, "timings.json"), "w", encoding="utf-8"), indent=1)
    print(f"voice {total:.2f}s  {sum(len(l['words']) for l in lines)} words  ({sum(len(l['words']) for l in lines) / total:.2f} w/s)")
    for l in lines:
        print(f"  {l['start']:6.2f}-{l['end']:6.2f}  {l['text']}")


asyncio.run(main())
