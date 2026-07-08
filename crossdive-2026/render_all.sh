#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
export FFMPEG="$(python3 -c 'import imageio_ffmpeg;print(imageio_ffmpeg.get_ffmpeg_exe())')"
FPS="${1:-30}"
python3 build.py
echo "== master =="   ; node capture.mjs master    "$FPS"
echo "== subtitled ==" ; node capture.mjs subtitled "$FPS"
echo "== cut15 =="     ; node capture.mjs cut15     "$FPS"
# Silent feed-autoplay version == master (film carries no audio track); publish as its own file.
cp -f out/crossdive-2026_master.mp4 out/crossdive-2026_silent.mp4
echo "== ALL DONE =="
ls -la out/
