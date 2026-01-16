import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getVideoSource } from "@/lib/videoUtils";
import heroImage1 from "@/assets/hero-model-1.jpg";
import heroImage2 from "@/assets/hero-model-2.jpg";
import heroImage3 from "@/assets/hero-model-3.jpg";

interface HeroSlide {
  _id?: string;
  image?: string;
  video?: string;
  gif?: string;
  title: string;
  subtitle: string;
  description: string;
  cta: string;
  ctaLink: string;
  mediaUrl?: string;
  mediaType?: 'video' | 'gif' | 'image';
}

const defaultSlides: HeroSlide[] = [
  {
    image: heroImage1,
    title: "New Arrivals",
    subtitle: "Festive Suit Collection",
    description: "Discover exquisite handcrafted ethnic wear for every occasion",
    cta: "Shop Now",
    ctaLink: "/shop?category=new-arrivals",
  },
  {
    image: heroImage2,
    title: "Exclusive",
    subtitle: "Royal Lehenga Collection",
    description: "Timeless elegance meets contemporary design",
    cta: "Explore Collection",
    ctaLink: "/shop?category=lehengas",
  },
  {
    image: heroImage3,
    title: "Bridal Edit",
    subtitle: "Wedding Season Special",
    description: "Make your special day unforgettable",
    cta: "View Collection",
    ctaLink: "/shop?category=bridal",
  },
];

export default function HeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [slides, setSlides] = useState<HeroSlide[]>(defaultSlides);

  const API_URL = import.meta.env.VITE_API_URL || '/api';

  // Fetch hero media from API
  useEffect(() => {
    const fetchHeroMedia = async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

        const response = await fetch(`${API_URL}/hero-media`, {
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json',
          },
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          console.warn(`Hero media API returned ${response.status}, using default slides`);
          return;
        }

        const data = await response.json();
        if (data.success && data.media && data.media.length > 0) {
          setSlides(data.media);
          console.log('✅ Hero media loaded successfully');
        }
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          console.warn('Hero media fetch timeout, using default slides');
        } else {
          console.warn('Hero media API unavailable, using default slides');
        }
        // Keep default slides on error - this is expected behavior
      }
    };

    fetchHeroMedia();
  }, [API_URL]);

  const goToSlide = useCallback((index: number) => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentSlide(index);
    setTimeout(() => setIsAnimating(false), 800);
  }, [isAnimating]);

  const nextSlide = useCallback(() => {
    goToSlide((currentSlide + 1) % slides.length);
  }, [currentSlide, goToSlide]);

  const prevSlide = useCallback(() => {
    goToSlide((currentSlide - 1 + slides.length) % slides.length);
  }, [currentSlide, goToSlide]);

  useEffect(() => {
    const interval = setInterval(nextSlide, 6000);
    return () => clearInterval(interval);
  }, [nextSlide]);

  return (
    <section className="relative h-screen min-h-[600px] overflow-hidden bg-gradient-hero">
      {/* Background Slides */}
      {slides.map((slide, index) => {
        const mediaUrl = slide.mediaUrl || slide.image;
        const isVideoType = slide.mediaType === 'video';
        const isGifType = slide.mediaType === 'gif';
        const videoSource = isVideoType && mediaUrl ? getVideoSource(mediaUrl) : null;
        const isYouTube = videoSource?.type === 'youtube';
        const isInstagram = videoSource?.type === 'instagram';
        const isDirectVideo = videoSource?.type === 'direct';

        return (
          <div
            key={index}
            className={cn(
              "absolute inset-0 transition-all duration-1000 ease-out",
              index === currentSlide
                ? "opacity-100 scale-100"
                : "opacity-0 scale-105"
            )}
          >
            {/* Diagonal Media Container */}
            <div className="absolute right-0 top-0 h-full w-full md:w-[65%] overflow-hidden">
              {isYouTube ? (
                <>
                  <iframe
                    src={videoSource.src}
                    className="absolute inset-0 w-full h-full object-cover transform origin-left md:skew-x-[-6deg] md:translate-x-12 scale-110"
                    allow="autoplay; fullscreen; picture-in-picture"
                    allowFullScreen
                    frameBorder="0"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-transparent md:skew-x-[-6deg] md:translate-x-12" />
                </>
              ) : isInstagram ? (
                <>
                  <div className="absolute inset-0 bg-background/50 flex items-center justify-center transform origin-left md:skew-x-[-6deg] md:translate-x-12">
                    <iframe
                      src={videoSource.src}
                      className="w-full h-full max-w-md"
                      style={{ maxHeight: '600px' }}
                      allowFullScreen
                      frameBorder="0"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-transparent md:skew-x-[-6deg] md:translate-x-12" />
                </>
              ) : isDirectVideo ? (
                <>
                  <video
                    src={videoSource.src}
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover transform origin-left md:skew-x-[-6deg] md:translate-x-12 scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-transparent md:skew-x-[-6deg] md:translate-x-12" />
                </>
              ) : (
                <>
                  <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat transform origin-left md:skew-x-[-6deg] md:translate-x-12 scale-110"
                    style={{ backgroundImage: `url(${mediaUrl})` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-transparent md:skew-x-[-6deg] md:translate-x-12" />
                </>
              )}
            </div>
          </div>
        );
      })}

      {/* Content */}
      <div className="relative z-10 h-full container mx-auto px-4">
        <div className="h-full flex items-center">
          <div className="max-w-xl">
            {slides.map((slide, index) => (
              <div
                key={index}
                className={cn(
                  "transition-all duration-700",
                  index === currentSlide
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-8 absolute pointer-events-none"
                )}
              >
                <span className="inline-block px-4 py-1.5 bg-gold/20 text-gold rounded-full text-sm font-medium mb-6 animate-fade-in">
                  {slide.title}
                </span>
                <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-4 leading-tight">
                  {slide.subtitle}
                </h1>
                <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-md">
                  {slide.description}
                </p>
                <div className="flex flex-wrap gap-4">
                  <Button variant="hero" size="xl">
                    {slide.cta}
                  </Button>
                  <Button variant="heroOutline" size="xl">
                    View All
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      <div className="absolute bottom-8 right-8 z-20 flex gap-3">
        <button
          onClick={prevSlide}
          className="h-12 w-12 rounded-full border-2 border-gold/40 flex items-center justify-center text-gold hover:bg-gold hover:text-charcoal transition-all duration-300"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          onClick={nextSlide}
          className="h-12 w-12 rounded-full border-2 border-gold/40 flex items-center justify-center text-gold hover:bg-gold hover:text-charcoal transition-all duration-300"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Slide Indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={cn(
              "h-2 rounded-full transition-all duration-300",
              index === currentSlide
                ? "w-8 bg-gold"
                : "w-2 bg-gold/30 hover:bg-gold/50"
            )}
          />
        ))}
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-1/4 left-8 w-px h-32 bg-gradient-to-b from-transparent via-gold/30 to-transparent hidden lg:block" />
      <div className="absolute bottom-1/4 left-8 w-px h-32 bg-gradient-to-b from-transparent via-gold/30 to-transparent hidden lg:block" />
    </section>
  );
}
