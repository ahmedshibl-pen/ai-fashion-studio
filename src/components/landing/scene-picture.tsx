import { getImageProps } from "next/image";

type ScenePictureProps = {
  className?: string;
};

export function ScenePicture({ className }: ScenePictureProps) {
  const common = {
    alt: "",
    sizes: "100vw",
    quality: 90,
  } as const;

  const {
    props: { srcSet: desktopSrcSet },
  } = getImageProps({
    ...common,
    src: "/images/landing/studio-parquet-scene.webp",
    width: 1672,
    height: 2200,
  });

  const {
    props: { srcSet: mobileSrcSet, ...imageProps },
  } = getImageProps({
    ...common,
    src: "/images/landing/studio-parquet-scene-mobile.webp",
    width: 480,
    height: 2200,
  });

  return (
    <picture className={className}>
      <source media="(min-width: 700px)" srcSet={desktopSrcSet} />
      <source media="(max-width: 699px)" srcSet={mobileSrcSet} />
      <img {...imageProps} alt="" fetchPriority="high" />
    </picture>
  );
}
