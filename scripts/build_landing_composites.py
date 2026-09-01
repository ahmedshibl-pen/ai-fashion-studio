import argparse
from pathlib import Path

import cv2
import numpy as np
from PIL import Image


ALIGNMENT_OFFSET = 697
SCENE_HEIGHT = 2200
MOBILE_LEFT = 596
MOBILE_RIGHT = 1076


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Build the desktop and mobile landing-scene composites."
    )
    parser.add_argument("main", type=Path, help="Path to the primary landing image")
    parser.add_argument("floor", type=Path, help="Path to the parquet continuation")
    parser.add_argument(
        "--output-dir",
        type=Path,
        default=Path("public/images/landing"),
        help="Destination directory (default: public/images/landing)",
    )
    parser.add_argument("--alignment-offset", type=int, default=ALIGNMENT_OFFSET)
    parser.add_argument("--scene-height", type=int, default=SCENE_HEIGHT)
    parser.add_argument("--mobile-left", type=int, default=MOBILE_LEFT)
    parser.add_argument("--mobile-right", type=int, default=MOBILE_RIGHT)
    return parser.parse_args()


def build_pyramids(image: np.ndarray, levels: int) -> tuple[list[np.ndarray], list[np.ndarray]]:
    gaussian = [image]
    for _ in range(levels):
        gaussian.append(cv2.pyrDown(gaussian[-1]))
    laplacian = []
    for level in range(levels):
        expanded = cv2.pyrUp(
            gaussian[level + 1],
            dstsize=(gaussian[level].shape[1], gaussian[level].shape[0]),
        )
        laplacian.append(gaussian[level] - expanded)
    laplacian.append(gaussian[-1])
    return gaussian, laplacian


def multiband_blend(first: np.ndarray, second: np.ndarray, mask: np.ndarray) -> np.ndarray:
    levels = 6
    mask_gaussian, _ = build_pyramids(mask, levels)
    _, first_laplacian = build_pyramids(first, levels)
    _, second_laplacian = build_pyramids(second, levels)
    blended_levels = []
    for first_level, second_level, mask_level in zip(
        first_laplacian, second_laplacian, mask_gaussian
    ):
        blended_levels.append(
            first_level * mask_level + second_level * (1.0 - mask_level)
        )
    result = blended_levels[-1]
    for level in range(levels - 1, -1, -1):
        result = cv2.pyrUp(
            result,
            dstsize=(blended_levels[level].shape[1], blended_levels[level].shape[0]),
        )
        result += blended_levels[level]
    return np.clip(result, 0.0, 1.0)


def match_overlap_illumination(
    main: np.ndarray, floor: np.ndarray, alignment_offset: int
) -> np.ndarray:
    overlap_height = main.shape[0] - alignment_offset
    main_overlap = main[alignment_offset:]
    floor_overlap = floor[:overlap_height]
    main_low = cv2.GaussianBlur(main_overlap, (0, 0), sigmaX=42, sigmaY=42)
    floor_low = cv2.GaussianBlur(floor_overlap, (0, 0), sigmaX=42, sigmaY=42)
    delta = np.clip(main_low - floor_low, -0.10, 0.10)

    correction = np.zeros_like(floor)
    correction[:overlap_height] = delta
    tail = 360
    last_delta = delta[-1]
    for row in range(overlap_height, min(floor.shape[0], overlap_height + tail)):
        progress = (row - overlap_height) / tail
        correction[row] = last_delta * (1.0 - progress) ** 2
    return np.clip(floor + correction, 0.0, 1.0)


def append_dark_falloff(scene: np.ndarray, target_height: int) -> np.ndarray:
    if scene.shape[0] >= target_height:
        return scene[:target_height]
    extra_height = target_height - scene.shape[0]
    dark = np.array([0x12, 0x0C, 0x08], dtype=np.float32) / 255.0
    extended = cv2.copyMakeBorder(
        scene,
        0,
        extra_height,
        0,
        0,
        cv2.BORDER_REFLECT_101,
    )
    transition_start = scene.shape[0] - 110
    progress = np.clip(
        (np.arange(target_height, dtype=np.float32) - transition_start)
        / (target_height - transition_start),
        0.0,
        1.0,
    )
    eased = progress * progress * (3.0 - 2.0 * progress)
    return extended * (1.0 - eased[:, None, None]) + dark * eased[:, None, None]


def save_webp(image: np.ndarray, path: Path) -> None:
    rgb = np.clip(image[:, :, ::-1] * 255.0 + 0.5, 0, 255).astype(np.uint8)
    Image.fromarray(rgb, mode="RGB").save(
        path,
        format="WEBP",
        quality=92,
        method=6,
        exact=True,
    )


def build_composites(arguments: argparse.Namespace) -> None:
    main_image = cv2.imread(str(arguments.main), cv2.IMREAD_COLOR)
    floor_image = cv2.imread(str(arguments.floor), cv2.IMREAD_COLOR)
    if main_image is None or floor_image is None:
        raise FileNotFoundError("The two supplied PNG files are required.")
    if main_image.shape != floor_image.shape:
        raise ValueError("The source images must remain at the same scale.")
    if not 0 < arguments.alignment_offset < main_image.shape[0]:
        raise ValueError("The alignment offset must fall inside the source image.")
    if arguments.scene_height <= main_image.shape[0]:
        raise ValueError("The scene height must be taller than the primary image.")
    if not 0 <= arguments.mobile_left < arguments.mobile_right <= main_image.shape[1]:
        raise ValueError("The mobile crop must fall inside the source width.")

    main_float = main_image.astype(np.float32) / 255.0
    floor_float = floor_image.astype(np.float32) / 255.0
    floor_matched = match_overlap_illumination(
        main_float, floor_float, arguments.alignment_offset
    )

    height = arguments.alignment_offset + floor_image.shape[0]
    width = main_image.shape[1]
    first = np.zeros((height, width, 3), dtype=np.float32)
    second = np.zeros_like(first)
    first[: main_image.shape[0]] = main_float
    first[main_image.shape[0] :] = floor_matched[
        main_image.shape[0] - arguments.alignment_offset :
    ]
    second[: arguments.alignment_offset] = main_float[: arguments.alignment_offset]
    second[arguments.alignment_offset :] = floor_matched

    x = np.arange(width, dtype=np.float32)
    protected_left = 28.0 * np.exp(-0.5 * ((x - 275.0) / 220.0) ** 2)
    gentle_variation = 5.0 * np.sin(x / 165.0)
    seam_in_overlap = 142.0 + protected_left + gentle_variation
    seam = arguments.alignment_offset + seam_in_overlap
    y = np.arange(height, dtype=np.float32)[:, None]
    hard_mask = (y <= seam[None, :]).astype(np.float32)
    mask = np.repeat(hard_mask[:, :, None], 3, axis=2)

    merged = multiband_blend(first, second, mask)
    extended = append_dark_falloff(merged, arguments.scene_height)
    mobile = extended[:, arguments.mobile_left : arguments.mobile_right]

    arguments.output_dir.mkdir(parents=True, exist_ok=True)
    desktop_path = arguments.output_dir / "studio-parquet-scene.webp"
    mobile_path = arguments.output_dir / "studio-parquet-scene-mobile.webp"
    save_webp(extended, desktop_path)
    save_webp(mobile, mobile_path)

    print(
        f"desktop: {extended.shape[1]}x{extended.shape[0]} -> "
        f"{desktop_path} ({desktop_path.stat().st_size} bytes)"
    )
    print(
        f"mobile: {mobile.shape[1]}x{mobile.shape[0]} -> "
        f"{mobile_path} ({mobile_path.stat().st_size} bytes)"
    )
    print(
        f"alignment: floor starts at main y={arguments.alignment_offset}; "
        "six-level multiband feathering"
    )


if __name__ == "__main__":
    build_composites(parse_args())
