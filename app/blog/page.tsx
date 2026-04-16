import Link from "next/link";
import { X } from "lucide-react";

import TiTleSeparator from "@/components/TiTleSeparator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getBlogPosts } from "@/lib/blog-posts";
import { BlogAdminCreateButton } from "./components/BlogAdminCreateButton";
import { BlogPostsSection } from "./components/BlogPostsSection";

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    query?: string;
  }>;
}) {
  const params = await searchParams;
  const currentPage = Number.parseInt(params.page ?? "1");
  const query = params.query;
  const hasSearchQuery = Boolean(query?.trim());

  let posts = null;
  let postsError = "";

  try {
    posts = await getBlogPosts(currentPage, query);
  } catch (error: unknown) {
    postsError =
      error instanceof Error
        ? error.message
        : "Nao foi possivel carregar os posts do blog.";
  }

  return (
    <>
      <TiTleSeparator title="Blog" />

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <form className="flex w-full max-w-xl items-center gap-2" method="GET">
          <Input
            className="border-primary"
            name="query"
            defaultValue={query}
            placeholder="Pesquisar por titulo ou conteudo"
          />
          <Button type="submit" variant="outline">
            Buscar
          </Button>
          {hasSearchQuery ? (
            <Button asChild variant="ghost" size="sm">
              <Link href="/blog" aria-label="Limpar filtro de busca">
                <X className="h-4 w-4" />
                Limpar
              </Link>
            </Button>
          ) : null}
        </form>

        <BlogAdminCreateButton />
      </div>

      <BlogPostsSection
        initialPosts={posts}
        initialError={postsError}
        currentPage={currentPage}
        query={query}
      />
    </>
  );
}
