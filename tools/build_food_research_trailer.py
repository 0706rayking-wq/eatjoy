from __future__ import annotations

import math
import shutil
import subprocess
import wave
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageEnhance, ImageFilter, ImageFont


ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = ROOT / "output" / "trailer"
GAME_DIR = OUT_DIR / "combat"
QUIZ_DIR = OUT_DIR / "quiz"
ASSET_DIR = ROOT / "assets" / "food-research"
MAP_DIR = ASSET_DIR / "maps"

W, H = 720, 1280
FPS = 24
DURATION = 30

FONT_REGULAR = Path("C:/Windows/Fonts/msjh.ttc")
FONT_BOLD = Path("C:/Windows/Fonts/msjhbd.ttc")


def font(size: int, bold: bool = True) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(str(FONT_BOLD if bold else FONT_REGULAR), size)


def cover(img: Image.Image, size: tuple[int, int], zoom: float = 1.0) -> Image.Image:
    tw, th = size
    scale = max(tw / img.width, th / img.height) * zoom
    resized = img.resize((round(img.width * scale), round(img.height * scale)), Image.Resampling.LANCZOS)
    left = max(0, (resized.width - tw) // 2)
    top = max(0, (resized.height - th) // 2)
    return resized.crop((left, top, left + tw, top + th))


def contain(img: Image.Image, size: tuple[int, int]) -> Image.Image:
    scale = min(size[0] / img.width, size[1] / img.height)
    return img.resize((round(img.width * scale), round(img.height * scale)), Image.Resampling.LANCZOS)


def grade(img: Image.Image, brightness: float = 0.75, color: float = 1.12) -> Image.Image:
    img = ImageEnhance.Brightness(img).enhance(brightness)
    return ImageEnhance.Color(img).enhance(color)


def text_center(
    canvas: Image.Image,
    text: str,
    y: int,
    size: int,
    fill: tuple[int, int, int] = (255, 255, 255),
    stroke: tuple[int, int, int] = (18, 12, 8),
    stroke_width: int = 3,
) -> None:
    draw = ImageDraw.Draw(canvas)
    fnt = font(size)
    box = draw.textbbox((0, 0), text, font=fnt, stroke_width=stroke_width)
    x = (W - (box[2] - box[0])) // 2
    draw.text((x, y), text, font=fnt, fill=fill, stroke_width=stroke_width, stroke_fill=stroke)


def panel(canvas: Image.Image, box: tuple[int, int, int, int], fill=(16, 12, 10, 205), outline=(245, 158, 11, 220), radius=28):
    overlay = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    draw.rounded_rectangle(box, radius=radius, fill=fill, outline=outline, width=3)
    canvas.alpha_composite(overlay)


def load_sequence(folder: Path) -> list[Image.Image]:
    return [Image.open(path).convert("RGB") for path in sorted(folder.glob("frame-*.png"))]


hero = Image.open(ASSET_DIR / "hero-normal-portrait.png").convert("RGBA")
camp = Image.open(ASSET_DIR / "camp" / "camp-map-rpg.png").convert("RGB")
thunder = Image.open(MAP_DIR / "thunder-realm.png").convert("RGB")
map_images = [
    Image.open(MAP_DIR / name).convert("RGB")
    for name in ["sweet-amusement-park.png", "meat-factory-25d.png", "toxic-garden.png", "thunder-realm.png"]
]
enemy_preview = Image.open(ASSET_DIR / "enemy-map-sheets-preview.png").convert("RGBA")
game_frames = load_sequence(GAME_DIR)
quiz_frames = load_sequence(QUIZ_DIR)


def frame_at(t: float) -> Image.Image:
    canvas = Image.new("RGBA", (W, H), (12, 10, 18, 255))

    if t < 3:
        z = 1.02 + t * 0.025
        bg = grade(cover(thunder, (W, H), z), 0.48, 1.2).convert("RGBA")
        canvas.alpha_composite(bg)
        hero_img = contain(hero, (470, 470))
        hero_y = 575 + round(math.sin(t * 4) * 9)
        canvas.alpha_composite(hero_img, ((W - hero_img.width) // 2, hero_y))
        text_center(canvas, "食研所", 135, 82, (255, 236, 176), (63, 35, 16), 5)
        text_center(canvas, "爆 食 戰 線", 235, 47, (255, 255, 255), (126, 34, 18), 4)
        panel(canvas, (88, 365, 632, 470), (20, 13, 9, 215), (251, 191, 36, 230), 24)
        text_center(canvas, "射擊遊戲  ×  食材知識王", 391, 31, (255, 228, 140), (30, 16, 8), 2)
        if t > 1.85:
            text_center(canvas, "知識，是你帶回戰利品的最後一發", 1082, 24, (235, 242, 255), (20, 20, 35), 2)

    elif t < 6:
        local = t - 3
        bg = grade(cover(camp, (W, H), 1.02 + local * 0.015), 0.55, 1.08).convert("RGBA")
        canvas.alpha_composite(bg)
        panel(canvas, (56, 80, 664, 245), (14, 17, 25, 218), (251, 191, 36, 220), 28)
        text_center(canvas, "從營地出發", 112, 48, (255, 238, 190), (30, 20, 12), 3)
        text_center(canvas, "最多 11 關・每次隨機", 181, 27, (226, 232, 240), (20, 20, 30), 2)
        thumb_y = 810
        for i, m in enumerate(map_images[:3]):
            tile = cover(m, (190, 260), 1.06)
            x = 55 + i * 205 + round((1 - min(1, local * 1.4)) * 40)
            canvas.alpha_composite(tile.convert("RGBA"), (x, thumb_y + (i % 2) * 28))
        text_center(canvas, "11 座異境  全部都會輪到", 1130, 29, (255, 244, 205), (30, 20, 12), 2)

    elif t < 16:
        local = t - 6
        idx = min(len(game_frames) - 1, int(local / 10 * len(game_frames)))
        game = cover(game_frames[idx], (W, H), 1.0).convert("RGBA")
        canvas.alpha_composite(game)
        top = Image.new("RGBA", (W, 170), (9, 10, 18, 185))
        canvas.alpha_composite(top, (0, 0))
        if local < 3:
            text_center(canvas, "移動・射擊・技能連攜", 45, 36, (255, 240, 192), (50, 24, 10), 3)
            text_center(canvas, "彈幕中殺出一條生路", 100, 25, (228, 235, 255), (20, 20, 30), 2)
        elif local > 6.4:
            text_center(canvas, "雷霆之境", 43, 42, (255, 230, 95), (56, 24, 15), 3)
            text_center(canvas, "最終 BOSS 固定壓軸", 103, 25, (255, 255, 255), (25, 20, 35), 2)

    elif t < 20:
        local = t - 16
        bg = grade(cover(thunder, (W, H), 1.08), 0.36, 1.22).convert("RGBA")
        canvas.alpha_composite(bg)
        text_center(canvas, "每一局，都不一樣", 85, 52, (255, 238, 180), (58, 29, 12), 4)
        text_center(canvas, "11 座場地・敵人與機關輪替", 160, 27, (230, 235, 255), (20, 20, 30), 2)
        for i, m in enumerate(map_images):
            tile = cover(m, (286, 340), 1.08)
            x = 62 + (i % 2) * 310
            y = 260 + (i // 2) * 365
            canvas.alpha_composite(tile.convert("RGBA"), (x, y))
        if local > 2.0:
            preview = contain(enemy_preview, (600, 230))
            canvas.alpha_composite(preview, ((W - preview.width) // 2, 1015))
            text_center(canvas, "雷霆之境  永遠是最後一關", 1200, 25, (255, 231, 112), (40, 18, 10), 2)

    elif t < 25:
        local = t - 20
        idx = min(len(quiz_frames) - 1, int(local / 5 * len(quiz_frames)))
        quiz = cover(quiz_frames[idx], (W, H), 1.0).convert("RGBA")
        canvas.alpha_composite(quiz)
        banner = Image.new("RGBA", (W, 150), (33, 13, 10, 220))
        canvas.alpha_composite(banner, (0, 0))
        text_center(canvas, "陣亡，不代表結束", 34, 42, (255, 231, 150), (60, 25, 12), 3)
        text_center(canvas, "食材知識決定你的戰利品", 94, 25, (255, 255, 255), (30, 18, 18), 2)

    elif t < 27:
        quiz = grade(cover(quiz_frames[-1], (W, H), 1.0), 0.36, 0.9).filter(ImageFilter.GaussianBlur(5)).convert("RGBA")
        canvas.alpha_composite(quiz)
        panel(canvas, (55, 205, 665, 550), (13, 45, 34, 225), (74, 222, 128, 240), 34)
        text_center(canvas, "答對 5 題", 270, 58, (134, 239, 172), (10, 45, 30), 4)
        text_center(canvas, "帶回金幣與裝備", 372, 35, (255, 255, 255), (15, 40, 30), 2)
        panel(canvas, (55, 640, 665, 985), (67, 18, 20, 225), (248, 113, 113, 240), 34)
        text_center(canvas, "答錯 3 題", 705, 58, (254, 202, 202), (70, 15, 18), 4)
        text_center(canvas, "本次戰利品全部遺失", 807, 35, (255, 255, 255), (55, 15, 18), 2)

    else:
        local = t - 27
        bg = grade(cover(thunder, (W, H), 1.02 + local * 0.03), 0.42, 1.18).convert("RGBA")
        canvas.alpha_composite(bg)
        hero_img = contain(hero, (430, 430))
        canvas.alpha_composite(hero_img, ((W - hero_img.width) // 2, 615 + round(math.sin(local * 5) * 7)))
        text_center(canvas, "食研所・爆食戰線", 145, 52, (255, 238, 181), (57, 28, 12), 4)
        text_center(canvas, "射擊遊戲 × 食材知識王", 230, 29, (238, 244, 255), (25, 22, 35), 2)
        panel(canvas, (80, 355, 640, 545), (42, 13, 10, 225), (251, 191, 36, 245), 34)
        text_center(canvas, "8/1", 375, 86, (255, 227, 112), (75, 28, 12), 5)
        text_center(canvas, "正式上線", 476, 38, (255, 255, 255), (55, 20, 15), 3)
        text_center(canvas, "廚務系統・限時活動", 1125, 27, (237, 242, 255), (20, 20, 32), 2)

    return canvas.convert("RGB")


def make_soundtrack(path: Path) -> None:
    sr = 44100
    total = sr * DURATION
    audio = np.zeros(total, dtype=np.float64)
    timeline = np.arange(total) / sr
    notes = [110.0, 130.81, 146.83, 164.81, 196.0, 164.81, 146.83, 130.81]

    for beat in np.arange(0, DURATION, 0.5):
        start = int(beat * sr)
        length = min(int(0.22 * sr), total - start)
        x = np.arange(length) / sr
        kick = np.sin(2 * np.pi * (72 - 30 * x) * x) * np.exp(-16 * x)
        audio[start:start + length] += 0.42 * kick

    rng = np.random.default_rng(81)
    for beat in np.arange(0.5, DURATION, 1.0):
        start = int(beat * sr)
        length = min(int(0.12 * sr), total - start)
        x = np.arange(length) / sr
        audio[start:start + length] += 0.11 * rng.normal(0, 1, length) * np.exp(-25 * x)

    for i, beat in enumerate(np.arange(0, DURATION, 0.25)):
        start = int(beat * sr)
        length = min(int(0.23 * sr), total - start)
        x = np.arange(length) / sr
        freq = notes[i % len(notes)] * (2 if beat >= 20 else 1)
        tone = (np.sin(2 * np.pi * freq * x) + 0.35 * np.sin(2 * np.pi * freq * 2 * x))
        audio[start:start + length] += 0.07 * tone * np.exp(-8 * x)

    for transition in [3, 6, 16, 20, 25, 27]:
        start = int(transition * sr)
        length = min(int(0.65 * sr), total - start)
        x = np.arange(length) / sr
        sweep = np.sin(2 * np.pi * (120 + 900 * x * x) * x) * np.exp(-4 * x)
        audio[start:start + length] += 0.24 * sweep

    rise_start = int(27 * sr)
    x = timeline[rise_start:] - 27
    audio[rise_start:] += 0.12 * np.sin(2 * np.pi * (180 + 75 * x) * x) * np.minimum(1, x / 1.5)
    audio *= 0.88 / max(1e-6, np.max(np.abs(audio)))
    stereo = np.column_stack([audio, audio])
    pcm = (stereo * 32767).astype(np.int16)
    with wave.open(str(path), "wb") as wav:
        wav.setnchannels(2)
        wav.setsampwidth(2)
        wav.setframerate(sr)
        wav.writeframes(pcm.tobytes())


def main() -> None:
    if not game_frames or not quiz_frames:
        raise RuntimeError("Gameplay or quiz frames are missing")
    ffmpeg = shutil.which("ffmpeg")
    if not ffmpeg:
        raise RuntimeError("ffmpeg was not found")

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    silent = OUT_DIR / "food-research-trailer-silent.mp4"
    audio = OUT_DIR / "food-research-trailer-soundtrack.wav"
    final = OUT_DIR / "food-research-8-1-trailer-30s.mp4"

    encoder = subprocess.Popen(
        [
            ffmpeg, "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}",
            "-r", str(FPS), "-i", "-", "-an", "-c:v", "libx264", "-preset", "veryfast",
            "-crf", "18", "-pix_fmt", "yuv420p", str(silent),
        ],
        stdin=subprocess.PIPE,
    )
    assert encoder.stdin is not None
    for index in range(FPS * DURATION):
        encoder.stdin.write(frame_at(index / FPS).tobytes())
    encoder.stdin.close()
    if encoder.wait() != 0:
        raise RuntimeError("Video encoding failed")

    make_soundtrack(audio)
    subprocess.run(
        [
            ffmpeg, "-y", "-i", str(silent), "-i", str(audio),
            "-vf", "scale=1080:1920:flags=lanczos", "-c:v", "libx264", "-preset", "medium",
            "-crf", "18", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "192k",
            "-shortest", "-movflags", "+faststart", str(final),
        ],
        check=True,
    )
    print(final)


if __name__ == "__main__":
    main()
