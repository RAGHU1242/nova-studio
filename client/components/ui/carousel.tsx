/* --- THEME UPGRADED CAROUSEL --- */
import * as React from "react";
import useEmblaCarousel, { type UseEmblaCarouselType } from "embla-carousel-react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type CarouselApi = UseEmblaCarouselType[1];
type CarouselProps = {
  opts?: Parameters<typeof useEmblaCarousel>[0];
  plugins?: Parameters<typeof useEmblaCarousel>[1];
  orientation?: "horizontal" | "vertical";
  setApi?: (api: CarouselApi) => void;
};

const CarouselContext = React.createContext<any>(null);
const useCarousel = () => React.useContext(CarouselContext);

const Carousel = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & CarouselProps>(
  ({ orientation = "horizontal", opts, setApi, plugins, className, children, ...props }, ref) => {
    const [carouselRef, api] = useEmblaCarousel(
      { ...opts, axis: orientation === "horizontal" ? "x" : "y" },
      plugins
    );

    const [canScrollPrev, setCanScrollPrev] = React.useState(false);
    const [canScrollNext, setCanScrollNext] = React.useState(false);

    const onSelect = React.useCallback((api: CarouselApi) => {
      if (api) {
        setCanScrollPrev(api.canScrollPrev());
        setCanScrollNext(api.canScrollNext());
      }
    }, []);

    React.useEffect(() => {
      if (api) {
        onSelect(api);
        api.on("select", onSelect);
        api.on("reInit", onSelect);
      }
    }, [api, onSelect]);

    return (
      <CarouselContext.Provider value={{ carouselRef, api, orientation, canScrollPrev, canScrollNext }}>
        <div
          ref={ref}
          className={cn(
            "relative rounded-xl bg-gradient-to-br from-white/5 to-white/2 backdrop-blur-sm shadow-lg border border-white/10",
            className
          )}
          {...props}
        >
          {children}
        </div>
      </CarouselContext.Provider>
    );
  }
);
Carousel.displayName = "Carousel";

const CarouselContent = React.forwardRef<HTMLDivElement, any>(({ className, ...props }, ref) => {
  const { carouselRef, orientation } = useCarousel();
  return (
    <div ref={carouselRef} className="overflow-hidden">
      <div
        ref={ref}
        className={cn(
          "flex",
          orientation === "horizontal" ? "-ml-4" : "-mt-4 flex-col",
          className
        )}
        {...props}
      />
    </div>
  );
});
CarouselContent.displayName = "CarouselContent";

const CarouselItem = React.forwardRef<HTMLDivElement, any>(({ className, ...props }, ref) => {
  const { orientation } = useCarousel();
  return (
    <div
      ref={ref}
      className={cn(
        "min-w-0 shrink-0 grow-0 basis-full rounded-xl p-2",
        orientation === "horizontal" ? "pl-4" : "pt-4",
        className
      )}
      {...props}
    />
  );
});
CarouselItem.displayName = "CarouselItem";

const CarouselPrevious = React.forwardRef<HTMLButtonElement, any>(
  ({ className, ...props }, ref) => {
    const { canScrollPrev } = useCarousel();
    return (
      <Button
        ref={ref}
        size="icon"
        variant="outline"
        disabled={!canScrollPrev}
        className={cn(
          "absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/20 backdrop-blur border-white/30 shadow-md",
          className
        )}
        {...props}
      >
        <ArrowLeft className="h-4 w-4" />
      </Button>
    );
  }
);
CarouselPrevious.displayName = "CarouselPrevious";

const CarouselNext = React.forwardRef<HTMLButtonElement, any>(
  ({ className, ...props }, ref) => {
    const { canScrollNext } = useCarousel();
    return (
      <Button
        ref={ref}
        size="icon"
        variant="outline"
        disabled={!canScrollNext}
        className={cn(
          "absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/20 backdrop-blur border-white/30 shadow-md",
          className
        )}
        {...props}
      >
        <ArrowRight className="h-4 w-4" />
      </Button>
    );
  }
);

export { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext };
