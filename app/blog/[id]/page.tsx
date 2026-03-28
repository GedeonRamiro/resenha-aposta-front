import Link from "next/link";

import TiTleSeparator from "@/components/TiTleSeparator";
import BreadcrumbNav from "@/components/BreadcrumbNav";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getBlogPostById } from "@/lib/blog-posts";
import { formatDateTimeBR } from "@/lib/date-time";
import BlogMarkdown from "../components/BlogMarkdown";

export default async function BlogPostDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let post = null;

  try {
    post = await getBlogPostById(id);
  } catch {
    return (
      <p className="text-sm text-muted-foreground">Post nao encontrado.</p>
    );
  }

  return (
    <>
      <BreadcrumbNav
        items={[
          { label: "Home", href: "/" },
          { label: "Blog", href: "/blog" },
          { label: post.title },
        ]}
      />
      <TiTleSeparator title="Detalhes do Post" />

      <Card>
        <CardHeader className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <CardTitle>{post.title}</CardTitle>
            <Badge variant={post.published ? "default" : "outline"}>
              {post.published ? "Publicado" : "Rascunho"}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            ID: {post.id} | Atualizado em {formatDateTimeBR(post.updatedAt)}
          </p>
        </CardHeader>
        <CardContent>
          <BlogMarkdown content={post.content} />
        </CardContent>
      </Card>

      <div className="mt-6 flex gap-2">
        <Button asChild variant="outline">
          <Link href="/blog">Voltar</Link>
        </Button>
        <Button asChild>
          <Link href={`/blog/${post.id}/edit`}>Editar</Link>
        </Button>
      </div>
    </>
  );
}
