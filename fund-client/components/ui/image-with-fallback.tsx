"use client";

import { useState } from "react";
import Image from "next/image";

interface ImageWithFallbackProps {
  src: string;
  alt: string;
  fallback?: string;
  className?: string;
  width?: number;
  height?: number;
  fill?: boolean;
  priority?: boolean;
  sizes?: string;
}

export function ImageWithFallback({
  src,
  alt,
  fallback = "/placeholder.jpg",
  className = "",
  width,
  height,
  fill = false,
  priority = false,
  sizes,
}: ImageWithFallbackProps) {
  const [imgSrc, setImgSrc] = useState(src);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (imgSrc !== fallback) {
      setImgSrc(fallback);
      setHasError(true);
    }
    setIsLoading(false);
  };

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  if (fill) {
    return (
      <div className={`relative ${className}`}>
        {isLoading && (
          <div className="absolute inset-0 bg-muted animate-pulse rounded" />
        )}
        <Image
          src={imgSrc}
          alt={alt}
          fill
          className={`object-cover transition-opacity duration-300 ${
            isLoading ? "opacity-0" : "opacity-100"
          } ${className}`}
          onError={handleError}
          onLoad={handleLoad}
          priority={priority}
          sizes={sizes}
          unoptimized
        />
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-muted animate-pulse rounded" />
      )}
      <Image
        src={imgSrc}
        alt={alt}
        width={width || 400}
        height={height || 300}
        className={`object-cover transition-opacity duration-300 ${
          isLoading ? "opacity-0" : "opacity-100"
        }`}
        onError={handleError}
        onLoad={handleLoad}
        priority={priority}
        sizes={sizes}
        unoptimized
      />
    </div>
  );
}
