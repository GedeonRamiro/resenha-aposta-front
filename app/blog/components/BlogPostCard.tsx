"use client";

import Link from "next/link";
import { ImageOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ConfirmAction } from "@/components/ConfirmAction";
import { IBlogPost } from "@/types/types";
import { useBackendUser } from "@/lib/useBackendUser";
import { formatDateTimeBR } from "@/lib/date-time";

interface BlogPostCardProps {
  post: IBlogPost;
}

function extractFirstImageUrl(markdown: string): string | null {
  const markdownImageMatch = markdown.match(
    /!\[[^\]]*\]\((https?:\/\/[^\s)]+)\)/i,
  );
  if (markdownImageMatch?.[1]) {
    return markdownImageMatch[1];
  }

  const htmlImageMatch = markdown.match(
    /<img[^>]+src=["'](https?:\/\/[^"']+)["'][^>]*>/i,
  );
  if (htmlImageMatch?.[1]) {
    return htmlImageMatch[1];
  }

  return null;
}

function toPlainText(markdown: string): string {
  return markdown
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/`{1,3}[^`]*`{1,3}/g, " ")
    .replace(/[#>*_~\-]/g, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getReadingTimeLabel(text: string): string {
  const words = text.split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(words / 220));
  return `${minutes} min de leitura`;
}

export default function BlogPostCard({ post }: BlogPostCardProps) {
  const { isAdmin, isLoading } = useBackendUser();

  const plainText = toPlainText(post.content);
  const excerpt =
    plainText.length > 320 ? `${plainText.slice(0, 320).trim()}...` : plainText;
  const coverImageUrl = extractFirstImageUrl(post.content);
  const readingTimeLabel = getReadingTimeLabel(plainText);

  const canManagePost = !isLoading && isAdmin;
  const postHref =
    canManagePost && !post.published
      ? `/blog/${post.id}/edit`
      : `/blog/slug/${post.slug}`;

  return (
    <Card className="h-full flex flex-col transition-shadow hover:shadow-lg">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="line-clamp-2 leading-snug">
            <Link
              href={postHref}
              className="hover:underline underline-offset-4"
            >
              {post.title}
            </Link>
          </CardTitle>
          {canManagePost ? (
            <Badge variant={post.published ? "default" : "outline"}>
              {post.published ? "Publicado" : "Rascunho"}
            </Badge>
          ) : null}
        </div>
        <p className="text-xs text-muted-foreground">
          {formatDateTimeBR(post.createdAt)}
          {` • ${readingTimeLabel}`}
        </p>
      </CardHeader>
      <CardContent className="flex-1">
        <Link href={postHref} className="block">
          <div className="space-y-3 text-muted-foreground">
            {coverImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={coverImageUrl}
                alt={`Capa do post ${post.title}`}
                className="h-44 w-full rounded-md object-cover"
                loading="lazy"
              />
            ) : (
              <div className="flex h-44 w-full flex-col items-center justify-center gap-2 rounded-md border border-dashed bg-muted/30 text-muted-foreground">
                <ImageOff className="h-5 w-5" />
                <p className="text-xs">Sem imagem de capa</p>
              </div>
            )}

            <p className="line-clamp-6 text-sm leading-6">{excerpt}</p>
          </div>
        </Link>
      </CardContent>

      {canManagePost ? (
        <CardFooter className="flex items-center justify-between gap-2">
          <Button asChild size="sm" variant="outline">
            <Link href={`/blog/${post.id}/edit`}>Editar</Link>
          </Button>

          <ConfirmAction
            id={post.id}
            endpoint="/blog-posts"
            title="Excluir post?"
            description="Esse post sera removido permanentemente."
          />
        </CardFooter>
      ) : null}
    </Card>
  );
}
