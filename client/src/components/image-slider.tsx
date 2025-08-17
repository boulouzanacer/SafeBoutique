import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface SliderImage {
  id: number;
  title: string;
  description: string;
  image: string;
  linkUrl?: string;
  isActive: boolean;
  sortOrder: number;
}

export default function ImageSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Fetch active slider images
  const { data: sliderImages = [], isLoading } = useQuery<SliderImage[]>({
    queryKey: ["/api/slider-images"],
  });

  // Auto-advance slider every 5 seconds
  useEffect(() => {
    if (sliderImages.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % sliderImages.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [sliderImages.length]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => 
      prev === 0 ? sliderImages.length - 1 : prev - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % sliderImages.length);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  // Show loading state
  if (isLoading) {
    return (
      <section className="relative bg-gradient-to-r from-primary to-blue-600 text-white py-20">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-pulse">
            <div className="h-12 bg-white/20 rounded mb-4 mx-auto max-w-lg"></div>
            <div className="h-6 bg-white/20 rounded mb-8 mx-auto max-w-md"></div>
          </div>
        </div>
      </section>
    );
  }

  // Show default hero if no slider images
  if (sliderImages.length === 0) {
    return (
      <section className="relative bg-gradient-to-r from-primary to-blue-600 text-white py-20" data-testid="hero-section">
        <div
          className="absolute inset-0 bg-gradient-to-br from-blue-600 via-primary to-blue-800 opacity-90"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&auto=format&fit=crop&w=1926&h=600')",
            backgroundSize: "cover",
            backgroundPosition: "center"
          }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold mb-4" data-testid="text-hero-title">
            Premium Products for Professionals
          </h1>
          <p className="text-xl mb-8 text-blue-100" data-testid="text-hero-subtitle">
            Discover our curated collection of high-quality products with fast delivery
          </p>
          <Button
            size="lg"
            className="bg-accent text-white hover:bg-yellow-500 transition-colors"
            onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })}
            data-testid="button-shop-now"
          >
            Shop Now
          </Button>
        </div>
      </section>
    );
  }

  const currentSlide = sliderImages[currentIndex];

  return (
    <section className="relative h-96 md:h-[500px] overflow-hidden" data-testid="image-slider">
      <div className="relative w-full h-full">
        {/* Current slide */}
        <div
          className="absolute inset-0 bg-cover bg-center transition-all duration-500"
          style={{
            backgroundImage: `url('${currentSlide.image}')`,
          }}
        >
          <div className="absolute inset-0 bg-black/40" />
        </div>

        {/* Content overlay */}
        <div className="relative z-10 h-full flex items-center justify-center text-center text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 
              className="text-4xl md:text-6xl font-bold mb-4 drop-shadow-lg" 
              data-testid={`text-slide-title-${currentSlide.id}`}
            >
              {currentSlide.title}
            </h1>
            <p 
              className="text-lg md:text-xl mb-8 text-gray-100 drop-shadow-md"
              data-testid={`text-slide-description-${currentSlide.id}`}
            >
              {currentSlide.description}
            </p>
            <div className="flex gap-4 justify-center">
              {currentSlide.linkUrl && (
                <Button
                  size="lg"
                  className="bg-accent text-white hover:bg-yellow-500 transition-colors"
                  onClick={() => window.open(currentSlide.linkUrl, '_blank')}
                  data-testid={`button-slide-link-${currentSlide.id}`}
                >
                  Learn More
                </Button>
              )}
              <Button
                size="lg"
                variant="outline"
                className="bg-white/10 text-white border-white/30 hover:bg-white/20 backdrop-blur-sm"
                onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })}
                data-testid="button-shop-now"
              >
                Shop Now
              </Button>
            </div>
          </div>
        </div>

        {/* Navigation arrows */}
        {sliderImages.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="sm"
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-black/20 text-white hover:bg-black/40 backdrop-blur-sm rounded-full p-2"
              onClick={goToPrevious}
              data-testid="button-prev-slide"
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-black/20 text-white hover:bg-black/40 backdrop-blur-sm rounded-full p-2"
              onClick={goToNext}
              data-testid="button-next-slide"
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          </>
        )}

        {/* Dot indicators */}
        {sliderImages.length > 1 && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
            {sliderImages.map((_, index) => (
              <button
                key={index}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === currentIndex 
                    ? 'bg-white' 
                    : 'bg-white/50 hover:bg-white/75'
                }`}
                onClick={() => goToSlide(index)}
                data-testid={`button-slide-indicator-${index}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}