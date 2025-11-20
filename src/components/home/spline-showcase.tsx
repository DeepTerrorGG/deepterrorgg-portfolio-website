
'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '../ui/skeleton';

const SplineModel = dynamic(
  () => import('@/components/home/spline-model'),
  { 
    ssr: false,
    loading: () => <Skeleton className="w-full h-full" />
  }
);

interface SplineShowcaseProps {
  models: {
    url: string;
    title: string;
  }[];
}

export default function SplineShowcase({ models }: SplineShowcaseProps) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  React.useEffect(() => {
    if (!api) {
      return;
    }
    setCurrent(api.selectedScrollSnap());
    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  return (
    <div className="w-full">
      <Carousel setApi={setApi} className="w-full">
        <CarouselContent>
          {models.map((model, index) => (
            <CarouselItem key={index}>
              <Card className="border-none">
                <CardContent className="relative p-0 h-[500px] md:h-[700px] w-full mx-auto rounded-lg overflow-hidden bg-muted/20 min-h-[500px]">
                  <SplineModel sceneUrl={model.url} />
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 z-10" />
        <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 z-10" />
      </Carousel>
    </div>
  );
}
