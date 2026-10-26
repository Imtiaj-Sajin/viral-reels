"""Render a reel (or preview stills) with Remotion.

usage: python render.py <reel_dir> [--stills 1.0,5.5,...]
"""
import json, os, shutil, subprocess, sys

ENGINE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
reel = os.path.abspath(sys.argv[1])
script = json.load(open(os.path.join(reel, "script.json"), encoding="utf-8"))
tim = json.load(open(os.path.join(reel, "timings.json"), encoding="utf-8"))
os.makedirs(os.path.join(ENGINE, "public", "reel"), exist_ok=True)
shutil.copy(os.path.join(reel, "voice.wav"), os.path.join(ENGINE, "public", "reel", "voice.wav"))
props = {**tim, **{k: v for k, v in script.items() if k not in ("lines", "voices", "cover")}}
COMP = script.get("comp", "Explainer" if "mouth" in tim else "Reel")
pp = os.path.join(reel, "props.json")
json.dump(props, open(pp, "w", encoding="utf-8"))
npx = "npx.cmd" if os.name == "nt" else "npx"
GL = [f"--gl={script['gl']}"] if script.get("gl") else []  # 3D comps need a real GPU context (angle)
CONC = str(script.get("concurrency", 6))

if "--cover" in sys.argv:
    cp = os.path.join(reel, "props_cover.json")
    json.dump({**props, "cover": script.get("cover", [script.get("title", "")]), "coverMode": True}, open(cp, "w", encoding="utf-8"))
    out = os.path.join(reel, "cover.png")
    r = subprocess.run([npx, "remotion", "still", "src/index.ts", COMP, out, f"--props={cp}", "--frame=58", "--log=error", *GL],
                       cwd=ENGINE, capture_output=True, text=True)
    print(out if r.returncode == 0 else r.stdout[-1500:] + r.stderr[-1500:])
elif "--stills" in sys.argv:
    times = [float(x) for x in sys.argv[sys.argv.index("--stills") + 1].split(",")]
    os.makedirs(os.path.join(reel, "stills"), exist_ok=True)
    for s in times:
        out = os.path.join(reel, "stills", f"f_{s:05.2f}.png")
        r = subprocess.run([npx, "remotion", "still", "src/index.ts", COMP, out, f"--props={pp}", f"--frame={int(s * 30)}",
                            "--log=error", *GL], cwd=ENGINE, capture_output=True, text=True)
        print(out if r.returncode == 0 else r.stdout[-1500:] + r.stderr[-1500:])
else:
    out = os.path.join(reel, f"{script['id']}.mp4")
    raw = os.path.join(reel, "_raw.mp4")
    r = subprocess.run([npx, "remotion", "render", "src/index.ts", COMP, raw, f"--props={pp}", "--codec=h264", "--crf=17",
                        "--pixel-format=yuv420p", "--color-space=bt709", f"--concurrency={CONC}", "--log=error", *GL],
                       cwd=ENGINE, capture_output=True, text=True)
    if r.returncode:
        print(r.stdout[-3000:] + r.stderr[-3000:]); sys.exit(1)
    # loudness: plain gain to about -16 LUFS + peak limiter (no EQ, no tone change)
    FF = os.environ.get("FFMPEG") or shutil.which("ffmpeg") or "C:/Users/User/AppData/Local/CapCut/Apps/9.6.0.4097/ffmpeg.exe"  # FFMPEG env var > PATH > CapCut's bundled copy
    m = subprocess.run([FF, "-hide_banner", "-i", raw, "-vn", "-af", "loudnorm=print_format=summary", "-f", "null", "-"],
                       capture_output=True, text=True).stderr
    lufs = float([l for l in m.splitlines() if "Input Integrated" in l][0].split()[2])
    gain = round(-16.0 - lufs, 2)
    subprocess.run([FF, "-hide_banner", "-y", "-i", raw, "-c:v", "copy", "-af",
                    f"volume={gain}dB,alimiter=limit=0.89:attack=5:release=60:level=0", "-c:a", "aac", "-b:a", "256k",
                    "-movflags", "+faststart", out], capture_output=True, check=True)
    os.remove(raw)
    print(out, f"(audio {lufs} LUFS -> gain {gain} dB)")
