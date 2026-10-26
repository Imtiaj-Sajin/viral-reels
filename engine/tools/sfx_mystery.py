"""Synthesize mystery ambience + hits (48 kHz). usage: python sfx_mystery.py <out_dir> <bed_seconds>"""
import os, sys
import numpy as np
import soundfile as sf
from scipy.signal import butter, lfilter, fftconvolve

SR = 48000
OUT, BED = sys.argv[1], float(sys.argv[2])
os.makedirs(OUT, exist_ok=True)
rng = np.random.default_rng(11)
t_ = lambda d: np.arange(int(d * SR)) / SR


def lp(x, f, o=2): b, a = butter(o, f / (SR / 2), "low"); return lfilter(b, a, x)
def hp(x, f, o=2): b, a = butter(o, f / (SR / 2), "high"); return lfilter(b, a, x)
def bp(x, lo, hi, o=2): b, a = butter(o, [lo / (SR / 2), hi / (SR / 2)], "band"); return lfilter(b, a, x)


def reverb(x, secs=2.5, wet=0.35):
    n = int(secs * SR)
    ir = rng.standard_normal(n) * np.exp(-np.arange(n) / SR * (6.9 / secs))
    ir = lp(ir, 4500)
    y = fftconvolve(x, ir)[: len(x) + n]
    y = np.pad(y, (0, len(x) + n - len(y)))
    y = y / (np.max(np.abs(y)) + 1e-9)
    xx = np.concatenate([x, np.zeros(n)])
    return (1 - wet) * xx / (np.max(np.abs(xx)) + 1e-9) + wet * y


def save(name, x, peak=0.8, stereo_width=0.0):
    x = x / (np.max(np.abs(x)) + 1e-9) * peak
    if stereo_width:
        d = int(0.012 * SR)
        st = np.stack([x, np.concatenate([np.zeros(d), x[:-d]])], 1)
    else:
        st = np.stack([x, x], 1)
    sf.write(os.path.join(OUT, name + ".wav"), st.astype(np.float32), SR)


# --- bed: dark drone, slow swells, faint heartbeat ---
t = t_(BED)
drone = (np.sin(2 * np.pi * 55 * t) + 0.6 * np.sin(2 * np.pi * 55.3 * t) + 0.45 * np.sin(2 * np.pi * 82.4 * t)
         + 0.25 * np.sin(2 * np.pi * 110.2 * t))
swell = 0.6 + 0.4 * np.sin(2 * np.pi * t / 9.0 - 1.2)
air = bp(rng.standard_normal(len(t)), 300, 1400) * (0.5 + 0.5 * np.sin(2 * np.pi * t / 13.0)) * 0.12
eerie = 0.05 * np.sin(2 * np.pi * 659.3 * t) * (0.5 + 0.5 * np.sin(2 * np.pi * 0.21 * t)) ** 3
beat = np.zeros(len(t))
k = t_(0.18); thump = np.sin(2 * np.pi * (52 * np.exp(-k * 10) + 38) * k) * np.exp(-k * 22)
period = 60 / 66
for i, start in enumerate(np.arange(0.6, BED - 0.5, period)):
    for off, g in ((0, 1.0), (0.28, 0.6)):
        s = int((start + off) * SR); beat[s:s + len(thump)] += thump[: len(beat) - s] * g
bed = drone * swell * 0.55 + air + eerie + beat * 0.35
fade = np.minimum(1, t / 1.5) * np.minimum(1, (BED - t) / 2.5)
save("m_bed", lp(bed, 2200) * fade, 0.7, stereo_width=1)

# --- jet cabin rumble (loopable 12 s) ---
d = 12; t = t_(d)
brown = np.cumsum(rng.standard_normal(len(t))); brown = hp(brown, 25)
jet = lp(brown, 260) + 0.15 * np.sin(2 * np.pi * 118 * t) + 0.05 * bp(rng.standard_normal(len(t)), 2500, 5000)
jet *= np.minimum(1, t / 1.0) * np.minimum(1, (d - t) / 1.0)
save("m_jet", jet, 0.6, stereo_width=1)

# --- rain (10 s) ---
d = 10; t = t_(d)
rain = bp(rng.standard_normal(len(t)), 900, 7000) * 0.5
drops = np.zeros(len(t))
for _ in range(1400):
    s = rng.integers(0, len(t) - 400)
    drops[s:s + 300] += rng.uniform(0.2, 1) * np.exp(-np.arange(300) / 30) * rng.standard_normal(300)
rain = rain + hp(drops, 1500) * 0.5
rain *= np.minimum(1, t / 0.8) * np.minimum(1, (d - t) / 1.2)
save("m_rain", rain, 0.55, stereo_width=1)

# --- wind gust (door open / jump) 3 s ---
d = 3; t = t_(d)
g = np.sin(np.pi * t / d) ** 1.5
wind = bp(rng.standard_normal(len(t)), 200, 2600) * g + lp(rng.standard_normal(len(t)), 180) * g * 0.6
save("m_wind", wind, 0.8, stereo_width=1)

# --- boom: sub hit with long tail ---
t = t_(1.2)
f = 70 * np.exp(-t * 3) + 32
boom = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 3.2) + 0.4 * lp(rng.standard_normal(len(t)), 600) * np.exp(-t * 14)
save("m_boom", reverb(boom, 2.8, 0.4), 0.95)

# --- riser: 2 s tension swell into a hit ---
d = 2.0; t = t_(d)
riser = bp(rng.standard_normal(len(t)), 400, 6000) * (t / d) ** 2.2 + 0.4 * np.sin(2 * np.pi * (200 + 500 * (t / d) ** 2) * t) * (t / d) ** 3
save("m_riser", riser, 0.6, stereo_width=1)

# --- typewriter key + stamp + paper ---
t = t_(0.05); save("m_key", hp(rng.standard_normal(len(t)), 2000) * np.exp(-t * 140) + 0.5 * np.sin(2 * np.pi * 180 * t) * np.exp(-t * 90), 0.6)
t = t_(0.35); save("m_stamp", lp(rng.standard_normal(len(t)), 1200) * np.exp(-t * 28) + np.sin(2 * np.pi * 90 * t) * np.exp(-t * 18), 0.9)
t = t_(0.5); save("m_paper", bp(rng.standard_normal(len(t)), 1500, 8000) * np.sin(np.pi * t / 0.5) ** 2 * (0.6 + 0.4 * np.sin(2 * np.pi * 23 * t)), 0.5)
# --- camera shutter / reveal sting ---
t = t_(0.9)
sting = sum(np.sin(2 * np.pi * fr * t) * a for fr, a in ((220, 1), (261.6, 0.7), (329.6, 0.5), (440, 0.3))) * np.exp(-t * 2.6)
save("m_sting", reverb(sting, 2.0, 0.35), 0.6)
print("ok", sorted(f for f in os.listdir(OUT) if f.startswith("m_")))
