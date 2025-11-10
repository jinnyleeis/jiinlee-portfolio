"use client";

import Image from "next/image";

export function CoverZoom({
  src,
  alt,
  aspect = "aspect-[16/9]",
}: {
  src: string;
  alt: string;
  aspect?: string;
}) {
  const onOpen = () => {
    if (typeof window === "undefined") return;
    window.dispatchEvent(new CustomEvent("open-lightbox-external", { detail: { src } }));
  };

  return (
    <div
      className={`relative w-full ${aspect} rounded-2xl overflow-hidden group cursor-zoom-in`}
      onClick={onOpen}
    >
      <Image
        src={src}
        alt={alt}
        fill
        className="object-contain object-center "
        priority
      />
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
        <span className="rounded-full bg-black/60 text-white px-3 py-1 text-xs">
          클릭하여 확대
        </span>
      </div>
    </div>
  );
}
