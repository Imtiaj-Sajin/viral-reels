# Viral Reels

Code-made vertical reels (1080×1920, 30 fps) for Instagram, Facebook and YouTube Shorts.
You write one `script.json`, the tools make the voice, and Remotion renders the finished video.

There are three styles so far:

| Style | Composition | Voice tool | Example folder |
| --- | --- | --- | --- |
| Explainer: host R1 + paper background + kinetic captions | `Explainer` | `tts_edge.py` (one voice) | `reels/ep01_api_key_bill` |
| Mystery: evidence-board camera, whip pans, red string | `Mystery2` | `tts_edge.py` (one voice) | `reels/ep02_db_cooper_v2` |
| 3D low-poly skit: R1 and the orange Claude buddy on a giant laptop | `Skit` | `tts_dialog.py` (two voices) | `reels/ep03_api_key_skit` |

## What is in this repo

```text
engine/            Remotion project
  src/v2/          Explainer, Mystery2, HostR1 (the 2D host rig), character concept sheets
  src/v3/          3D skit: Skit, DevR1 (3D host), Buddy, DeskWorld, ScreenUI
  tools/           voice, render and preview scripts (below)
  public/sfx/      sound effects (made by tools/sfx.py and sfx_mystery.py)
  public/ep02/     archive photos used in EP02 (public domain / CC, credited in POST.txt)
reels/<episode>/   script.json (you write it), timings.json (generated), POST.txt, cover.jpg
character/         host design rounds; the approved host is R1 (character/concepts_round4/r1.png)
research/          RESEARCH_NOTES.md (what makes the reference reels work)
```

Not in git: the rendered `.mp4` files, voice `.wav` files, `node_modules`, and the downloaded reference reels
(other creators' videos). Render the videos again with the steps below, or keep the originals in your own storage.

## Setup (once per computer)

1. **Node.js 18+**: `cd engine` then `npm install`
2. **Python 3.10+**: `pip install -r engine/requirements.txt`
3. **ffmpeg**: put it on PATH, or set the `FFMPEG` environment variable to the full path of `ffmpeg.exe`.
   (On the original PC the tools fall back to the copy inside CapCut.)
4. **Internet** for the voices (Microsoft neural voices through edge-tts, free, no key).
5. **A GPU** for the 3D skit. It renders through WebGL with `--gl=angle`; set `"gl": "angle"` in its `script.json`.

Live preview of any composition: `cd engine` then `npm run studio`.

## Make a new episode

Run these from the repo root. `reels/ep04_topic` is the example folder name.

1. **Copy the closest example** and rename it: `reels/ep04_topic`. In `script.json` set `"id": "ep04_topic"`.
2. **Write the lines** in `script.json` (fields for each style are below).
3. **Make the voice, timings and lip-sync curve:**
   - narration: `python engine/tools/tts_edge.py reels/ep04_topic`
   - two characters: `python engine/tools/tts_dialog.py reels/ep04_topic`
4. **Check frames** before the full render:
   - `python engine/tools/render.py reels/ep04_topic --stills 0.5,5,12,20` saves PNGs in `reels/ep04_topic/stills/`
   - faster for many frames (one bundle), after any `render.py` run has written `props.json`:
     `cd engine` then `node tools/stills.mjs Skit ../reels/ep04_topic/props.json ../reels/ep04_topic/stills 0.5,5,12 angle`
     (leave off `angle` for the 2D styles, and use that style's composition name)
5. **Cover image:** `python engine/tools/render.py reels/ep04_topic --cover` writes `cover.png` (save it as `cover.jpg` for posting).
6. **Final video:** `python engine/tools/render.py reels/ep04_topic` writes `reels/ep04_topic/ep04_topic.mp4`.
   The audio is brought to about -16 LUFS with a plain volume change and a peak limiter. No EQ and no compression.
7. **Write `POST.txt`**: caption, hashtags, pinned comment, YouTube title and description, how to post, and a source for every fact.

### `script.json` fields

**Explainer** (`ep01`): top level `id, voice, rate, gap, tally_label, cover`.
Each line: `text`, `scene` (a scene component in `engine/src/v2/Explainer.tsx`), `section`, `hl` (words to highlight),
`mood` (neutral, shocked, smirk, worried, happy), `gesture` (none, point, palm, hands, wave), `bg` (paper, red, ink), `tally`, `pause`.

**Mystery** (`ep02_db_cooper_v2`): top level adds `"comp": "Mystery2"`, `case`, `pill_locked`, `pill_open`, `unlock_scene`.
Each line: `text`, `scene` (a scene in `engine/src/v2/Mystery2.tsx`), `hl`, `mood`, `gesture`, `nopresenter`, `tally`, `pause`.

**3D skit** (`ep03`): top level `"comp": "Skit"`, `"gl": "angle"`, `concurrency` (3 is safe), `cast` (a `voice` and `rate` for `dev` and `claude`),
`lead`, `gap`, `tail` (seconds of silence at the start, between lines and at the end), `cover` (two lines of cover text).
Each line:

- `who`: `dev` or `claude`
- `text`: what is spoken; `cap`: caption text if it should differ (for example "$82,000" instead of "eighty-two thousand dollars")
- `shot`: `wide`, `dev`, `devpunch` (snap zoom), `devleft`, `devlow`, `buddy`, `buddy2`, `ots`, `stare`, or `screen` with `"screen": "commits"` / `"stars"`
- `dev`: the dev's mood (neutral, worried, shocked, happy, smirk); `claude`: the buddy's eyes (neutral, flat, happy, wide, stare)
- `gesture`: hands, point, facepalm, shrug, cheer; `then`: a second gesture after the first; `gAt`: start time relative to the line (seconds)
- `pause`: silence before this line (seconds)

The first line always opens on the screen and pulls back to the wide shot. The last shot (the stars ticking up) is added after the final line.
The screen content and its timed events (the highlighted commit, the chat, the star count) are written for EP03's story in
`engine/src/v3/ScreenUI.ts` and the `screen` block of `engine/src/v3/Skit.tsx`. A new skit needs those edited for its own story.

## House rules

- Every fact in a video or caption needs a source in `POST.txt`.
- Images must be public domain or CC-licensed, with credit.
- Write original jokes and scripts. Study the reference reels, never copy them.
- Never EQ, compress or otherwise change the tone of recorded audio. Only the volume level.
- No on-screen name tags for the AI characters.
- Show character or design options as still images first, and build only after one is approved.

## Old

`reels/reel01_ai_forgets` and `engine/public/clips` are the first attempt, made with the Moon Race characters. They are not part of the series.
The clips are not in git, so the old `Reel` composition will not render from a fresh clone.
