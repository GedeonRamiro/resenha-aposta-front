"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import {
  CarouselApi,
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { IBlogPost } from "@/types/types";
import { formatDate, getExcerpt } from "./utils";

const surfaceCardClassName =
  "border border-primary/25 bg-linear-to-b from-primary/8 via-card to-primary/4 shadow-[0_20px_55px_-44px_rgba(234,88,12,0.55)] ring-primary/20";

interface BlogHighlightProps {
  posts: IBlogPost[];
}

export default function BlogHighlight({ posts }: BlogHighlightProps) {
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [snapCount, setSnapCount] = useState(0);

  useEffect(() => {
    if (!carouselApi) {
      return;
    }

    const updateIndicators = () => {
      setSelectedIndex(carouselApi.selectedScrollSnap());
      setSnapCount(carouselApi.scrollSnapList().length);
    };

    updateIndicators();
    carouselApi.on("select", updateIndicators);
    carouselApi.on("reInit", updateIndicators);

    return () => {
      carouselApi.off("select", updateIndicators);
      carouselApi.off("reInit", updateIndicators);
    };
  }, [carouselApi]);

  useEffect(() => {
    if (!carouselApi || posts.length <= 1) {
      return;
    }

    const intervalId = window.setInterval(() => {
      carouselApi.scrollNext();
    }, 5000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [carouselApi, posts.length]);

  return (
    <Card className={surfaceCardClassName}>
      <CardHeader className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <CardTitle>Blog em destaque</CardTitle>
            <CardDescription>
              Conteudos recentes em carrossel para uma leitura mais leve.
            </CardDescription>
          </div>

          <Button
            asChild
            variant="outline"
            size="sm"
            className="border-primary/15"
          >
            <Link href="/blog">Todos os posts</Link>
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {posts.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nenhum post disponivel.
          </p>
        ) : (
          <>
            <Carousel
              className="w-full"
              setApi={setCarouselApi}
              opts={{ loop: true }}
            >
              <CarouselContent>
                {posts.map((post) => (
                  <CarouselItem
                    key={post.id}
                    className="md:basis-1/2 xl:basis-full 2xl:basis-1/2"
                  >
                    <div className="flex h-full flex-col rounded-[1.4rem] border border-primary/15 bg-background/90 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <Badge
                          variant="outline"
                          className="rounded-full border-primary/15 bg-primary/6 px-3 py-1 text-primary"
                        >
                          Blog
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(post.createdAt)}
                        </span>
                      </div>

                      <div className="mt-4 flex-1 space-y-3">
                        <h3 className="text-lg font-semibold leading-snug text-balance">
                          {post.title}
                        </h3>
                        <p className="text-sm leading-6 text-muted-foreground">
                          {getExcerpt(post.content, 120)}
                        </p>
                      </div>

                      <Button
                        asChild
                        variant="ghost"
                        className="mt-4 w-fit px-0 text-primary hover:bg-transparent hover:text-primary/80"
                      >
                        <Link href={`/blog/slug/${post.slug}`}>
                          Ler post
                          <ArrowRight className="size-4" />
                        </Link>
                      </Button>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>

            {snapCount > 1 ? (
              <div className="mt-4 flex items-center justify-center gap-2">
                {Array.from({ length: snapCount }).map((_, index) => {
                  const isActive = selectedIndex === index;

                  return (
                    <button
                      key={`blog-indicator-${index}`}
                      type="button"
                      onClick={() => carouselApi?.scrollTo(index)}
                      aria-label={`Ir para slide ${index + 1} de posts`}
                      className={
                        isActive
                          ? "h-2.5 w-8 rounded-full bg-primary transition-all duration-300"
                          : "h-2.5 w-2.5 rounded-full bg-primary/30 transition-all duration-300 hover:bg-primary/50"
                      }
                    />
                  );
                })}
              </div>
            ) : null}
          </>
        )}
      </CardContent>
    </Card>
  );
}
