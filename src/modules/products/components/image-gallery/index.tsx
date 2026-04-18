"use client"

import { HttpTypes } from "@medusajs/types"
import Image from "next/image"
import { useState } from "react"

type ImageGalleryProps = {
  images: HttpTypes.StoreProductImage[]
}

const ImageGallery = ({ images }: ImageGalleryProps) => {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const selected = images[selectedIndex]

  if (!images.length) {
    return (
      <div className="aspect-square w-full bg-grey-10 flex items-center justify-center">
        <span className="font-display text-grey-40 text-2xl tracking-wider">WENOW</span>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Main image */}
      <div
        className="relative aspect-square w-full overflow-hidden bg-grey-10"
        id={selected?.id}
      >
        {selected?.url && (
          <Image
            src={selected.url}
            alt={`Imagen del producto ${selectedIndex + 1}`}
            fill
            priority={selectedIndex === 0}
            className="object-contain"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
        )}
      </div>

      {/* Thumbnail strip — only when more than 1 image */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {images.map((image, index) => (
            <button
              key={image.id}
              onClick={() => setSelectedIndex(index)}
              className={`relative flex-shrink-0 w-16 h-16 overflow-hidden border-2 transition-colors ${
                index === selectedIndex
                  ? "border-brand-magenta"
                  : "border-grey-20 hover:border-grey-40"
              }`}
            >
              {image.url && (
                <Image
                  src={image.url}
                  alt={`Miniatura ${index + 1}`}
                  fill
                  className="object-contain"
                  sizes="64px"
                />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default ImageGallery