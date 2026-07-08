# CrossDive 2026 — A Foresight Film

A restrained, editorial 9:16 motion film for **CrossDive 2026**, Turian Labs' annual
foresight summit. Built as a single self-contained HTML file — real hex colors, Anton
hero display, one signal orange, frame-accurate typographic reveals — that plays in the
browser and renders deterministically to H.264 MP4.

> Dark cinematic canvas · sharp typographic reveals · precise geometric motion.
> Carried by typography and negative space, not effects.

## What's here

| File | Purpose |
|------|---------|
| `film.html` | **The film** — self-contained, fonts embedded as base64. Open in any browser. |
| `film.template.html` | Editable source. Fonts are injected at build time. |
| `build.py` | Embeds `fonts/*.woff2` into the template → `film.html`. |
| `capture.mjs` | Renders a variant to MP4 by seeking every frame (Playwright + ffmpeg). |
| `render_all.sh` | Builds + renders all four deliverables into `out/`. |
| `fonts/` | `anton-latin.woff2` (hero display) + `inter-latin.woff2` (Google Sans stand-in). |
| `out/` | Rendered MP4 deliverables (generated). |

## View it

Open `film.html` in a browser. A transport bar (play/pause, scrub, **CC**) sits at the
bottom — hidden automatically during MP4 capture.

**URL parameters**

| Param | Effect |
|-------|--------|
| `?captions=1` | Burned-in lower-third VO subtitles (respects the 300px bottom safe area). |
| `?cut=15` | 15-second retargeting cutdown (brand → theme titles → CTA). |
| `?hud=0` | Hide the transport bar. |

Keyboard: **Space** play/pause · **← / →** step one frame.

## Render the MP4s

```bash
./render_all.sh 30      # 30fps (use 60 for smoother type; ~2× render time)
```

Produces in `out/`:

- `crossdive-2026_master.mp4` — 54s master (silent — the film carries no audio track)
- `crossdive-2026_silent.mp4` — feed-autoplay copy of the master
- `crossdive-2026_subtitled.mp4` — burned-in captions
- `crossdive-2026_cutdown-15s.mp4` — 15s retargeting cut

Encoding is H.264 / yuv420p / CRF 15, `+faststart`, 1080×1920. The render seeks the film
frame-by-frame (`window.__seek(sec)`), so output is deterministic — no realtime capture jitter.

Requires Playwright (Chromium) and an ffmpeg with libx264. If the system ffmpeg lacks
x264, `render_all.sh` uses the static build from `pip install imageio-ffmpeg`.

## Design system

Matches the CrossDive emailer.

- **Background** `#0A0A0A` · **Signal orange** `#FF5A1F` · **Ink** `#FAFAFA` · **Grey** `#8A8A8A` · **Stroke** `#2A2A2A`
- **Anton** — all-caps hero display (headlines, theme names, on-screen beats)
- **Google Sans** — supporting copy, labels, captions. *Substituted here with **Inter*** (a
  near-identical geometric grotesque); Google Sans is not openly licensed. Swap
  `fonts/inter-latin.woff2` for a licensed Google Sans woff2 and rebuild to match exactly.
- Orange dash marks precede micro labels · 1px outlined pills & cards · faint grain + vignette
- Easing `cubic-bezier(0.22, 1, 0.36, 1)` (quartOut) · hard cuts, no crossfades

## Scene map (54s)

| # | Time | Beat |
|---|------|------|
| 1 | 0:00–0:05 | Cold open → `EXTREMES ARE THE NEW NORMAL` |
| 2 | 0:05–0:14 | Four pressures (stroke-drawn glyphs, `TECH > INSTITUTIONS` …) |
| 3 | 0:14–0:19 | Pivot — `NOT BY ~~PREDICTING~~ · BY STRESS-TESTING IT.` |
| 4 | 0:19–0:24 | `FORESIGHT IS THE NEW STRATEGY` |
| 5 | 0:24–0:29 | CROSSDIVE brand reveal |
| 6 | 0:29–0:40 | Four themes (stacked cards) |
| 7 | 0:40–0:45 | `TWO DAYS. / ONE ROOM. / SIGNALS. SHIFTS. STRATEGIC CHOICES.` |
| 8 | 0:45–0:49 | Pune International Centre · 22–23 October 2026 |
| 9 | 0:49–0:54 | CTA — Early Bird ₹9,000 · REGISTER NOW → · crossdive.in |

## Audio

The film is intentionally silent — sound design (ambient drone, reveal ticks, sub-bass
thuds, transition swells) and voiceover per the brief are laid on in post over the master.
Caption timings in `film.html` (`CAPTIONS[]`) double as a VO cue sheet.
