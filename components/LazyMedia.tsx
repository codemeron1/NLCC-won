/**
 * Lazy Loading Media Components
 * Optimized image and audio loading with Intersection Observer
 */

'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

interface LazyImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  onLoad?: () => void;
  placeholder?: string;
}

/**
 * Lazy-loaded image component with progressive loading
 */
export const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
  onLoad,
  placeholder = 'blur',
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (priority) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '50px', // Start loading 50px before the image is in view
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [priority]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  return (
    <div ref={imgRef} className={`relative overflow-hidden ${className}`}>
      {isInView ? (
        <>
          {/* Placeholder blur effect */}
          {!isLoaded && (
            <div className="absolute inset-0 bg-gray-200 animate-pulse" />
          )}
          
          {width && height ? (
            <Image
              src={src}
              alt={alt}
              width={width}
              height={height}
              className={`transition-opacity duration-300 ${
                isLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={handleLoad}
              priority={priority}
            />
          ) : (
            <img
              src={src}
              alt={alt}
              className={`w-full h-full object-cover transition-opacity duration-300 ${
                isLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={handleLoad}
              loading={priority ? 'eager' : 'lazy'}
            />
          )}
        </>
      ) : (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
    </div>
  );
};

interface LazyAudioProps {
  src: string;
  className?: string;
  controls?: boolean;
  autoPlay?: boolean;
  onLoad?: () => void;
}

/**
 * Lazy-loaded audio component
 */
export const LazyAudio: React.FC<LazyAudioProps> = ({
  src,
  className = '',
  controls = true,
  autoPlay = false,
  onLoad,
}) => {
  const [isInView, setIsInView] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const audioRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '100px',
      }
    );

    if (audioRef.current) {
      observer.observe(audioRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  return (
    <div ref={audioRef} className={className}>
      {isInView ? (
        <>
          {!isLoaded && (
            <div className="w-full h-12 bg-gray-200 animate-pulse rounded" />
          )}
          <audio
            src={src}
            controls={controls}
            autoPlay={autoPlay}
            onLoadedData={handleLoad}
            preload="metadata"
            className={`w-full ${isLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity`}
          >
            Your browser does not support the audio element.
          </audio>
        </>
      ) : (
        <div className="w-full h-12 bg-gray-200 animate-pulse rounded" />
      )}
    </div>
  );
};

interface LazyMediaGalleryProps {
  images: Array<{ url: string; alt: string; id: string }>;
  className?: string;
  onImageClick?: (imageUrl: string) => void;
}

/**
 * Lazy-loaded image gallery with grid layout
 */
export const LazyMediaGallery: React.FC<LazyMediaGalleryProps> = ({
  images,
  className = '',
  onImageClick,
}) => {
  return (
    <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 ${className}`}>
      {images.map((image) => (
        <div
          key={image.id}
          className="aspect-square cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => onImageClick?.(image.url)}
        >
          <LazyImage
            src={image.url}
            alt={image.alt}
            className="w-full h-full rounded-lg"
          />
        </div>
      ))}
    </div>
  );
};

/**
 * Progressive image loader with multiple quality levels
 */
interface ProgressiveImageProps {
  lowQualitySrc: string;
  highQualitySrc: string;
  alt: string;
  className?: string;
}

export const ProgressiveImage: React.FC<ProgressiveImageProps> = ({
  lowQualitySrc,
  highQualitySrc,
  alt,
  className = '',
}) => {
  const [currentSrc, setCurrentSrc] = useState(lowQualitySrc);
  const [isHighQualityLoaded, setIsHighQualityLoaded] = useState(false);

  useEffect(() => {
    const img = document.createElement('img');
    img.src = highQualitySrc;
    img.onload = () => {
      setCurrentSrc(highQualitySrc);
      setIsHighQualityLoaded(true);
    };
  }, [highQualitySrc]);

  return (
    <img
      src={currentSrc}
      alt={alt}
      className={`${className} ${!isHighQualityLoaded ? 'blur-sm' : ''} transition-all duration-300`}
    />
  );
};
