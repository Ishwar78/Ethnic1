import { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ProductImageGalleryProps {
  images: string[];
  productName: string;
  discount?: number;
}

export default function ProductImageGallery({ 
  images, 
  productName, 
  discount = 0 
}: ProductImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);

  // Handle swipe gestures
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;

    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;

    if (Math.abs(diff) > 50) {
      if (diff > 0 && selectedImage < images.length - 1) {
        setSelectedImage(selectedImage + 1);
      } else if (diff < 0 && selectedImage > 0) {
        setSelectedImage(selectedImage - 1);
      }
    }

    setTouchStart(null);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" && selectedImage > 0) {
        setSelectedImage(selectedImage - 1);
      } else if (e.key === "ArrowRight" && selectedImage < images.length - 1) {
        setSelectedImage(selectedImage + 1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedImage, images.length]);

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div
        ref={imageContainerRef}
        className="relative aspect-[3/4] rounded-lg overflow-hidden bg-muted group"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <img
          src={images[selectedImage]}
          alt={`${productName} - Image ${selectedImage + 1}`}
          className="w-full h-full object-cover"
          draggable={false}
        />

        {/* Discount Badge */}
        {discount > 0 && (
          <span className="absolute top-4 left-4 bg-destructive text-destructive-foreground font-bold px-3 py-1.5 rounded z-10">
            -{discount}% OFF
          </span>
        )}

        {/* Mobile Navigation Arrows */}
        <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between px-2 md:hidden pointer-events-none">
          <Button
            variant="secondary"
            size="icon"
            className={cn(
              "h-10 w-10 rounded-full shadow-lg pointer-events-auto transition-opacity",
              selectedImage === 0 && "opacity-0"
            )}
            onClick={(e) => {
              e.stopPropagation();
              if (selectedImage > 0) setSelectedImage(selectedImage - 1);
            }}
            disabled={selectedImage === 0}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            className={cn(
              "h-10 w-10 rounded-full shadow-lg pointer-events-auto transition-opacity",
              selectedImage === images.length - 1 && "opacity-0"
            )}
            onClick={(e) => {
              e.stopPropagation();
              if (selectedImage < images.length - 1) setSelectedImage(selectedImage + 1);
            }}
            disabled={selectedImage === images.length - 1}
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>

        {/* Mobile Dots Indicator */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 md:hidden">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => setSelectedImage(index)}
              className={cn(
                "w-2 h-2 rounded-full transition-all",
                selectedImage === index
                  ? "bg-primary w-6"
                  : "bg-background/60"
              )}
            />
          ))}
        </div>
      </div>

      {/* Thumbnails - Desktop */}
      <div className="hidden md:flex gap-3">
        {images.map((img, index) => (
          <button
            key={index}
            onClick={() => setSelectedImage(index)}
            className={cn(
              "w-20 h-24 rounded-md overflow-hidden border-2 transition-all",
              selectedImage === index
                ? "border-primary ring-2 ring-primary/20"
                : "border-transparent hover:border-muted-foreground"
            )}
          >
            <img 
              src={img} 
              alt={`${productName} thumbnail ${index + 1}`} 
              className="w-full h-full object-cover" 
              loading="lazy"
            />
          </button>
        ))}
      </div>

      {/* Thumbnail Strip - Mobile */}
      <div className="flex md:hidden gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
        {images.map((img, index) => (
          <button
            key={index}
            onClick={() => setSelectedImage(index)}
            className={cn(
              "flex-shrink-0 w-16 h-20 rounded-md overflow-hidden border-2 transition-all",
              selectedImage === index
                ? "border-primary"
                : "border-transparent"
            )}
          >
            <img 
              src={img} 
              alt="" 
              className="w-full h-full object-cover" 
              loading="lazy"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
