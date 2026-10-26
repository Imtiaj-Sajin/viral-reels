"""Synthesize a small royalty-free SFX kit into engine/public/sfx (48 kHz mono WAV)."""
import os, sys
import numpy as np
import soundfile as sf

SR = 48000
OUT = sys.argv[1]
os.makedirs(OUT, exist_ok=True)
rng = np.random.default_rng(7)


def t(d):
    return np.arange(int(d * SR)) / SR


def env(n, a=0.005, r=0.1):
    e = np.ones(n)
    na, nr = int(a * SR), int(r * SR)
    e[:na] = np.linspace(0, 1, na)
    e[-nr:] *= np.linspace(1, 0, nr) ** 2
    return e


def lowpass(x, cut):
    """one-pole lowpass with per-sample cutoff (Hz)"""
    y = np.zeros_like(x)
    acc = 0.0
    cut = np.broadcast_to(cut, x.shape)
    for i in range(len(x)):
        a = 1 - np.exp(-2 * np.pi * cut[i] / SR)
        acc += a * (x[i] - acc)
        y[i] = acc
    return y


def save(name, x, peak=0.8):
    x = x / (np.max(np.abs(x)) + 1e-9) * peak
    sf.write(os.path.join(OUT, name + ".wav"), x.astype(np.float32), SR)


# whoosh: noise sweeping up then down
d = 0.42; tt = t(d); n = len(tt)
shape = np.sin(np.pi * tt / d) ** 2
x = lowpass(rng.standard_normal(n), 300 + 5200 * shape) * shape
save("whoosh", x - lowpass(x, 150), 0.7)

# pop: quick pitch drop
tt = t(0.09); f = 950 * np.exp(-tt * 18) + 380
save("pop", np.sin(2 * np.pi * np.cumsum(f) / SR) * env(len(tt), 0.002, 0.06), 0.7)

# ding: bright bell
tt = t(0.9)
x = sum(a * np.sin(2 * np.pi * fr * tt) for fr, a in ((1318.5, 1), (1975.5, 0.45), (2637, 0.25)))
save("ding", x * np.exp(-tt * 5.5) * env(len(tt), 0.002, 0.2), 0.6)

# tick: tiny keyboard click
tt = t(0.025)
save("tick", lowpass(rng.standard_normal(len(tt)), 6000) * np.exp(-tt * 260), 0.5)

# thud: stamp impact
tt = t(0.32); f = 140 * np.exp(-tt * 9) + 45
x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 12) + 0.35 * lowpass(rng.standard_normal(len(tt)), 900) * np.exp(-tt * 30)
save("thud", x, 0.9)

# beep-beep: low battery warning
seg = []
for k in range(2):
    tt = t(0.11)
    seg.append(np.sign(np.sin(2 * np.pi * 880 * tt)) * 0.5 * env(len(tt), 0.003, 0.02))
    seg.append(np.zeros(int(0.07 * SR)))
save("beep", lowpass(np.concatenate(seg), 3500), 0.45)

# check: two-tone confirm
tt = t(0.16)
x = np.concatenate([np.sin(2 * np.pi * 880 * t(0.07)), np.sin(2 * np.pi * 1320 * tt)])
save("check", x * env(len(x), 0.003, 0.08), 0.55)

# send: rising swoosh
d = 0.55; tt = t(d); n = len(tt)
shape = (tt / d) ** 1.5 * np.sin(np.pi * tt / d)
x = lowpass(rng.standard_normal(n), 600 + 7000 * (tt / d)) * shape
save("send", x - lowpass(x, 200), 0.7)
print("sfx:", sorted(os.listdir(OUT)))
