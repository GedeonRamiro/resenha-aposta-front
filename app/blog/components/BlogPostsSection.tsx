"use client";

import { useEffect, useState } from "react";

import PaginationShadcn from "@/components/PaginationShadcn";
import { useBackendUser } from "@/lib/useBackendUser";
import { BlogPostsApiResponse, getBlogPosts } from "@/lib/blog-posts";
import BlogPostCard from "./BlogPostCard";

type BlogPostsSectionProps = {
  initialPosts: BlogPostsApiResponse | null;
  initialError: string;
  currentPage: number;
  query?: string;
};

export function BlogPostsSection({
  initialPosts,
  initialError,
  currentPage,
  query,
}: BlogPostsSectionProps) {
  const { isAdmin, isLoading } = useBackendUser();
  const [posts, setPosts] = useState<BlogPostsApiResponse | null>(initialPosts);
  const [postsError, setPostsError] = useState(initialError);

  useEffect(() => {
    setPosts(initialPosts);
    setPostsError(initialError);
  }, [initialPosts, initialError]);

  useEffect(() => {
    if (isLoading || !isAdmin) {
      return;
    }

    let isCancelled = false;

    async function refreshPostsForAdmin() {
      try {
        const data = await getBlogPosts(currentPage, query);

        if (!isCancelled) {
          setPosts(data);
          setPostsError("");
        }
      } catch (error: unknown) {
        if (!isCancelled) {
          setPostsError(
            error instanceof Error
              ? error.message
              : "Nao foi possivel carregar os posts do blog.",
          );
        }
      }
    }

    refreshPostsForAdmin();

    return () => {
      isCancelled = true;
    };
  }, [currentPage, isAdmin, isLoading, query]);

  const hasPosts = Boolean(posts && Array.isArray(posts.data));
  const postsData = posts?.data ?? [];
  const visiblePosts = isAdmin
    ? postsData
    : postsData.filter((post) => post.published);

  return (
    <>
      {postsError ? <p className="text-sm text-red-600">{postsError}</p> : null}

      {!hasPosts ? (
        <p className="text-sm text-muted-foreground">
          Nao foi possivel carregar os dados do blog.
        </p>
      ) : visiblePosts.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Nenhum post encontrado para os filtros aplicados.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visiblePosts.map((post) => (
            <BlogPostCard key={post.id} post={post} />
          ))}
        </div>
      )}

      {hasPosts && visiblePosts.length !== 0 ? (
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
