import Link from "next/link";
import { X } from "lucide-react";

import PaginationShadcn from "@/components/PaginationShadcn";
import TiTleSeparator from "@/components/TiTleSeparator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getBlogPosts } from "@/lib/blog-posts";
import { BlogAdminCreateButton } from "./components/BlogAdminCreateButton";
import BlogPostCard from "./components/BlogPostCard";

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

  const hasPosts = Boolean(posts && Array.isArray(posts.data));
  const postsData = posts?.data ?? [];

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

      {postsError ? <p className="text-sm text-red-600">{postsError}</p> : null}

      {!hasPosts ? (
        <p className="text-sm text-muted-foreground">
          Nao foi possivel carregar os dados do blog.
        </p>
      ) : postsData.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Nenhum post encontrado para os filtros aplicados.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {postsData.map((post) => (
            <BlogPostCard key={post.id} post={post} />
          ))}
        </div>
      )}

      {hasPosts && postsData.length !== 0 ? (
        <div className="py-4">
          <PaginationShadcn
            count={posts?.count}
            currentPage={currentPage}
            nextPage={posts?.nextPage}
            lastPage={posts?.lastPage}
            prevPage={posts?.prevPage}
          />
        </div>
      ) : null}
    </>
  );
}
