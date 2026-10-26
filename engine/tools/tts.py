"""Voice a reel script with Kokoro and write word timings for the captions.

usage: python tts.py <reel_dir>
reads  <reel_dir>/script.json
writes <reel_dir>/voice.wav, <reel_dir>/timings.json
"""
import json, os, re, sys
import numpy as np
import soundfile as sf
from kokoro import KPipeline

SR = 24000
GAP_SAME, GAP_SWITCH, LEAD_IN, TAIL = 0.14, 0.28, 0.15, 0.6
PUNCT = re.compile(r"^[\.\,\!\?\;\:…\"'\)\-]+$")

reel = sys.argv[1]
script = json.load(open(os.path.join(reel, "script.json"), encoding="utf-8"))
pipes = {}


def pipe(lang):
    if lang not in pipes:
        pipes[lang] = KPipeline(lang_code=lang, device="cuda")
    return pipes[lang]


def norm(w):
    return re.sub(r"[^a-z0-9']", "", w.lower())


audio = [np.zeros(int(LEAD_IN * SR), np.float32)]
t = LEAD_IN
lines_out, prev = [], None
for i, line in enumerate(script["lines"]):
    v = script["voices"][line["speaker"]]
    if prev is not None:
        gap = GAP_SAME if prev == line["speaker"] else GAP_SWITCH
        audio.append(np.zeros(int(gap * SR), np.float32))
        t += gap
    chunks, words = [], []
    offset = 0.0
    for r in pipe(v["lang"])(line["text"], voice=v["voice"], speed=v["speed"]):
        a = r.audio.cpu().numpy() if hasattr(r.audio, "cpu") else np.asarray(r.audio, np.float32)
        for tok in (r.tokens or []):
            if tok.start_ts is None:
                continue
            txt = tok.text
            if PUNCT.match(txt) and words:
                words[-1]["w"] += txt
                continue
            words.append({"w": txt, "start": round(t + offset + tok.start_ts, 3),
                          "end": round(t + offset + (tok.end_ts or tok.start_ts + 0.2), 3)})
        chunks.append(a)
        offset += len(a) / SR
    a = np.concatenate(chunks)
    # trim trailing silence a little so pacing stays tight
    nz = np.where(np.abs(a) > 0.01)[0]
    if len(nz):
        a = a[: min(len(a), nz[-1] + int(0.08 * SR))]
    dur = len(a) / SR
    hl = {norm(h) for h in line.get("hl", [])}
    for w in words:
        w["hl"] = norm(w["w"]) in hl
    lines_out.append({"i": i, "speaker": line["speaker"], "scene": line["scene"], "text": line["text"],
                      "start": round(t, 3), "end": round(t + dur, 3), "words": words})
    audio.append(a.astype(np.float32))
    t += dur
    prev = line["speaker"]
audio.append(np.zeros(int(TAIL * SR), np.float32))
total = t + TAIL

# caption chunks: 1-3 words (4 if it would otherwise end on a small word), break after punctuation
SMALL = {"a", "an", "the", "of", "to", "in", "on", "at", "for", "from", "your", "my", "it", "and", "or", "who's",
         "their", "its", "is", "was", "that's", "it's", "has", "a", "this", "what", "when"}
caps = []
for ln in lines_out:
    manual = script["lines"][ln["i"]].get("caps")
    if manual:  # explicit caption breaks from the script
        k = 0
        for chunk in manual:
            n = len(chunk.split())
            ws = ln["words"][k:k + n]
            if ws:
                caps.append({"line": ln["i"], "speaker": ln["speaker"], "start": ws[0]["start"], "words": ws})
            k += n
        continue
    cur = []
    for k, w in enumerate(ln["words"]):
        cur.append(w)
        last = k == len(ln["words"]) - 1
        punct = re.search(r"[\.\,\!\?…]$", w["w"])
        chars = sum(len(x["w"]) for x in cur)
        small_end = norm(w["w"]) in SMALL and not punct
        nxt = ln["words"][k + 1] if not last else None
        orphan_next = nxt is not None and re.search(r"[\.\,\!\?…]$", nxt["w"]) and len(cur) <= 3
        if last or punct or ((len(cur) >= 3 or chars >= 15) and not (small_end and len(cur) < 5) and not orphan_next):
            caps.append({"line": ln["i"], "speaker": ln["speaker"], "start": cur[0]["start"], "words": cur})
            cur = []
for k, c in enumerate(caps):
    nxt = caps[k + 1]["start"] if k + 1 < len(caps) else total
    c["end"] = round(min(nxt, c["words"][-1]["end"] + 0.6), 3)

sf.write(os.path.join(reel, "voice.wav"), np.concatenate(audio), SR)
json.dump({"duration": round(total, 3), "lines": lines_out, "captions": caps},
          open(os.path.join(reel, "timings.json"), "w", encoding="utf-8"), indent=1)
print(f"voice {total:.2f}s, {len(lines_out)} lines, {len(caps)} caption chunks")
for ln in lines_out:
    print(f"  {ln['start']:6.2f}-{ln['end']:6.2f}  [{ln['speaker']}] {ln['text']}")
