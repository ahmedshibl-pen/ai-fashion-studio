import argparse
from pathlib import Path

import cv2
import numpy as np


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Compare a landing scene and its parquet continuation."
    )
    parser.add_argument("main", type=Path, help="Path to the primary landing image")
    parser.add_argument("floor", type=Path, help="Path to the parquet continuation")
    return parser.parse_args()


def describe_alignment(main_path: Path, floor_path: Path) -> None:
    main = cv2.imread(str(main_path), cv2.IMREAD_COLOR)
    floor = cv2.imread(str(floor_path), cv2.IMREAD_COLOR)
    if main is None or floor is None:
        raise FileNotFoundError("Both supplied source images are required.")

    main_gray = cv2.cvtColor(main, cv2.COLOR_BGR2GRAY)
    floor_gray = cv2.cvtColor(floor, cv2.COLOR_BGR2GRAY)

    main_y = 620
    floor_height = 430
    main_roi = main_gray[main_y:]
    floor_roi = floor_gray[:floor_height]

    sift = cv2.SIFT_create(nfeatures=12000, contrastThreshold=0.02)
    main_keypoints, main_descriptors = sift.detectAndCompute(main_roi, None)
    floor_keypoints, floor_descriptors = sift.detectAndCompute(floor_roi, None)

    if main_descriptors is None or floor_descriptors is None:
        print("insufficient local features for descriptor matching")
        return

    matcher = cv2.BFMatcher(cv2.NORM_L2)
    candidates = matcher.knnMatch(main_descriptors, floor_descriptors, k=2)
    good = [first for first, second in candidates if first.distance < 0.72 * second.distance]

    print(f"main size: {main.shape[1]}x{main.shape[0]}")
    print(f"floor size: {floor.shape[1]}x{floor.shape[0]}")
    print(f"keypoints: main={len(main_keypoints)}, floor={len(floor_keypoints)}")
    print(f"ratio-test matches: {len(good)}")

    if len(good) < 8:
        print("insufficient repeatable local features for a reliable homography")
        return

    main_points = np.float32(
        [[main_keypoints[match.queryIdx].pt[0], main_keypoints[match.queryIdx].pt[1] + main_y] for match in good]
    )
    floor_points = np.float32(
        [floor_keypoints[match.trainIdx].pt for match in good]
    )
    homography, mask = cv2.findHomography(floor_points, main_points, cv2.RANSAC, 4.0)
    inliers = int(mask.sum()) if mask is not None else 0
    print(f"RANSAC inliers: {inliers}/{len(good)}")
    if homography is not None:
        print("floor-to-main homography:")
        print(np.array2string(homography, precision=6, suppress_small=True))

        sample = np.float32(
            [[[0, 0]], [[floor.shape[1] - 1, 0]], [[floor.shape[1] // 2, 0]], [[floor.shape[1] // 2, 268]]]
        )
        mapped = cv2.perspectiveTransform(sample, homography).reshape(-1, 2)
        print("mapped floor points in main coordinates:")
        for source, target in zip(sample.reshape(-1, 2), mapped):
            print(f"  {tuple(source.astype(int))} -> ({target[0]:.2f}, {target[1]:.2f})")

    if mask is not None:
        inlier_main = main_points[mask.ravel().astype(bool)]
        inlier_floor = floor_points[mask.ravel().astype(bool)]
        if len(inlier_main):
            deltas = inlier_main - inlier_floor
            print(
                "inlier median translation without perspective: "
                f"dx={np.median(deltas[:, 0]):.2f}, dy={np.median(deltas[:, 1]):.2f}"
            )
            print(
                "inlier coordinate ranges: "
                f"main y={inlier_main[:, 1].min():.1f}..{inlier_main[:, 1].max():.1f}, "
                f"floor y={inlier_floor[:, 1].min():.1f}..{inlier_floor[:, 1].max():.1f}"
            )

    # The files are distinct renders, so local features may not repeat. Estimate the
    # vertical relationship from low-frequency illumination and edge-density profiles.
    def row_features(image: np.ndarray) -> np.ndarray:
        lab = cv2.cvtColor(image, cv2.COLOR_BGR2LAB).astype(np.float32)
        luminance = lab[:, :, 0]
        chroma_a = lab[:, :, 1]
        chroma_b = lab[:, :, 2]
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY).astype(np.float32)
        gradient = np.abs(cv2.Sobel(gray, cv2.CV_32F, 0, 1, ksize=3))
        center = slice(160, image.shape[1] - 160)
        features = np.column_stack(
            [
                luminance[:, center].mean(axis=1),
                chroma_a[:, center].mean(axis=1),
                chroma_b[:, center].mean(axis=1),
                gradient[:, center].mean(axis=1),
            ]
        )
        return cv2.GaussianBlur(features, (1, 41), 0)

    main_features = row_features(main)
    floor_features = row_features(floor)
    candidates: list[tuple[float, int]] = []
    for offset in range(560, 821):
        floor_start = max(0, 620 - offset)
        floor_end = min(330, main.shape[0] - offset)
        if floor_end - floor_start < 160:
            continue
        first = main_features[offset + floor_start : offset + floor_end]
        second = floor_features[floor_start:floor_end]
        # Normalize each feature within the shared band so pattern-independent
        # illumination shape drives the estimate.
        first = (first - first.mean(axis=0)) / (first.std(axis=0) + 1e-6)
        second = (second - second.mean(axis=0)) / (second.std(axis=0) + 1e-6)
        score = float(np.mean((first - second) ** 2))
        candidates.append((score, offset))

    print("best low-frequency vertical offsets (main_y = floor_y + offset):")
    for score, offset in sorted(candidates)[:8]:
        print(f"  offset={offset}px, normalized error={score:.4f}")


if __name__ == "__main__":
    arguments = parse_args()
    describe_alignment(arguments.main, arguments.floor)
