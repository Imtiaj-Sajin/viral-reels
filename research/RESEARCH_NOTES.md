# Viral reels: research notes (2026-10-25)

## Reference reels studied (downloaded to this folder)
| Reel | Stats | Length | What it does |
|---|---|---|---|
| Adilet, "Your vibe-coded app can get sued for $100,000" (DdbYNbdIP2e) | 21.5K likes, 2,881 comments | 69 s | Scary specific number in sentence 1, then 6 concrete examples, each adding to a running "bill" on screen. Payoff is a copy-paste prompt in the caption. Ends "Following me is the cheapest cofounder you'll ever hire" + follow-button animation. |
| Adilet, skill promo (De6cx6MRxbZ) | 109 likes, 309 comments | 46 s | Cartoon presenter of himself at bottom, cream background, red italic key words, "First / Second / Third you might think..." objection structure. "Comment SKILL" CTA. |
| TCG (theclothinggame_), drop shoulders (De3-f0FSfci) | 11K likes, 1,407 comments | 40 s | Dark blueprint look, huge 2-line statements ("IT'S NOT THE FABRIC. IT'S ONE SEAM."), one number changes on screen, "Comment TECHPACK" CTA. |

## Shared pattern
- **Not AI video.** All three are code-generated motion graphics: voiceover + kinetic captions + simple UI/diagram scenes.
- **Hook in second 1**, spoken and on screen at once, usually with a specific number.
- **Captions 1-4 words at a time**, centred, one key word highlighted (box, colour or italic).
- **Something keeps changing every 1-2 s** (whip pan, zoom kick, a tally going up, a toggle flipping).
- **A visible promise of a payoff** ("the prompt at the end" progress bar) keeps people to the end.
- **One clear ending ask**: follow line with personality, or "comment WORD" (comment keyword reels get very high comment counts).
- 9:16, 1080x1920 (they upload 720x1280 / 30 fps). 40-70 s.

## Algorithm notes (sergebulaev/instagram-skills, community-measured)
- Strongest signals: **sends/shares per reach**, then saves, comments (especially with author replies), watch time / completion / rewatches. Likes are weak.
- First 1-3 s decide reach. Loop-friendly endings help rewatches.
- 3-5 hashtags, not 30. Hook inside the first ~125 caption characters. Avoid engagement bait ("comment YES", "tag 3 friends") and other apps' watermarks.
- Send-driven formats: relatable truths, myth-busters, contrarian takes. Save-driven: how-tos, lists, frameworks.

## Tools available on this PC
- Node 25 + Chrome: can render programmatic video (Remotion or HTML frames -> ffmpeg).
- Voice: Kokoro (free, local, natural English, word timestamps), edge-tts (Microsoft online voices, includes Bangla bn-BD). ElevenLabs only with a paid API key.
- ffmpeg (CapCut's copy, NVENC), Python + Pillow.

## User preferences learned so far
- No name tags / text naming the AI characters on screen.
- No EQ / compression / "frequency" changes on audio.
- Wants a consistent style + character so future reels can reuse it.
