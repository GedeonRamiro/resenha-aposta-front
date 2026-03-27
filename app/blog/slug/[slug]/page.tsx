import TiTleSeparator from "@/components/TiTleSeparator";
import BreadcrumbNav from "@/components/BreadcrumbNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getBlogPostBySlug } from "@/lib/blog-posts";
import BlogMarkdown from "../../components/BlogMarkdown";

export default async function BlogPostDetailBySlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let post = null;

  try {
    post = await getBlogPostBySlug(slug);
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
          </div>
          <p className="text-xs text-muted-foreground">
            Atualizado em{" "}
            {new Date(post.updatedAt).toLocaleString("pt-BR", {
              dateStyle: "short",
              timeStyle: "short",
            })}
          </p>
        </CardHeader>
        <CardContent>
          <BlogMarkdown content={post.content} />
        </CardContent>
      </Card>
    </>
  );
}
