from pathlib import Path
from shutil import copy2
from collections import deque

import numpy as np
from PIL import Image


GENERATED = Path(r"C:\Users\user\.codex\generated_images\019e5f39-9768-79e0-bc53-1a70c8bb7707")
PROJECT = Path(r"C:\Users\user\Downloads\0525原始\eatjoy-main\assets\food-research\forms")

SHEETS = {
    "onion_guard": "exec-ceb9bf21-c9cd-4e93-84a3-9c07d0a63b07.png",
    "popcorn": "exec-c1956c3e-10a4-4b31-98cb-778ccb56c81f.png",
    "healing_mushroom": "exec-f99d1f63-c0aa-4b0b-904a-1117375bdf1f.png",
    "garlic_knight": "exec-e09cd66c-6972-425f-88fa-ea774e83aacd.png",
    "chili_sprite": "exec-260fe3a2-1202-429d-aaa8-c47e5cd41f26.png",
    "lotus_archer": "exec-b0f6521a-ab7e-49b6-b88c-08cecdec00fb.png",
    "potato_armor": "exec-1abfc454-b461-47c9-8f8a-f646d3138425.png",
    "lemon_battery": "exec-1ce0ff08-61b6-4edd-9fd2-ad1eb272856e.png",
    "cheese_mage": "exec-1068a0bf-4a58-4cc3-af2a-96abd5f3af8c.png",
    "honey_priest": "exec-56b30299-3968-4b8f-b251-86330d60bbea.png",
    "coffee_pilot": "exec-9c80cc06-2024-4b64-b013-abd055c711db.png",
    "octopus_samurai": "exec-87f9a18a-a9f2-4ace-95fc-1dd3ed6f5a9e.png",
    "salmon_ronin": "exec-c9012fc6-ccc1-4375-bcdd-8345e3845482.png",
    "beef_berserker": "exec-ed6b018a-a89a-4f2a-bbe7-fd790870bde2.png",
    "puffer_alchemist": "exec-bb126094-f40a-42cf-aa59-324bec801667.png",
    "black_garlic_void": "exec-e1c7bad7-c7bc-4070-b3b7-befa266449fb.png",
    "lobster_general": "exec-1f4fc217-a1a7-4d2b-ab09-2a292cf923ba.png",
    "truffle_thunder": "exec-bef3a1d4-93d7-4340-b007-4ac627acf237.png",
    "dragonfruit_emperor": "exec-40de4091-80c1-4a90-9771-ca874faf6fe0.png",
    "peach_divine": "exec-b40720ce-905d-47a2-a82f-df323e89290a.png",
    "cocoa_popsicle_wargod": "exec-32afc848-83fa-497c-9ad2-80c47ab8e644.png",
}

TWO_TOP_FORMS = {
    "healing_mushroom",
    "chili_sprite",
    "potato_armor",
}


def remove_green(image: Image.Image) -> Image.Image:
    rgba = image.convert("RGBA")
    pixels = rgba.load()
    width, height = rgba.size
    background = bytearray(width * height)
    queue = deque()

    def is_green(x: int, y: int) -> bool:
        r, g, b, _ = pixels[x, y]
        return g > 28 and g > r + 16 and g > b + 10 and g > r * 1.2 and g > b * 1.12

    def seed(x: int, y: int) -> None:
        index = y * width + x
        if not background[index] and is_green(x, y):
            background[index] = 1
            queue.append((x, y))

    for x in range(width):
        seed(x, 0)
        seed(x, height - 1)
    for y in range(height):
        seed(0, y)
        seed(width - 1, y)

    while queue:
        x, y = queue.popleft()
        for nx, ny in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)):
            if 0 <= nx < width and 0 <= ny < height:
                index = ny * width + nx
                if not background[index] and is_green(nx, ny):
                    background[index] = 1
                    queue.append((nx, ny))

    for y in range(height):
        for x in range(width):
            if background[y * width + x]:
                r, g, b, _ = pixels[x, y]
                pixels[x, y] = (r, g, b, 0)
    return rgba


def trim_and_pad(image: Image.Image, size: int = 512) -> Image.Image:
    alpha = image.getchannel("A")
    bounds = alpha.getbbox()
    if not bounds:
        return Image.new("RGBA", (size, size), (0, 0, 0, 0))

    subject = image.crop(bounds)
    margin = max(20, round(max(subject.size) * 0.08))
    side = max(subject.width, subject.height) + margin * 2
    canvas = Image.new("RGBA", (side, side), (0, 0, 0, 0))
    canvas.alpha_composite(
        subject,
        ((side - subject.width) // 2, (side - subject.height) // 2),
    )
    return canvas.resize((size, size), Image.Resampling.NEAREST)


def find_valley(counts: np.ndarray, target: int, radius: int) -> int:
    start = max(1, target - radius)
    end = min(len(counts) - 1, target + radius + 1)
    window = counts[start:end]
    minimum = window.min()
    candidates = np.flatnonzero(window == minimum) + start
    return int(candidates[np.argmin(np.abs(candidates - target))])


def split_row(image: Image.Image, top: int, bottom: int, count: int) -> list[Image.Image]:
    alpha = np.asarray(image.getchannel("A"))[top:bottom]
    column_counts = np.count_nonzero(alpha, axis=0)
    width = image.width
    segment = width / count
    cuts = [0]
    for index in range(1, count):
        target = round(segment * index)
        cuts.append(find_valley(column_counts, target, max(16, round(segment * 0.28))))
    cuts.append(width)
    return [image.crop((cuts[index], top, cuts[index + 1], bottom)) for index in range(count)]


def extract_panels(image: Image.Image, two_top: bool) -> dict[str, Image.Image]:
    clean = remove_green(image)
    alpha = np.asarray(clean.getchannel("A"))
    row_counts = np.count_nonzero(alpha, axis=1)
    row_split = find_valley(row_counts, image.height // 2, max(20, image.height // 8))

    if two_top:
        top_names = ("front", "back")
        bottom_names = ("passive", "skill1", "skill2")
        bottom_panels = split_row(clean, row_split, image.height, 3)
    else:
        top_names = ("front", "back", "passive")
        bottom_names = ("skill1", "skill2")
        # Most generated sheets keep a blank third cell at bottom-right.
        bottom_panels = split_row(clean, row_split, image.height, 3)[:2]

    panels = split_row(clean, 0, row_split, len(top_names))
    panels += bottom_panels
    return {
        name: trim_and_pad(panel)
        for name, panel in zip(top_names + bottom_names, panels)
    }


def main() -> None:
    PROJECT.mkdir(parents=True, exist_ok=True)
    (PROJECT / "sheets").mkdir(parents=True, exist_ok=True)
    for form_id, filename in SHEETS.items():
        source = GENERATED / filename
        if not source.exists():
            raise FileNotFoundError(source)
        sheet_target = PROJECT / "sheets" / f"{form_id}-sheet.png"
        copy2(source, sheet_target)
        sheet = Image.open(source).convert("RGBA")
        panels = extract_panels(sheet, form_id in TWO_TOP_FORMS)
        for suffix, panel in panels.items():
            panel.save(PROJECT / f"{form_id}-{suffix}.png", optimize=True)
    preview = Image.new("RGBA", (6 * 192, 7 * 224), (22, 27, 34, 255))
    for index, form_id in enumerate(SHEETS):
        column = (index % 3) * 2
        row = index // 3
        for offset, suffix in enumerate(("front", "back")):
            art = Image.open(PROJECT / f"{form_id}-{suffix}.png").convert("RGBA")
            art.thumbnail((176, 176), Image.Resampling.NEAREST)
            x = (column + offset) * 192 + (192 - art.width) // 2
            y = row * 224 + 8
            preview.alpha_composite(art, (x, y))
    preview.save(PROJECT / "forms-front-back-preview.png", optimize=True)

    skill_preview = Image.new("RGBA", (9 * 128, 7 * 144), (22, 27, 34, 255))
    for index, form_id in enumerate(SHEETS):
        group_column = (index % 3) * 3
        row = index // 3
        for offset, suffix in enumerate(("passive", "skill1", "skill2")):
            art = Image.open(PROJECT / f"{form_id}-{suffix}.png").convert("RGBA")
            art.thumbnail((116, 116), Image.Resampling.NEAREST)
            x = (group_column + offset) * 128 + (128 - art.width) // 2
            y = row * 144 + 8
            skill_preview.alpha_composite(art, (x, y))
    skill_preview.save(PROJECT / "forms-skill-preview.png", optimize=True)
    print(f"Processed {len(SHEETS)} form sheets into {len(SHEETS) * 5} transparent assets")


if __name__ == "__main__":
    main()
